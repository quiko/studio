
"use client";

import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Menu } from 'lucide-react';
import { MOCK_CONVERSATIONS, CURRENT_USER_MOCK_ID, type Conversation, type Message as MessageType } from '@/lib/constants';
import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext'; // Added useUser import

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

interface MessageBubbleProps {
  message: MessageType;
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
  const { firebaseUser } = useUser(); // Get firebaseUser from context
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [selectedConversation?.messages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Mark conversation as read (simplified for now)
    const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0; 
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: MessageType = {
      id: `msg-${Date.now()}`,
      senderId: firebaseUser?.uid || CURRENT_USER_MOCK_ID, // Use real UID if available
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add message to the selected conversation (mock in-memory update)
    selectedConversation.messages.push(message);
    selectedConversation.lastMessagePreview = message.text;
    selectedConversation.lastMessageTimestamp = message.timestamp;
    
    setNewMessage('');
    scrollToBottom(); 
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
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {MOCK_CONVERSATIONS.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()).map((convo) => (
                <ConversationListItem
                  key={convo.id}
                  conversation={convo}
                  isSelected={convo.id === selectedConversationId}
                  onSelect={() => handleSelectConversation(convo.id)}
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
                  <p className="text-xs text-muted-foreground capitalize">{selectedConversation.contactRole}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.senderId === (firebaseUser?.uid || CURRENT_USER_MOCK_ID)} // Compare with real UID
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
