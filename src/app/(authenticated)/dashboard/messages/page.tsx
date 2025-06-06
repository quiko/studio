
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { CURRENT_USER_MOCK_ID, type Conversation, type Message as MessageType } from '@/lib/constants';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Removed capitalize import
import { useUser } from '@/contexts/UserContext'; // Added useUser import
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, serverTimestamp, updateDoc, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type UserProfile } from '@/types';

interface ConversationListItemProps {
  conversation: Conversation;
  isOwnMessage: boolean;
  contactAvatar: string;
  contactName: string;
}

function MessageBubble({ message, isOwnMessage, contactAvatar, contactName }: MessageBubbleProps) {
  const messageDate = new Date(message.timestamp);
  const displayTime = format(messageDate, 'p');

  return (
    <div className={cn("flex items-end gap-2 mb-4", isOwnMessage ? "justify-end" : "justify-start")}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 border self-start">
          <AvatarImage src={contactAvatar} alt={contactName} data-ai-hint="person avatar small" />
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
        <p className={cn("text-xs mt-1", isOwnMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>
          {displayTime}
        </p>
      </div>
      {isOwnMessage && (
         <div className="h-8 w-8 flex-shrink-0"></div>
      )}
    </div>
  );
}



export default function MessagesPage() {
  const { firebaseUser } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Firebase State and Effects
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { toast } = useToast();

   // Find the selected conversation from the fetched list
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Function to scroll messages to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  // Fetch Conversations for current user
  useEffect(() => {
    if (!firebaseUser?.uid) {
        setLoadingConversations(false);
        return;
    }

    setLoadingConversations(true);
    const q = query(
        collection(db, 'conversations'),
        // We need a composite index on participants and lastMessageTimestamp
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const fetchedConversations: Conversation[] = [];
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            // Basic filtering for now, optimize with query later
                // For simplicity, assume 2 participants: current user and one other
                const otherParticipantId = data.participants.find((id: string) => id !== firebaseUser.uid);
                let contactName = 'Unknown User';
                let contactAvatar = '';
                let contactRole = ''; // Fetch role if needed

                // Fetch the other participant's profile
                if (otherParticipantId) {
                    try {
                        const userDoc = await getDocs(query(collection(db, 'users'), where('userId', '==', otherParticipantId)));
                        if (!userDoc.empty) {
                            const userData = userDoc.docs[0].data() as UserProfile; // Assuming UserProfile type
                            contactName = userData.displayName || userData.email || 'Unknown User';
                            contactAvatar = userData.photoURL || '';
                            contactRole = userData.userType; // Assuming userType exists in UserProfile
                        }
                    } catch (error) {
                        console.error("Error fetching participant profile:", error);
                    }
                }
                fetchedConversations.push({
                    id: docSnap.id,
                    participants: data.participants,
                    contactId: otherParticipantId, // Store the other participant's ID
                    contactName: contactName,
                    contactAvatar: contactAvatar,
                    contactRole: contactRole,
                    lastMessagePreview: data.lastMessagePreview || 'No messages yet',
                    lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString() || new Date().toISOString(),
                    unreadCount: data.unreadCount?.[firebaseUser.uid] || 0, // Assuming unread counts are stored per user ID
                    messages: [], // Messages are fetched separately
                });
        }
        setConversations(fetchedConversations);
        setLoadingConversations(false);
    }, (error) => {
        console.error("Error fetching conversations:", error);
        toast({
            title: "Error",
            description: "Failed to load conversations.",
            variant: "destructive",
        });
        setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [firebaseUser?.uid, toast]);


  // Fetch Messages for the selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
        setMessages([]);
        return;
    }

    setLoadingMessages(true);
    const q = query(
        collection(db, 'conversations', selectedConversationId, 'messages'),
        orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages: MessageType[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as MessageType,
            timestamp: (doc.data().timestamp?.toDate() || new Date()).toISOString(), // Ensure timestamp is a string
        }));
        setMessages(fetchedMessages);
        setLoadingMessages(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        toast({
            title: "Error",
            description: "Failed to load messages.",
            variant: "destructive",
        });
        setLoadingMessages(false);
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [selectedConversationId, toast]); // Re-run when selectedConversation changes


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Add a small delay to ensure DOM updates
    const timer = setTimeout(() => {
        scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);


  const handleSelectConversation = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Mark conversation as read
    if (firebaseUser?.uid) {
        try {
            const convoRef = doc(db, 'conversations', conversationId);
            await updateDoc(convoRef, {
                [`unreadCount.${firebaseUser.uid}`]: 0 // Reset unread count for current user
            });
        } catch (error) {
            console.error("Error marking conversation as read:", error);
            // Optionally show a toast
        }
    }
  }, [firebaseUser?.uid]);
  useEffect(() => {
    if (selectedConversationId) {
        setConversations(prevConversations =>
            prevConversations.map(convo =>
                convo.id === selectedConversationId ? { ...convo, unreadCount: 0 } : convo
            )
        );
    }
  }, [selectedConversationId]);


interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}

