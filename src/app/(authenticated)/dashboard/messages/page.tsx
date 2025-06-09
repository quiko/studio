
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { type Conversation, type Message as MessageType, type UserProfile } from '@/lib/constants'; // Corrected UserProfile import
import { format, isToday, isYesterday } from 'date-fns';
import { cn, capitalize } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, serverTimestamp, updateDoc, getDoc, where, getDocs } from 'firebase/firestore'; // Added getDoc
import { useToast } from '@/hooks/use-toast';


interface MessageBubbleProps {
  message: MessageType;
  isOwnMessage: boolean;
  contactAvatar: string;
  contactName: string;
}

function MessageBubble({ message, isOwnMessage, contactAvatar, contactName }: MessageBubbleProps) {
  const messageDate = message.timestamp ? new Date(message.timestamp) : new Date();
  const displayTime = format(messageDate, 'p');

  return (
    <div className={cn("flex items-end gap-2 mb-4", isOwnMessage ? "justify-end" : "justify-start")}> 
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 border self-start">
          <AvatarImage src={contactAvatar} alt={contactName} />
          <AvatarFallback>{contactName.substring(0,1)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-xl shadow",
          isOwnMessage ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn("text-xs mt-1", isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>{displayTime}</p>
      </div>
      {isOwnMessage && <div className="h-8 w-8 flex-shrink-0" />}
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

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoadingConversations(false);
      setConversations([]); // Clear conversations if no user
      return;
    }

    setLoadingConversations(true);
    const q = query(
      collection(db, 'conversations'), 
      where('participants', 'array-contains', firebaseUser.uid),
      orderBy('lastMessageTimestamp', 'desc') 
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedConversations: Conversation[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((id: string) => id !== firebaseUser.uid);

        let contactName = 'Unknown User';
        let contactAvatar = '';
        let contactRole = '';

        if (otherParticipantId) {
          try {
            const userDocRef = doc(db, 'users', otherParticipantId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as UserProfile;
              contactName = userData.fullName || userData.email || 'Unknown User';
              contactAvatar = userData.photoURL || userData.artistProfileData?.profileImage || '';
              contactRole = userData.role || '';
            }
          } catch (error) {
            console.error("Error fetching participant profile:", error);
          }
        }
        
        const lastMessageTimestamp = data.lastMessageTimestamp?.toDate ? data.lastMessageTimestamp.toDate() : new Date(data.lastMessageTimestamp || Date.now());

        fetchedConversations.push({
          id: docSnap.id,
          participants: data.participants,
          contactId: otherParticipantId || '',
          contactName,
          contactAvatar,
          contactRole,
          lastMessagePreview: data.lastMessagePreview || 'No messages yet',
          lastMessageTimestamp: lastMessageTimestamp.toISOString(),
          unreadCount: data.unreadCount?.[firebaseUser.uid] || 0,
          messages: [], 
        });
      }
      
      setConversations(fetchedConversations);
      setLoadingConversations(false);
    }, (error) => {
      console.error("Error fetching conversations:", error);
      toast({ title: "Error", description: "Failed to load conversations. Check permissions or network.", variant: "destructive" });
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [firebaseUser?.uid, toast]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const qMessages = query(collection(db, 'conversations', selectedConversationId, 'messages'), orderBy('timestamp'));

    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const fetchedMessages: MessageType[] = snapshot.docs.map(doc => ({
        id: doc.id,
        senderId: doc.data().senderId,
        text: doc.data().text,
        timestamp: (doc.data().timestamp?.toDate() || new Date()).toISOString(),
      }));
      setMessages(fetchedMessages);
      setLoadingMessages(false);
      requestAnimationFrame(() => scrollToBottom());
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast({ title: "Error", description: "Failed to load messages.", variant: "destructive" });
      setLoadingMessages(false);
    });

    return () => unsubscribeMessages();
  }, [selectedConversationId, toast]);


  const handleSelectConversation = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (firebaseUser?.uid) {
      try {
        const convoRef = doc(db, 'conversations', conversationId);
        // Atomically update unread count for the current user
        await updateDoc(convoRef, { [`unreadCount.${firebaseUser.uid}`]: 0 });
         setConversations(prev =>
          prev.map(convo => convo.id === conversationId ? { ...convo, unreadCount: 0 } : convo)
        );
      } catch (error) {
        console.error("Error marking conversation as read:", error);
      }
    }
  }, [firebaseUser?.uid]);


  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !firebaseUser?.uid) return;

    const messageText = newMessage.trim();
    const currentTimestamp = serverTimestamp();

    const messageData = {
      senderId: firebaseUser.uid,
      text: messageText,
      timestamp: currentTimestamp,
    };

    const conversationRef = doc(db, 'conversations', selectedConversation.id);
    const messagesColRef = collection(conversationRef, 'messages');

    try {
      await addDoc(messagesColRef, messageData);
      
      const updatePayload: any = {
        lastMessagePreview: messageText,
        lastMessageTimestamp: currentTimestamp,
      };
      // Increment unread count for other participants
      selectedConversation.participants.forEach(participantId => {
        if (participantId !== firebaseUser.uid) {
          // To increment, Firestore needs a field to increment, or you manage it client-side then write.
          // For simplicity, we'll assume unreadCount is a map: { userId: count }
          // And we will update the specific user's count.
          // This is tricky if the field doesn't exist yet.
          // A more robust way is to useFieldValue.increment(1) but that requires a transaction or careful handling.
          // For now, we'll just set it, assuming the structure exists or rule allows creation.
          // This part needs to be robust.
          const otherUserUnreadCount = conversations.find(c=>c.id === selectedConversation.id)?.unreadCount?.[participantId] || 0;
          updatePayload[`unreadCount.${participantId}`] = otherUserUnreadCount + 1;
        }
      });
      
      await updateDoc(conversationRef, updatePayload);
      setNewMessage('');

    } catch (error) {
        console.error("Error sending message:", error);
        toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  }, [newMessage, selectedConversation, firebaseUser?.uid, toast, conversations]);

  function ConversationListItem({ conversation, isSelected, onSelect }: { conversation: Conversation; isSelected: boolean; onSelect: () => void }) {
    const lastMessageDate = conversation.lastMessageTimestamp ? new Date(conversation.lastMessageTimestamp) : new Date(0);
    let displayTime = 'N/A';
    if (lastMessageDate.getTime() !== new Date(0).getTime()) { // Check if it's not the default invalid date
        displayTime = isToday(lastMessageDate) ? format(lastMessageDate, 'p') : isYesterday(lastMessageDate) ? 'Yesterday' : format(lastMessageDate, 'MMM d');
    }
    
    const fallbackInitial = conversation.contactName ? conversation.contactName.substring(0, 2).toUpperCase() : '??';

    return (
      <button onClick={onSelect} className={cn("w-full text-left p-3 hover:bg-muted/50 transition-colors rounded-lg flex gap-3 items-start", isSelected && "bg-muted")}> 
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} />
          <AvatarFallback>{fallbackInitial}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold truncate">{conversation.contactName || 'Unknown Contact'}</h3>
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
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold font-headline">Chats</h2>
          </div>
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex justify-center items-center h-full p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((convo) => (
                  <ConversationListItem
                    key={convo.id}
                    conversation={convo}
                    isSelected={convo.id === selectedConversationId}
                    onSelect={() => handleSelectConversation(convo.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

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
              <ScrollArea className="flex-1 p-4 space-y-4">
                {loadingMessages && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.senderId === firebaseUser?.uid}
                    contactAvatar={selectedConversation.contactAvatar}
                    contactName={selectedConversation.contactName}
                  />
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <div className="p-4 border-t border-input bg-card">
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    className="flex-1 resize-none min-h-[40px]"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || !firebaseUser}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              {loadingConversations ? (
                <Loader2 className="h-12 w-12 text-muted-foreground/30 animate-spin mb-4" />
              ) : (
                <MessageCircle className="h-24 w-24 text-muted-foreground/30 mb-4" />
              )}
              <h3 className="text-xl font-semibold text-muted-foreground font-headline">
                {loadingConversations ? 'Loading Conversations...' : 'Select a conversation'}
              </h3>
              <p className="text-muted-foreground">
                {loadingConversations ? 'Please wait.' : 'Choose one of your existing chats to continue the conversation.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
