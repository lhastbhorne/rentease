import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaPaperPlane,
  FaUser,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import { useAuth } from "../../contexts/AuthContext";

import { getMyTenancy } from "../../firebase/tenancyService";

import {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from "../../firebase/messageService";

function Messages() {
  const { user } = useAuth();

  const [tenancy, setTenancy] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [showConversation, setShowConversation] = useState(false);

  // ==========================================
  // LOAD TENANCY
  // ==========================================

  useEffect(() => {
    async function loadTenancy() {
      if (!user?.uid) return;

      try {
        const data = await getMyTenancy(user.uid);

        setTenancy(data);
      } catch (error) {
        console.error("Error loading tenancy:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTenancy();
  }, [user]);

  // ==========================================
  // OPEN LANDLORD CONVERSATION
  // ==========================================

  async function openLandlordConversation() {
    if (!user?.uid || !tenancy) {
      return;
    }

    try {
      const data = await getOrCreateConversation({
        tenantId: user.uid,

        landlordId: tenancy.landlordId || "",

        propertyId: tenancy.propertyId || "",

        propertyTitle: tenancy.propertyTitle || "",

        tenantName:
          tenancy.tenantName || user.fullName || user.displayName || "",

        landlordName: tenancy.landlordName || "Landlord",
      });

      setConversation(data);
      setShowConversation(true);
    } catch (error) {
      console.error("Error opening conversation:", error);
    }
  }

  // ==========================================
  // REAL-TIME MESSAGE LISTENER
  // ==========================================

  useEffect(() => {
    if (!conversation?.id) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(conversation.id, (data) => {
      setMessages(data);
    });

    return () => {
      unsubscribe();
    };
  }, [conversation]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    if (!conversation) {
      return;
    }

    try {
      setSending(true);

      await sendMessage({
        conversationId: conversation.id,

        senderId: user.uid,

        senderRole: "tenant",

        senderName: user.fullName || user.displayName || user.email || "Tenant",

        text: text.trim(),
      });

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);

      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // ==========================================
  // START EDITING
  // ==========================================

  function handleStartEdit(message) {
    setEditingMessageId(message.id);
    setEditingText(message.text);
  }

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  function handleCancelEdit() {
    setEditingMessageId(null);
    setEditingText("");
  }

  // ==========================================
  // SAVE EDIT
  // ==========================================

  async function handleSaveEdit(messageId) {
    if (!editingText.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      await editMessage(messageId, user.uid, editingText.trim());

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error editing message:", error);

      alert("Failed to edit message.");
    }
  }

  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  async function handleDeleteMessage(messageId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);

      alert("Failed to delete message.");
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading messages...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // NO ACTIVE RENTAL
  // ==========================================

  if (!tenancy) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 200,
            }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          >
            <FaUser size={28} />
          </motion.div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            No Active Rental
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            You can message your landlord after you have an active rental.
          </p>
        </motion.div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl"
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-6 sm:mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl"
          >
            Messages
          </motion.h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Communicate with your landlord about your rental.
          </p>
        </div>

        {/* ================================= */}
        {/* MESSAGING CONTAINER */}
        {/* ================================= */}

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="grid min-h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-3"
        >
          {/* ================================= */}
          {/* CONVERSATIONS */}
          {/* ================================= */}

          <div
            className={`border-slate-200 dark:border-slate-800 lg:border-r ${
              showConversation ? "hidden lg:block" : "block"
            }`}
          >
            {/* Conversations Header */}

            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Conversations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Your rental communication
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <FaUser size={14} />
                </div>
              </div>
            </div>

            {/* Landlord Conversation */}

            <motion.button
              type="button"
              onClick={openLandlordConversation}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.99 }}
              className={`flex w-full items-center gap-4 border-b border-slate-200 p-5 text-left transition-colors duration-200 dark:border-slate-800 ${
                conversation
                  ? "bg-blue-50 dark:bg-blue-500/10"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              {/* Avatar */}

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              >
                <FaUser />
              </motion.div>

              {/* Details */}

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                  {tenancy.landlordName || "Landlord"}
                </h3>

                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {tenancy.propertyTitle || "Rental Property"}
                </p>
              </div>

              {/* Active Indicator */}

              {conversation && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                />
              )}
            </motion.button>

            {/* Privacy Notice */}

            <div className="m-5 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
              <p className="text-xs leading-5 text-blue-700 dark:text-blue-300">
                Messages are kept within RentEase so you can communicate about
                your rental safely.
              </p>
            </div>
          </div>

          {/* ================================= */}
          {/* CHAT */}
          {/* ================================= */}

          <div
            className={`flex min-h-[650px] flex-col lg:col-span-2 ${
              showConversation ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* ================================= */}
            {/* NO CONVERSATION SELECTED */}
            {/* ================================= */}

            {!conversation ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-1 items-center justify-center p-8 text-center"
              >
                <div className="max-w-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                    }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  >
                    <FaUser size={25} />
                  </motion.div>

                  <h2 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">
                    Select a conversation
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Select your landlord to start messaging.
                  </p>

                  <motion.button
                    type="button"
                    onClick={openLandlordConversation}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Open Conversation
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* ================================= */}
                {/* CHAT HEADER */}
                {/* ================================= */}

                <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                  {/* Mobile Back Button */}

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConversation(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <FaArrowLeft />
                  </motion.button>

                  {/* Avatar */}

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    <FaUser />
                  </motion.div>

                  {/* Details */}

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-slate-900 dark:text-white">
                      {conversation.landlordName || "Landlord"}
                    </h2>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {conversation.propertyTitle || "Rental Property"}
                    </p>
                  </div>

                  {/* Online / Active Indicator */}

                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Active rental
                    </span>
                  </div>
                </div>

                {/* ================================= */}
                {/* MESSAGES */}
                {/* ================================= */}

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-950 sm:p-5">
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex h-full min-h-[450px] items-center justify-center text-center"
                    >
                      <div>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500">
                          <FaPaperPlane />
                        </div>

                        <p className="mt-4 font-medium text-slate-700 dark:text-slate-300">
                          No messages yet.
                        </p>

                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                          Send a message to start the conversation.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((message) => {
                        const isMine = message.senderId === user.uid;

                        const isEditing = editingMessageId === message.id;

                        return (
                          <motion.div
                            key={message.id}
                            layout
                            initial={{
                              opacity: 0,
                              y: 10,
                              scale: 0.98,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            transition={{
                              duration: 0.2,
                            }}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`group flex max-w-[88%] flex-col sm:max-w-[75%] ${
                                isMine ? "items-end" : "items-start"
                              }`}
                            >
                              {/* Message Bubble */}

                              <motion.div
                                whileHover={{
                                  y: -1,
                                }}
                                className={`rounded-2xl px-4 py-3 shadow-sm ${
                                  isMine
                                    ? "rounded-br-md bg-blue-600 text-white"
                                    : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                }`}
                              >
                                {/* Sender Name */}

                                {!isMine && (
                                  <p className="mb-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    {message.senderName || "Landlord"}
                                  </p>
                                )}

                                {/* Editing */}

                                {isEditing ? (
                                  <div className="min-w-[240px] sm:min-w-[280px]">
                                    <textarea
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      rows={3}
                                      autoFocus
                                      className="w-full resize-none rounded-lg border border-white/30 bg-white/10 p-2.5 text-sm leading-5 text-white outline-none placeholder:text-white/60 focus:border-white/50"
                                    />

                                    <div className="mt-2 flex justify-end gap-2">
                                      <motion.button
                                        type="button"
                                        whileTap={{
                                          scale: 0.95,
                                        }}
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/25"
                                      >
                                        <FaTimes />
                                        Cancel
                                      </motion.button>

                                      <motion.button
                                        type="button"
                                        whileTap={{
                                          scale: 0.95,
                                        }}
                                        onClick={() =>
                                          handleSaveEdit(message.id)
                                        }
                                        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-slate-100"
                                      >
                                        <FaCheck />
                                        Save
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                    {message.text}
                                  </p>
                                )}
                              </motion.div>

                              {/* ================================= */}
                              {/* EDIT / DELETE BUTTONS */}
                              {/* ================================= */}

                              {isMine && !isEditing && (
                                <div className="mt-1.5 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                  <motion.button
                                    type="button"
                                    whileTap={{
                                      scale: 0.95,
                                    }}
                                    onClick={() => handleStartEdit(message)}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-200 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                                  >
                                    <FaEdit />
                                    Edit
                                  </motion.button>

                                  <motion.button
                                    type="button"
                                    whileTap={{
                                      scale: 0.95,
                                    }}
                                    onClick={() =>
                                      handleDeleteMessage(message.id)
                                    }
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-100 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                  >
                                    <FaTrash />
                                    Delete
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* ================================= */}
                {/* MESSAGE INPUT */}
                {/* ================================= */}

                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-slate-200 bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-4"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                    />

                    <motion.button
                      type="submit"
                      disabled={sending || !text.trim()}
                      whileHover={
                        !sending && text.trim() ? { scale: 1.05 } : {}
                      }
                      whileTap={!sending && text.trim() ? { scale: 0.95 } : {}}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                    >
                      {sending ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <FaPaperPlane size={15} />
                      )}
                    </motion.button>
                  </div>

                  <p className="mt-2 hidden text-[11px] text-slate-400 dark:text-slate-500 sm:block">
                    Keep your rental communication within RentEase.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

export default Messages;
