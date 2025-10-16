"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

interface MessageContextProps {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  fetchUnreadCount: () => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`/api/message/unread-count`);
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    socket.on("newMessage", () => {
      setUnreadCount((prevCount) => prevCount + 1);
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, []);

  return (
    <MessageContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        fetchUnreadCount,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};

