// Chat Manager Hook
// Manages multiple chat instances

import { useState, useCallback } from 'react';
import { ChatInstance, ChatMessage, CHAT_CONSTRAINTS } from '../types/ChatTypes';

export function useChatManager() {
  const [activeChats, setActiveChats] = useState<ChatInstance[]>([]);

  // Create a new chat instance
  const createChat = useCallback((imageBase64?: string) => {
    const id = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate position with offset for multiple chats
    const offset = activeChats.length * 30;
    const centerX = (window.innerWidth - CHAT_CONSTRAINTS.defaultWidth) / 2;
    const centerY = (window.innerHeight - CHAT_CONSTRAINTS.defaultHeight) / 2;
    
    const newChat: ChatInstance = {
      id,
      state: 'window',
      position: { 
        x: centerX + offset, 
        y: centerY + offset 
      },
      size: { 
        width: CHAT_CONSTRAINTS.defaultWidth, 
        height: CHAT_CONSTRAINTS.defaultHeight 
      },
      messages: [],
      imageBase64,
      isStreaming: false,
      error: undefined,
    };

    setActiveChats(prev => [...prev, newChat]);
    return id;
  }, [activeChats.length]);

  // Update chat instance
  const updateChat = useCallback((id: string, updates: Partial<ChatInstance>) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.id === id ? { ...chat, ...updates } : chat
      )
    );
  }, []);

  // Add message to chat
  const addMessage = useCallback((id: string, message: ChatMessage) => {
    setActiveChats(prev =>
      prev.map(chat =>
        chat.id === id
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  }, []);

  // Append streaming text to last assistant message
  const appendStreamingText = useCallback((id: string, text: string) => {
    setActiveChats(prev =>
      prev.map(chat => {
        if (chat.id !== id) return chat;
        
        const messages = [...chat.messages];
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += text;
        } else {
          messages.push({ role: 'assistant', content: text });
        }
        
        return { ...chat, messages };
      })
    );
  }, []);

  // Minimize chat to bubble
  const minimizeChat = useCallback((id: string) => {
    updateChat(id, { state: 'bubble' });
  }, [updateChat]);

  // Restore chat from bubble
  const restoreChat = useCallback((id: string) => {
    updateChat(id, { state: 'window' });
  }, [updateChat]);

  // Close chat
  const closeChat = useCallback((id: string) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== id));
  }, []);

  // Update chat position
  const updatePosition = useCallback((id: string, position: { x: number; y: number }) => {
    updateChat(id, { position });
  }, [updateChat]);

  // Update chat size
  const updateSize = useCallback((id: string, size: { width: number; height: number }) => {
    // Enforce constraints
    const constrainedSize = {
      width: Math.max(CHAT_CONSTRAINTS.minWidth, Math.min(size.width, CHAT_CONSTRAINTS.maxWidth)),
      height: Math.max(CHAT_CONSTRAINTS.minHeight, Math.min(size.height, CHAT_CONSTRAINTS.maxHeight)),
    };
    updateChat(id, { size: constrainedSize });
  }, [updateChat]);

  // Set streaming state
  const setStreaming = useCallback((id: string, isStreaming: boolean) => {
    updateChat(id, { isStreaming });
  }, [updateChat]);

  // Set error
  const setError = useCallback((id: string, error: string) => {
    updateChat(id, { error, isStreaming: false });
  }, [updateChat]);

  return {
    activeChats,
    createChat,
    updateChat,
    addMessage,
    appendStreamingText,
    minimizeChat,
    restoreChat,
    closeChat,
    updatePosition,
    updateSize,
    setStreaming,
    setError,
  };
}
