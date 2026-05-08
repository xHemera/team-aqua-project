"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/molecules/social/MessageBubble";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import type { type as socialType } from "@/app/social/index";

type MessageThreadProps = {
  selectedUser: string;
  currentUser: socialType.User | null;
  messages: socialType.Messages[];
  unread: boolean;
  expandedMessages: Set<string>;
  users: socialType.User[];
  customUserAvatar?: string | null;
  maxDisplayLength: number;
  isTyping: boolean;
  typer: string | null;
  onMessageExpand: (messageId: string) => void;
  onProfileClick: (userName: string) => void;
};

export function MessageThread({
  selectedUser,
  currentUser,
  messages,
  unread,
  expandedMessages,
  users,
  customUserAvatar,
  maxDisplayLength,
  isTyping,
  typer,
  onMessageExpand,
  onProfileClick,
}: MessageThreadProps) {
  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  if (!selectedUser) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col min-h-[16rem] items-center justify-center text-base font-semibold text-gray-400">
        No conversation selected
      </div>
    );
  }

  return (
    <div ref={messageListRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
      {messages.map((msg, index) => {
        const lastUserMessageIndex = messages.findLastIndex((m) => m.user_id === currentUser?.id);
        const isLastUserMessage = msg.user_id === currentUser?.id && index === lastUserMessageIndex;
        const isOwnMessage = msg.user_id === currentUser?.id;
        const senderName = isOwnMessage ? currentUser?.name : selectedUser;
        const senderAvatar = isOwnMessage
          ? currentUser?.avatar?.url || DEFAULT_PROFILE_ICON.url
          : users.find((u) => u.name === selectedUser)?.image ||
            users.find((u) => u.name === selectedUser)?.avatar?.url ||
            DEFAULT_PROFILE_ICON.url;

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={isOwnMessage}
            isLastUserMessage={isLastUserMessage}
            unread={unread}
            isExpanded={expandedMessages.has(msg.id)}
            customUserAvatar={isOwnMessage ? customUserAvatar : undefined}
            senderName={senderName || "Unknown"}
            senderAvatar={senderAvatar}
            maxDisplayLength={maxDisplayLength}
            onExpand={() => onMessageExpand(msg.id)}
            onProfileClick={() => {
              if (isOwnMessage && currentUser?.name) {
                onProfileClick(currentUser.name);
              } else if (selectedUser) {
                onProfileClick(selectedUser);
              }
            }}
          />
        );
      })}

      {isTyping && typer && selectedUser === typer && (
        <div className="px-5 py-3">
          <style>{`
            @keyframes typing-animation {
              0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
              30% { opacity: 1; transform: translateY(-8px); }
            }
            .typing-dot {
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: currentColor;
              margin: 0 2px;
              animation: typing-animation 1.4s infinite;
            }
            .typing-dot:nth-child(1) { animation-delay: 0s; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          `}</style>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <span>{typer} is typing</span>
            <span className="text-[var(--accent-color)]">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
