"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message, Conversation } from "../types";
import MessageBubble from "./MessageBubble";

interface MobileChatViewProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSend: (text: string) => void;
  onFileUpload?: (file: File, type: 'image' | 'file' | 'voice') => void;
  isSuspended?: boolean;
}

const MobileChatView: React.FC<MobileChatViewProps> = ({
  conversation,
  messages,
  onBack,
  onSend,
  onFileUpload,
  isSuspended = false,
}) => {
  const [input, setInput] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

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

  const toggleVoiceRecording = async () => {
    if (isSuspended || !onFileUpload) return;

    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(voiceChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const extension = (recorder.mimeType || "audio/webm").includes("ogg") ? "ogg" : "webm";
        const voiceFile = new File([audioBlob], `voice-note-${Date.now()}.${extension}`, {
          type: recorder.mimeType || "audio/webm",
        });
        onFileUpload(voiceFile, "voice");
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        voiceChunksRef.current = [];
      };

      recorder.start();
      setIsRecordingVoice(true);
    } catch (error) {
      console.error("Voice recording failed:", error);
      alert("Microphone access is required to send voice notes.");
    }
  };

  return (
    <div className="md:hidden flex flex-col h-full bg-[#111827]">
      {/* ── MOBILE CHAT HEADER ── */}
      <div className="h-14 bg-[#1a1f2e] border-b border-[#2a2e3e] flex items-center gap-2 px-2 flex-shrink-0">
        {/* Back */}
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center text-[#4e6ef2] rounded-full hover:bg-[#2a2e3e] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Avatar + Name */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#2a3152] text-[#aab3d4] text-[12px] font-bold flex items-center justify-center">
            {conversation.name.slice(0, 2).toUpperCase()}
          </div>
          {conversation.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#3ecf8e] border-2 border-[#1a1f2e]" />
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[14px] font-semibold text-[#e4e9f7] truncate leading-tight">
            {conversation.name}
          </span>
          <span className={`text-[11px] leading-tight ${conversation.online ? "text-[#3ecf8e]" : "text-[#555e7a]"}`}>
            {conversation.online ? "Available" : "Offline"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button className="w-9 h-9 flex items-center justify-center text-[#8891aa] rounded-full hover:bg-[#2a2e3e] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14 19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 2.97 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[#8891aa] rounded-full hover:bg-[#2a2e3e] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showYesterdayDivider = idx === 0 && !msg.isNew;
          const showNewDivider = msg.isNew && (!prev || !prev.isNew);

          return (
            <React.Fragment key={msg.id}>
              {showYesterdayDivider && (
                <div className="flex items-center gap-2 my-3">
                  <span className="flex-1 h-px bg-[#2a2e3e]" />
                  <span className="text-[11px] text-[#555e7a] px-2 py-0.5 bg-[#1a1f2e] border border-[#2a2e3e] rounded-full">
                    Yesterday
                  </span>
                  <span className="flex-1 h-px bg-[#2a2e3e]" />
                </div>
              )}
              {showNewDivider && (
                <div className="flex items-center gap-2 my-3">
                  <span className="flex-1 h-px bg-[#4e6ef2]/40" />
                  <span className="text-[11px] text-[#4e6ef2] px-2 py-0.5 bg-[#1a2050] border border-[#4e6ef2]/30 rounded-full">
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

      {/* ── INPUT ── */}
      <div className="flex-shrink-0 px-3 py-2 bg-[#1a1f2e] border-t border-[#2a2e3e]">
        {isSuspended && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-3 py-2 mb-2 text-[12px] text-[#ef4444] flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Your account is suspended
          </div>
        )}
        {isRecordingVoice && (
          <div className="text-[11px] text-[#ef4444] mb-2 px-1">Recording voice note...</div>
        )}
        <div className="flex items-end gap-2">
          {/* Emoji */}
          <button 
            className="w-9 h-9 flex items-center justify-center text-[#555e7a] hover:text-[#8891aa] transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSuspended}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>

          {/* Text input */}
          <div className={`flex-1 flex items-center bg-[#252b40] border border-[#2a2e3e] rounded-2xl px-3.5 transition-colors ${
            isSuspended ? "opacity-60" : "focus-within:border-[#4e6ef2]"
          }`}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSuspended ? "Account suspended" : "Message..."}
              disabled={isSuspended}
              className="flex-1 bg-transparent border-none outline-none text-[#ccd4f5] text-[14px] py-2.5 font-[inherit] placeholder-[#555e7a] disabled:cursor-not-allowed"
            />
            {/* Attach */}
            <button 
              className="text-[#555e7a] hover:text-[#8891aa] transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSuspended}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
          </div>

          {/* Send / Mic button */}
          {input.trim() && !isSuspended ? (
            <button
              onClick={handleSend}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4e6ef2] text-white flex-shrink-0 shadow-lg shadow-[#4e6ef2]/30 active:scale-95 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={toggleVoiceRecording}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4e6ef2] text-white flex-shrink-0 shadow-lg shadow-[#4e6ef2]/30 disabled:opacity-50"
              disabled={isSuspended}
              title={isRecordingVoice ? "Stop recording" : "Record voice note"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileChatView;
