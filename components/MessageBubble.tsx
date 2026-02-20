"use client";

import React, { useEffect, useState } from "react";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [resolvedFileUrl, setResolvedFileUrl] = useState<string | null>(message.fileUrl || null);
  const [resolvedMimeType, setResolvedMimeType] = useState<string>("");

  useEffect(() => {
    let blobUrlToRevoke: string | null = null;
    let cancelled = false;

    const resolveProtectedFileUrl = async () => {
      if (!message.fileUrl) {
        setResolvedFileUrl(null);
        return;
      }

      const isMongoFileApi = message.fileUrl.includes("/api/chat/file/");
      if (!isMongoFileApi) {
        setResolvedFileUrl(message.fileUrl);
        setResolvedMimeType((message.fileType || "").toLowerCase());
        return;
      }

      try {
        // Force same-origin API path so auth cookies/header work after re-login.
        let requestUrl = message.fileUrl;
        const marker = "/api/chat/file/";
        const markerIndex = message.fileUrl.indexOf(marker);
        if (markerIndex >= 0) {
          requestUrl = message.fileUrl.substring(markerIndex);
        }

        let adminToken: string | null = null;
        let userToken: string | null = null;
        if (typeof window !== "undefined") {
          const adminRaw = localStorage.getItem("admin_auth");
          const userRaw = localStorage.getItem("auth");
          if (adminRaw) {
            adminToken = JSON.parse(adminRaw)?.token || null;
          }
          if (userRaw) {
            userToken = JSON.parse(userRaw)?.token || null;
          }
        }

        // 1) Cookie-first request (most reliable after re-login)
        let response = await fetch(requestUrl, {
          method: "GET",
          credentials: "include",
        });
        // 2) Fallback with bearer tokens if cookie is unavailable
        if (!response.ok && adminToken) {
          response = await fetch(requestUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${adminToken}` },
            credentials: "include",
          });
        }
        if (!response.ok && userToken) {
          response = await fetch(requestUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${userToken}` },
            credentials: "include",
          });
        }
        if (!response.ok) {
          setResolvedFileUrl(message.fileUrl);
          setResolvedMimeType((message.fileType || "").toLowerCase());
          return;
        }

        const blob = await response.blob();
        blobUrlToRevoke = URL.createObjectURL(blob);
        if (!cancelled) {
          setResolvedFileUrl(blobUrlToRevoke);
          setResolvedMimeType((blob.type || message.fileType || "").toLowerCase());
        }
      } catch {
        if (!cancelled) {
          setResolvedFileUrl(message.fileUrl);
          setResolvedMimeType((message.fileType || "").toLowerCase());
        }
      }
    };

    resolveProtectedFileUrl();

    return () => {
      cancelled = true;
      if (blobUrlToRevoke) {
        URL.revokeObjectURL(blobUrlToRevoke);
      }
    };
  }, [message.fileUrl]);

  const isLink =
    message.content &&
    (message.content.startsWith("http://") ||
    message.content.startsWith("https://"));

  const hasAttachment = !!resolvedFileUrl;
  const normalizedType = (resolvedMimeType || message.fileType || "").toLowerCase();
  const lowerFileName = (message.fileName || "").toLowerCase();
  const isImage =
    hasAttachment &&
    (normalizedType === "image" ||
      normalizedType.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerFileName));
  const isVoice =
    hasAttachment &&
    (normalizedType === "voice" ||
      normalizedType.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|aac|webm)$/.test(lowerFileName));
  const isFile = hasAttachment && !isImage && !isVoice;

  return (
    <div
      className={`flex items-end gap-2 mb-2 ${
        message.isSelf ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Other person avatar */}
      {!message.isSelf && (
        <div className="w-[30px] h-[30px] rounded-lg bg-[#3a4060] text-[#aab3d4] text-[10px] font-semibold flex items-center justify-center flex-shrink-0 self-start mt-3.5">
          {message.sender.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Bubble group */}
      <div
        className={`flex flex-col gap-0.5 max-w-[60%] ${
          message.isSelf ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name */}
        {!message.isSelf && (
          <span className="text-[11.5px] font-semibold text-[#8891aa] px-1">
            {message.sender}
          </span>
        )}

        {/* Bubble */}
        {isImage ? (
          <div className="rounded-xl overflow-hidden max-w-xs border border-[#2a2e3e] bg-[#1b2032]">
            <a href={resolvedFileUrl || message.fileUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={resolvedFileUrl || message.fileUrl}
                alt={message.fileName || "Image"}
                className="w-full h-auto max-h-80 object-cover"
              />
            </a>
            <div className="px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#ccd4f5] truncate">
                {message.fileName || "Image"}
              </span>
              <a
                href={resolvedFileUrl || message.fileUrl}
                download={message.fileName || true}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#6b95ff] hover:underline"
              >
                Download
              </a>
            </div>
            {message.content && (
              <div className="px-3 pb-2 text-[12px] text-[#ccd4f5] break-words">
                {message.content}
              </div>
            )}
          </div>
        ) : isVoice ? (
          <div
            className={`px-3 py-2 rounded-xl flex flex-col gap-2 ${
              message.isSelf
                ? "bg-[#4e6ef2] text-white rounded-br-sm"
                : "bg-[#252b40] text-[#ccd4f5] rounded-bl-sm"
            }`}
          >
            <audio controls preload="none" src={resolvedFileUrl || message.fileUrl} className="max-w-[260px] w-full" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] truncate">{message.fileName || "Voice note"}</span>
              <a
                href={resolvedFileUrl || message.fileUrl}
                download={message.fileName || true}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] ${message.isSelf ? "text-white/90" : "text-[#6b95ff]"} hover:underline`}
              >
                Download
              </a>
            </div>
          </div>
        ) : isFile ? (
          <a
            href={resolvedFileUrl || message.fileUrl}
            download={message.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-2 rounded-xl flex items-center gap-2 hover:opacity-80 transition-opacity ${
              message.isSelf
                ? "bg-[#4e6ef2] text-white rounded-br-sm"
                : "bg-[#252b40] text-[#ccd4f5] rounded-bl-sm"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span className="text-[12px] font-medium truncate">
              {message.fileName || "File"}
            </span>
          </a>
        ) : isLink ? (
          <div className="px-3 py-2 rounded-xl bg-[#1d2133] border border-[#2a2e3e] rounded-bl-sm">
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b95ff] text-[12px] font-mono hover:underline break-all"
            >
              {message.content}
            </a>
          </div>
        ) : (
          <div
            className={`px-3 py-2 rounded-xl text-[13px] leading-relaxed break-words ${
              message.isSelf
                ? "bg-[#4e6ef2] text-white rounded-br-sm"
                : "bg-[#252b40] text-[#ccd4f5] rounded-bl-sm"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        {message.time && (
          <span className="text-[10px] text-[#555e7a] px-1">
            {message.time}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
