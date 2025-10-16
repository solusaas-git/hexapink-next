"use client";

import { useState, useEffect, useCallback } from "react";
import { RiInboxLine } from "react-icons/ri";
import { BsTrash3, BsEnvelope, BsEnvelopeOpen } from "react-icons/bs";
import { IoArrowBack, IoMailOutline } from "react-icons/io5";
import api from "@/lib/api-client";
import AdminHeader from "@/components/admin/AdminHeader";
import Spinner from "@/components/common/ui/Spinner";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils/formatDate";

interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  read: boolean;
  agreeToEmails: boolean;
  status: string;
  createdAt: string;
}

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get("/admin/messages");
      // Map the 'read' field from database to 'status' for UI
      const mappedMessages = response.data.map((msg: any) => ({
        ...msg,
        status: msg.read ? "read" : "unread"
      }));
      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await api.patch(`/admin/messages/${messageId}`, { read: true });
      fetchMessages();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleMarkAsUnread = async (messageId: string) => {
    try {
      await api.patch(`/admin/messages/${messageId}`, { read: false });
      toast.success("Message marked as unread");
      fetchMessages();
      setSelectedMessage(null);
    } catch {
      toast.error("Failed to update message");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(`/admin/messages/${messageId}`);
        toast.success("Message deleted");
        fetchMessages();
        setSelectedMessage(null);
      } catch {
        toast.error("Failed to delete message");
      }
    }
  };

  const handleBack = () => {
    setSelectedMessage(null);
  };

  const filteredMessages = messages.filter((message) => {
    if (filter === "all") return true;
    return message.status === filter;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="h-full flex flex-col">
      <AdminHeader icon={<RiInboxLine />} label="Inbox" />

      <div className="h-full bg-light-gray flex">
        {/* Message List */}
        <div className="w-96 bg-white border-r border-light-gray-3 flex flex-col">
          {/* Filter Tabs */}
          <div className="border-b border-light-gray-3 p-4 flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-dark-blue text-white"
                  : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                filter === "unread"
                  ? "bg-dark-blue text-white"
                  : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
              }`}
            >
              Unread ({unreadCount})
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "read"
                  ? "bg-dark-blue text-white"
                  : "bg-light-gray-2 text-dark hover:bg-light-gray-3"
              }`}
            >
              Read
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="lg" color="#4040BF" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-light-dark p-8">
                <IoMailOutline className="text-6xl mb-4 text-light-gray-3" />
                <p className="text-lg text-center">
                  {filter === "all" ? "No messages yet" : `No ${filter} messages`}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === "unread") {
                      handleMarkAsRead(message._id);
                    }
                  }}
                  className={`p-4 border-b border-light-gray-3 cursor-pointer hover:bg-light-gray-2 transition-colors ${
                    selectedMessage?._id === message._id ? "bg-light-blue border-l-4 border-l-dark-blue" : ""
                  } ${message.status === "unread" ? "bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {message.status === "unread" ? (
                        <BsEnvelope className="text-dark-blue flex-shrink-0" />
                      ) : (
                        <BsEnvelopeOpen className="text-light-dark flex-shrink-0" />
                      )}
                      <p className={`font-semibold text-sm ${message.status === "unread" ? "text-dark" : "text-light-dark"}`}>
                        {message.firstName} {message.lastName}
                      </p>
                    </div>
                    {message.status === "unread" && (
                      <span className="w-2 h-2 bg-dark-blue rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-light-dark mb-2">{message.company}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Preview */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="border-b border-light-gray-3 p-6 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="px-3 py-2 bg-light-gray-2 text-dark text-sm rounded-lg hover:bg-light-gray-3 transition-colors flex items-center gap-2 md:hidden"
                >
                  <IoArrowBack />
                  Back
                </button>
                <div className="flex-1"></div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkAsUnread(selectedMessage._id)}
                    className="px-4 py-2 bg-light-gray-2 text-dark text-sm rounded-lg hover:bg-light-gray-3 transition-colors flex items-center gap-2"
                    title="Mark as unread"
                  >
                    <BsEnvelope />
                    Mark Unread
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="px-4 py-2 bg-red text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                    title="Delete message"
                  >
                    <BsTrash3 />
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-2xl font-bold text-dark mb-6">Contact Form Submission</h2>
                
                {/* Contact Information Card */}
                <div className="mb-6 p-6 bg-light-gray-2 border border-light-gray-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-dark mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-dark-blue text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {selectedMessage.firstName.charAt(0)}{selectedMessage.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-light-dark mb-1">Full Name</p>
                        <p className="font-semibold text-dark">
                          {selectedMessage.firstName} {selectedMessage.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-light-dark mb-1">Company</p>
                      <p className="font-medium text-dark">{selectedMessage.company}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-light-dark mb-1">Email Address</p>
                      <a 
                        href={`mailto:${selectedMessage.email}`}
                        className="font-medium text-dark-blue hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    
                    <div>
                      <p className="text-xs text-light-dark mb-1">Phone Number</p>
                      <a 
                        href={`tel:${selectedMessage.phone}`}
                        className="font-medium text-dark-blue hover:underline"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                    
                    <div>
                      <p className="text-xs text-light-dark mb-1">Received</p>
                      <p className="font-medium text-dark">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-light-dark mb-1">Email Marketing</p>
                      <p className="font-medium text-dark">
                        {selectedMessage.agreeToEmails ? (
                          <span className="px-3 py-1 bg-light-green-2 text-green border border-light-green-1 rounded-full text-xs">
                            ✓ Agreed
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-light-gray-3 text-light-dark border border-light-gray-3 rounded-full text-xs">
                            Not agreed
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">Message</h3>
                  <div className="p-6 bg-white border border-light-gray-3 rounded-lg">
                    <p className="whitespace-pre-wrap text-dark leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Your inquiry`}
                    className="px-6 py-3 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                  >
                    Reply via Email
                  </a>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="px-6 py-3 bg-light-gray-2 text-dark border border-light-gray-3 rounded-lg hover:bg-light-gray-3 transition-colors flex items-center gap-2"
                  >
                    Call {selectedMessage.firstName}
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-light-dark p-8">
              <IoMailOutline className="text-8xl mb-6 text-light-gray-3" />
              <p className="text-xl font-medium mb-2">No message selected</p>
              <p className="text-sm text-center">
                Select a message from the list to view its contents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
