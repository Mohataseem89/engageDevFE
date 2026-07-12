import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../utils/constants";
import { createSocketConnection } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();
  const loggedInUser = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const targetUser = Array.isArray(connections)
    ? connections.find((c) => c && c._id === targetUserId)
    : null;

  // Load history once when the chat opens
  useEffect(() => {
    if (!targetUserId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
          withCredentials: true,
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        setError(
          err.response?.status === 403
            ? "You can only chat with your connections."
            : "Failed to load chat history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [targetUserId]);

  // Connect socket once we know who we are and who we're chatting with
  useEffect(() => {
    if (!loggedInUser?._id || !targetUserId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[socket] connected, joining chat with", targetUserId);
      socket.emit("joinChat", { targetUserId });
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connection error:", err.message);
      toast.error("Chat connection failed: " + err.message);
    });

    socket.on("messageReceived", (message) => {
      // Only append messages relevant to this specific conversation
      const isThisConversation =
        (message.senderId === targetUserId && message.receiverId === loggedInUser._id) ||
        (message.senderId === loggedInUser._id && message.receiverId === targetUserId);
      if (isThisConversation) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("chatError", (msg) => {
      toast.error(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [loggedInUser?._id, targetUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;
    console.log("[socket] sending message to", targetUserId, ":", text.trim());
    socketRef.current.emit("sendMessage", { targetUserId, text: text.trim() });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      e.target.value = "";
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setIsUploadingFile(true);
      const res = await axios.post(
        `${BASE_URL}/chat/upload/${targetUserId}`,
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      socketRef.current?.emit("sendMessage", {
        targetUserId,
        fileUrl: res.data.fileUrl,
        fileType: res.data.fileType,
      });
    } catch (err) {
      toast.error(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to send file"
      );
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 mb-6">{error}</p>
          <Link to="/connections" className="btn btn-primary">
            Back to Connections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/connections" className="btn btn-ghost btn-sm text-black">
          ←
        </Link>
        <img
          src={
            targetUser?.photoUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              targetUser?.firstName || "User"
            )}&background=6366f1&color=fff`
          }
          alt={targetUser?.firstName || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold text-gray-900">
          {targetUser ? `${targetUser.firstName} ${targetUser.lastName || ""}` : "Chat"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl w-full mx-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            No messages yet. Say hi 👋
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.senderId === loggedInUser?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.fileType === "image" && msg.fileUrl && (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.fileUrl}
                          alt="Shared"
                          className="rounded-lg max-w-full max-h-64 mb-1 object-cover"
                        />
                      </a>
                    )}
                    {msg.fileType === "file" && msg.fileUrl && (
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-sm underline mb-1 ${
                          isMine ? "text-white" : "text-blue-600"
                        }`}
                      >
                        📎 Download file
                      </a>
                    )}
                    {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploadingFile}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
            className="btn btn-ghost btn-sm text-black"
            title="Attach a file or photo"
          >
            {isUploadingFile ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "📎"
            )}
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="input input-bordered flex-1 bg-white text-black"
          />
          <button onClick={sendMessage} className="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;