function ConversationListItem({ conversation, isSelected, onSelect }: ConversationListItemProps) {
  const lastMessageDate = new Date(conversation.lastMessageTimestamp);
  let displayTime;
  if (isToday(lastMessageDate)) {
    displayTime = format(lastMessageDate, 'p'); // e.g., 2:30 PM
  } else if (isYesterday(lastMessageDate)) {
    displayTime = 'Yesterday';
  } else {
    displayTime = format(lastMessageDate, 'MMM d'); // e.g., Jul 20
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 hover:bg-muted/50 transition-colors rounded-lg flex gap-3 items-start",
        isSelected && "bg-muted"
      )}
    >
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} data-ai-hint="person avatar" />
        <AvatarFallback>{conversation.contactName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold truncate">{conversation.contactName}</h3>
          <time className="text-xs text-muted-foreground whitespace-nowrap">{displayTime}</time>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className="text-xs text-muted-foreground truncate flex-1">{conversation.lastMessagePreview}</p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
        senderId: firebaseUser?.uid || 'anonymous', // Use actual UID
        text: newMessage.trim(),
        timestamp: serverTimestamp(), // Use server timestamp
    };

    const conversationRef = doc(db, 'conversations', selectedConversation.id);

    // Add message to the subcollection
    addDoc(collection(conversationRef, 'messages'), messageData)
        .then(() => {
            // Update last message preview and timestamp in the conversation document
            return updateDoc(conversationRef, {
                lastMessagePreview: messageData.text,
                lastMessageTimestamp: messageData.timestamp,
                // Increment unread count for the *other* participant(s)
                // This requires knowing who the other participants are.
                // For a 1:1 chat, find the ID that is not the current user's ID.
                 ...selectedConversation.participants.reduce((acc, participantId) => {
                    if (participantId !== firebaseUser?.uid) {
                       acc[`unreadCount.${participantId}`] = (selectedConversation.unreadCount?.[participantId] || 0) + 1;
                    }
                    return acc;
                 }, {} as any),
            });
        })
        .then(() => {
            setNewMessage('');
        })
        .catch((error) => {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message.",
                variant: "destructive",
            });
        });
  };


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,100px))]">
      <PageHeader
        title="Messages"
        description="Communicate with artists and event organizers."
      />
      <Card className="flex-1 flex overflow-hidden">
        {/* Conversation List - Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold font-headline">Chats</h2>
            {/* Search/Filter can be added here later */}
              {loadingConversations && (
                  <div className="flex justify-center items-center mt-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
              )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {/* Using 'conversations' state from Firebase */}
              {conversations.map((convo) => (
                <ConversationListItem
                  key={convo.id}
                  conversation={convo}
                  isSelected={convo.id === selectedConversationId}
                  onSelect={() => handleSelectConversation(convo.id)} // Use memoized handler
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat View - Main Area */}
        <div className="flex-1 flex flex-col h-full bg-background">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                   <AvatarImage src={selectedConversation.contactAvatar} alt={selectedConversation.contactName} data-ai-hint="person avatar chat" />
                   <AvatarFallback>{selectedConversation.contactName.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold font-headline">{selectedConversation.contactName}</h3>
                  <p className="text-xs text-muted-foreground">{capitalize(selectedConversation.contactRole)}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 space-y-4">
                  {loadingMessages && (
                      <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                  )}
                {/* Using 'messages' state from Firebase */}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.senderId === firebaseUser?.uid} // Compare with real UID
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    className="flex-1 resize-none min-h-[40px]"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="h-24 w-24 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground font-headline">Select a conversation</h3>
              <p className="text-muted-foreground">Choose one of your existing chats to continue the conversation.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
