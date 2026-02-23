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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const scrollToLatest = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    requestAnimationFrame(() => {
      scrollToLatest();
      requestAnimationFrame(scrollToLatest);
    });
  }, [messages, conversation.id]);

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

  const handleVoiceFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file, "voice");
    }
    if (voiceInputRef.current) {
      voiceInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file, type);
    }
    if (type === "image" && imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (type === "file" && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerAttachFile = () => {
    if (!isSuspended && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerImageFile = () => {
    if (!isSuspended && imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const pickVoiceFile = () => {
    if (!isSuspended && voiceInputRef.current) {
      voiceInputRef.current.click();
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
      if (typeof MediaRecorder === "undefined") {
        pickVoiceFile();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeTypes = [
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];
      const canCheckMime = typeof (MediaRecorder as any).isTypeSupported === "function";
      const selectedMimeType = canCheckMime
        ? preferredMimeTypes.find((mime) => MediaRecorder.isTypeSupported(mime))
        : undefined;
      const recorder = selectedMimeType ? new MediaRecorder(stream, { mimeType: selectedMimeType }) : new MediaRecorder(stream);
      voiceChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (!voiceChunksRef.current.length) {
          stream.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
          alert("No audio captured. Please try recording again.");
          return;
        }
        const audioBlob = new Blob(voiceChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const extension = (recorder.mimeType || "audio/webm").includes("ogg")
          ? "ogg"
          : (recorder.mimeType || "").includes("mp4")
            ? "mp4"
            : "webm";
        const voiceFile = new File([audioBlob], `voice-note-${Date.now()}.${extension}`, {
          type: recorder.mimeType || "audio/webm",
        });
        onFileUpload(voiceFile, "voice");
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        voiceChunksRef.current = [];
      };

      recorder.start(250);
      setIsRecordingVoice(true);
    } catch (error) {
      console.error("Voice recording failed:", error);
      pickVoiceFile();
    }
  };

  return (
    <div className="md:hidden flex flex-col h-full bg-[#111827] pt-14 relative overflow-hidden">
      {/* ── MOBILE CHAT HEADER ── */}
      <div className="h-14 bg-[#1a1f2e]/95 backdrop-blur-md border-b border-[#2a2e3e] shadow-[0_8px_24px_rgba(0,0,0,0.28)] flex items-center gap-2 px-2 flex-shrink-0 fixed top-0 left-0 right-0 z-[120]">
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
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[14px] font-semibold text-[#e4e9f7] truncate leading-tight">
            {conversation.name}
          </span>
        </div>

      </div>

      {/* ── MESSAGES ── */}
      <div ref={messagesContainerRef} className="chat-scrollbar flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
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
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e, "file")}
          style={{ pointerEvents: "auto", opacity: 0, position: "absolute", width: 0, height: 0 }}
          accept="*/*"
          multiple={false}
          capture={false}
        />
        <input
          ref={imageInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e, "image")}
          style={{ pointerEvents: "auto", opacity: 0, position: "absolute", width: 0, height: 0 }}
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          multiple={false}
          capture={false}
        />
        <input
          ref={voiceInputRef}
          type="file"
          onChange={handleVoiceFileSelect}
          style={{ pointerEvents: 'auto', opacity: 0, position: 'absolute', width: 0, height: 0 }}
          accept="audio/*"
          multiple={false}
          capture={false}
        />
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
          {/* Text input */}
          <div className={`flex-1 flex items-center bg-[#252b40] border border-[#2a2e3e] rounded-2xl px-3.5 transition-colors ${
            isSuspended ? "opacity-60" : "focus-within:border-[#4e6ef2]"
          }`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSuspended ? "Account suspended" : "Message..."}
              disabled={isSuspended}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-[#ccd4f5] text-[14px] py-2.5 font-[inherit] placeholder-[#555e7a] disabled:cursor-not-allowed resize-none max-h-28"
            />
            {/* Image */}
            <button
              onClick={triggerImageFile}
              className="text-[#555e7a] hover:text-[#8891aa] transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSuspended}
              title="Upload image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            {/* Attach */}
            <button 
              onClick={triggerAttachFile}
              className="text-[#555e7a] hover:text-[#8891aa] transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSuspended}
              title="Attach file"
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
