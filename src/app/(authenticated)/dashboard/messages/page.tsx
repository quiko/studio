"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { type Conversation, type Message as MessageType } from '@/lib/constants';
import { format, isToday, isYesterday } from 'date-fns';
import { cn, capitalize } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
// AMÉLIORATION : Import de 'increment' pour les opérations atomiques
import { collection, query, orderBy, onSnapshot, doc, addDoc, serverTimestamp, updateDoc, where, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Le composant MessageBubble reste inchangé

function MessageBubble({ message, isOwnMessage, contactAvatar, contactName }: { message: MessageType; isOwnMessage: boolean; contactAvatar: string; contactName: string; }) {
  const messageDate = new Date(message.timestamp); // Supposant que timestamp est un ISO string
  const displayTime = format(messageDate, 'p');

  return (
    <div className={cn("flex items-end gap-2 mb-4", isOwnMessage ? "justify-end" : "justify-start")}> 
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 border self-start">
          <AvatarImage src={contactAvatar} alt={contactName} />
          <AvatarFallback>{contactName.substring(0,1)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[70%] p-3 rounded-xl shadow", isOwnMessage ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none")}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn("text-xs mt-1", isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>{displayTime}</p>
      </div>
    </div>
  );
}


export default function MessagesPage() {
  const { firebaseUser } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { toast } = useToast();
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // CORRIGÉ : Le `useEffect` pour les conversations est maintenant beaucoup plus efficace
  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    const q = query(
      collection(db, 'conversations'), 
      where('participants', 'array-contains', firebaseUser.uid),
      orderBy('lastMessageTimestamp', 'desc') 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // AMÉLIORATION MAJEURE : Plus de lectures de documents dans une boucle !
      const fetchedConversations = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((id: string) => id !== firebaseUser.uid) || '';
        
        // On lit les détails du contact depuis le document de conversation lui-même (dénormalisation)
        const contactDetails = data.participantDetails?.[otherParticipantId] || {};
        const contactName = contactDetails.name || 'Unknown User';
        const contactAvatar = contactDetails.avatar || '';
        const contactRole = contactDetails.role || ''; // Supposant que le rôle est aussi dénormalisé

        const lastMessageTimestamp = data.lastMessageTimestamp?.toDate ? data.lastMessageTimestamp.toDate() : new Date();

        return {
          id: docSnap.id,
          participants: data.participants,
          contactId: otherParticipantId,
          contactName,
          contactAvatar,
          contactRole,
          lastMessagePreview: data.lastMessagePreview || 'No messages yet',
          lastMessageTimestamp: lastMessageTimestamp.toISOString(),
          unreadCount: data.unreadCount?.[firebaseUser.uid] || 0,
        };
      });
      
      setConversations(fetchedConversations);
      setLoadingConversations(false);
    }, (error) => {
      console.error("Error fetching conversations:", error);
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  // Le useEffect pour les messages est déjà bien optimisé et reste inchangé
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    const qMessages = query(collection(db, 'conversations', selectedConversationId, 'messages'), orderBy('timestamp'));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp?.toDate() || new Date()).toISOString(),
      } as MessageType)));
      setLoadingMessages(false);
      requestAnimationFrame(scrollToBottom);
    });
    return () => unsubscribeMessages();
  }, [selectedConversationId]);

  // La fonction handleSelectConversation reste inchangée, elle est bien conçue
   const handleSelectConversation = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (firebaseUser?.uid) {
      const convoRef = doc(db, 'conversations', conversationId);
      // Met à jour le compteur de non-lus de manière atomique
      await updateDoc(convoRef, { [`unreadCount.${firebaseUser.uid}`]: 0 });
    }
  }, [firebaseUser?.uid]);

  // CORRIGÉ : `handleSendMessage` utilise maintenant `increment` pour une mise à jour fiable
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !firebaseUser?.uid) return;

    const messageText = newMessage.trim();
    const otherParticipantId = selectedConversation.contactId;

    const conversationRef = doc(db, 'conversations', selectedConversation.id);
    const messagesColRef = collection(conversationRef, 'messages');

    try {
      // 1. Ajouter le nouveau message à la sous-collection
      await addDoc(messagesColRef, {
        senderId: firebaseUser.uid,
        text: messageText,
        timestamp: serverTimestamp(),
      });
      
      // 2. Mettre à jour le document de conversation parent
      await updateDoc(conversationRef, {
        lastMessagePreview: messageText,
        lastMessageTimestamp: serverTimestamp(),
        // AMÉLIORATION MAJEURE : Utilisation de `increment` pour une opération atomique et sûre
        [`unreadCount.${otherParticipantId}`]: increment(1)
      });
      
      setNewMessage('');
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  }, [newMessage, selectedConversation, firebaseUser?.uid, toast]);

  // Le reste du composant (le JSX) est bien structuré et n'a pas besoin de modifications majeures.
  // Les sous-composants ConversationListItem et le rendu principal sont conservés.

  function ConversationListItem({ conversation, isSelected, onSelect }: { conversation: Conversation; isSelected: boolean; onSelect: () => void }) {
    const lastMessageDate = new Date(conversation.lastMessageTimestamp);
    const displayTime = isToday(lastMessageDate) ? format(lastMessageDate, 'p') : isYesterday(lastMessageDate) ? 'Yesterday' : format(lastMessageDate, 'MMM d');
    const fallbackInitial = conversation.contactName.substring(0, 2).toUpperCase();
 
    return (
      <button onClick={onSelect} className={cn("w-full text-left p-3 hover:bg-muted/50 transition-colors rounded-lg flex gap-3 items-start", isSelected && "bg-muted")}> 
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} />
          <AvatarFallback>{fallbackInitial}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold truncate">{conversation.contactName}</h3>
            <time className="text-xs text-muted-foreground whitespace-nowrap">{displayTime}</time>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <p className="text-xs text-muted-foreground truncate flex-1">{conversation.lastMessagePreview}</p>
            {conversation.unreadCount > 0 && <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">{conversation.unreadCount}</Badge>}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,100px))]">
      <PageHeader title="Messages" description="Communicate with artists and event organizers." />
      <Card className="flex-1 flex overflow-hidden">
        {/* Colonne de gauche : Liste des conversations */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border h-full flex flex-col">
          <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold font-headline">Chats</h2></div>
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex justify-center items-center h-full p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((convo) => (
                  <ConversationListItem key={convo.id} conversation={convo} isSelected={convo.id === selectedConversationId} onSelect={() => handleSelectConversation(convo.id)} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Colonne de droite : Vue de la conversation */}
        <div className="flex-1 flex flex-col h-full bg-background">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={selectedConversation.contactAvatar} alt={selectedConversation.contactName} />
                  <AvatarFallback>{selectedConversation.contactName.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold font-headline">{selectedConversation.contactName}</h3>
                  {selectedConversation.contactRole && <p className="text-xs text-muted-foreground">{capitalize(selectedConversation.contactRole)}</p>}
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  messages.map((msg) => <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === firebaseUser?.uid} contactAvatar={selectedConversation.contactAvatar} contactName={selectedConversation.contactName} />)
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <div className="p-4 border-t border-input bg-card">
                <div className="flex items-center gap-2">
                  <Textarea placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} rows={1} className="flex-1 resize-none" />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="h-24 w-24 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground font-headline">Select a conversation</h3>
              <p className="text-muted-foreground">Choose one of your chats to continue.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}