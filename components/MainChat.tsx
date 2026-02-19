"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import MessageBubble from "./MessageBubble";

interface MainChatProps {
  messages: Message[];
  recipientName: string;
  onSend: (text: string) => void;
  onFileUpload?: (file: File, type: 'image' | 'file') => void;
  isSuspended?: boolean;
}

const MainChat: React.FC<MainChatProps> = ({ messages, recipientName, onSend, onFileUpload, isSuspended = false }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file, type);
    }
    // Reset input
    if (type === 'image' && imageInputRef.current) {
      imageInputRef.current.value = '';
    } else if (type === 'file' && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerAttachFile = () => {
    console.log('[MainChat] triggerAttachFile called');
    if (fileInputRef.current) {
      fileInputRef.current.focus();
      fileInputRef.current.click();
    }
  };

  const triggerImageFile = () => {
    console.log('[MainChat] triggerImageFile called');
    if (imageInputRef.current) {
      imageInputRef.current.focus();
      imageInputRef.current.click();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#161929] min-w-0 overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 flex flex-col gap-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2e3e]">
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];

          // Show "Yesterday" divider before first message
          const showYesterdayDivider = idx === 0 && !msg.isNew;

          // Show "New Message" divider when transitioning from non-new to new
          const showNewDivider = msg.isNew && (!prev || !prev.isNew);

          // Show "Today" divider before first new message (after yesterday section)
          const showTodayDivider =
            msg.isNew &&
            (!prev || !prev.isNew) &&
            messages.some((m) => !m.isNew);

          return (
            <React.Fragment key={msg.id}>
              {showYesterdayDivider && (
                <div className="flex items-center gap-2.5 my-4">
                  <span className="flex-1 h-px bg-[#2a2e3e]" />
                  <span className="text-[11px] text-[#555e7a] px-2 py-0.5 bg-[#1e2338] border border-[#2a2e3e] rounded-full whitespace-nowrap">
                    Yesterday
                  </span>
                  <span className="flex-1 h-px bg-[#2a2e3e]" />
                </div>
              )}

              {showNewDivider && (
                <div className="flex items-center gap-2.5 my-4">
                  <span className="flex-1 h-px bg-[#4e6ef2]/40" />
                  <span className="text-[11px] text-[#4e6ef2] px-2 py-0.5 bg-[#1a2050] border border-[#4e6ef2]/30 rounded-full whitespace-nowrap">
                    New Message
                  </span>
                  <span className="flex-1 h-px bg-[#4e6ef2]/40" />
                </div>
              )}

              <MessageBubble message={msg} />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#2a2e3e] bg-[#1d2133] px-4 pb-3 pt-2 flex-shrink-0">
        {isSuspended && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-3 py-2 mb-2 text-[12px] text-[#ef4444] flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Your account is suspended and cannot send messages
          </div>
        )}
        {/* Toolbar */}
        <div className="flex gap-0.5 mb-1.5">
          {[
            {
              label: "Emoji",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              ),
              onClick: () => {},
            },
            {
              label: "Attach",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              ),
              onClick: triggerAttachFile,
            },
            {
              label: "Mention",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                </svg>
              ),
              onClick: () => {},
            },
            {
              label: "Image",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              ),
              onClick: triggerImageFile,
            },
          ].map((tool) => (
            <button
              key={tool.label}
              title={tool.label}
              onClick={(e) => {
                e.preventDefault();
                tool.onClick();
              }}
              type="button"
              disabled={isSuspended}
              className="w-[30px] h-[30px] flex items-center justify-center text-[#555e7a] rounded-md hover:bg-[#252b40] hover:text-[#8891aa] active:bg-[#2a3152] transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e, 'file')}
          style={{ pointerEvents: 'auto', opacity: 0, position: 'absolute', width: 0, height: 0 }}
          accept="*/*"
          multiple={false}
          capture={false}
        />
        <input
          ref={imageInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e, 'image')}
          style={{ pointerEvents: 'auto', opacity: 0, position: 'absolute', width: 0, height: 0 }}
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          multiple={false}
          capture={false}
        />

        {/* Input row */}
        <div className={`flex items-center gap-2 bg-[#252b40] border border-[#2a2e3e] rounded-xl px-3.5 transition-colors ${
          isSuspended ? "opacity-60" : "focus-within:border-[#4e6ef2]"
        }`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isSuspended ? "Account suspended" : `Message to ${recipientName}`}
            disabled={isSuspended}
            className="flex-1 bg-transparent border-none outline-none text-[#ccd4f5] text-[13px] py-2.5 font-[inherit] placeholder-[#555e7a] disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSuspended}
            className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
              input.trim() && !isSuspended
                ? "text-[#4e6ef2] hover:bg-[#2a3152]"
                : "text-[#555e7a] cursor-default"
            } disabled:opacity-50`}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainChat;