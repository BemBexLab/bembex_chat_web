"use client";

import React from "react";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isLink =
    message.content &&
    (message.content.startsWith("http://") ||
    message.content.startsWith("https://"));

  const hasAttachment = !!message.fileUrl;
  const normalizedType = (message.fileType || "").toLowerCase();
  const lowerFileName = (message.fileName || "").toLowerCase();
  const isImage =
    hasAttachment &&
    (normalizedType === "image" ||
      normalizedType.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerFileName));
  const isFile = hasAttachment && !isImage;

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
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={message.fileUrl}
                alt={message.fileName || "Image"}
                className="w-full h-auto max-h-80 object-cover"
              />
            </a>
            <div className="px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#ccd4f5] truncate">
                {message.fileName || "Image"}
              </span>
              <a
                href={message.fileUrl}
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
        ) : isFile ? (
          <a
            href={message.fileUrl}
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
