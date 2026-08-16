import { useEffect, useState } from "react";

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

import {
  getMyTenancy,
} from "../../firebase/tenancyService";

import {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from "../../firebase/messageService";

function Messages() {
  const { user } = useAuth();

  const [tenancy, setTenancy] =
    useState(null);

  const [conversation, setConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [editingMessageId, setEditingMessageId] =
    useState(null);

  const [editingText, setEditingText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [showConversation, setShowConversation] =
    useState(false);

  // ==========================================
  // LOAD TENANCY
  // ==========================================

  useEffect(() => {
    async function loadTenancy() {
      if (!user?.uid) return;

      try {
        const data =
          await getMyTenancy(user.uid);

        setTenancy(data);
      } catch (error) {
        console.error(
          "Error loading tenancy:",
          error,
        );
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
      const data =
        await getOrCreateConversation({
          tenantId: user.uid,

          landlordId:
            tenancy.landlordId || "",

          propertyId:
            tenancy.propertyId || "",

          propertyTitle:
            tenancy.propertyTitle || "",

          tenantName:
            tenancy.tenantName ||
            user.fullName ||
            user.displayName ||
            "",

          landlordName:
            tenancy.landlordName ||
            "Landlord",
        });

      setConversation(data);
      setShowConversation(true);
    } catch (error) {
      console.error(
        "Error opening conversation:",
        error,
      );
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

    const unsubscribe =
      subscribeToMessages(
        conversation.id,
        (data) => {
          setMessages(data);
        },
      );

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
        conversationId:
          conversation.id,

        senderId: user.uid,

        senderRole: "tenant",

        senderName:
          user.fullName ||
          user.displayName ||
          user.email ||
          "Tenant",

        text,
      });

      setText("");
    } catch (error) {
      console.error(
        "Error sending message:",
        error,
      );

      alert(
        "Failed to send message. Please try again.",
      );
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
      await editMessage(
        messageId,
        user.uid,
        editingText,
      );

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error(
        "Error editing message:",
        error,
      );

      alert(
        "Failed to edit message.",
      );
    }
  }

  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  async function handleDeleteMessage(
    messageId,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error(
        "Error deleting message:",
        error,
      );

      alert(
        "Failed to delete message.",
      );
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-slate-500">
            Loading messages...
          </p>
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
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm">

          <FaUser
            size={45}
            className="mx-auto text-blue-600"
          />

          <h1 className="mt-5 text-2xl font-bold text-slate-800">
            No Active Rental
          </h1>

          <p className="mt-3 text-slate-500">
            You can message your landlord
            after you have an active rental.
          </p>

        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Messages
          </h1>

          <p className="mt-2 text-slate-500">
            Communicate with your landlord
            about your rental.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm lg:grid-cols-3">

          {/* ================================= */}
          {/* CONVERSATIONS */}
          {/* ================================= */}

          <div
            className={`border-r ${
              showConversation
                ? "hidden lg:block"
                : "block"
            }`}
          >

            <div className="border-b p-5">
              <h2 className="font-bold text-slate-800">
                Conversations
              </h2>
            </div>

            <button
              type="button"
              onClick={
                openLandlordConversation
              }
              className="flex w-full items-center gap-4 border-b p-5 text-left hover:bg-slate-50"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FaUser />
              </div>

              <div className="min-w-0 flex-1">

                <h3 className="font-semibold text-slate-800">
                  {tenancy.landlordName ||
                    "Landlord"}
                </h3>

                <p className="truncate text-sm text-slate-500">
                  {tenancy.propertyTitle}
                </p>

              </div>

            </button>

          </div>

          {/* ================================= */}
          {/* CHAT */}
          {/* ================================= */}

          <div
            className={`flex min-h-[600px] flex-col lg:col-span-2 ${
              showConversation
                ? "flex"
                : "hidden lg:flex"
            }`}
          >

            {!conversation ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">

                <div>

                  <FaUser
                    size={45}
                    className="mx-auto text-slate-300"
                  />

                  <h2 className="mt-4 text-xl font-semibold text-slate-700">
                    Select a conversation
                  </h2>

                  <p className="mt-2 text-slate-500">
                    Select your landlord to
                    start messaging.
                  </p>

                </div>

              </div>
            ) : (
              <>

                {/* ================================= */}
                {/* CHAT HEADER */}
                {/* ================================= */}

                <div className="flex items-center gap-3 border-b p-5">

                  <button
                    type="button"
                    onClick={() =>
                      setShowConversation(
                        false,
                      )
                    }
                    className="lg:hidden"
                  >
                    <FaArrowLeft />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FaUser />
                  </div>

                  <div>

                    <h2 className="font-semibold text-slate-800">
                      {conversation.landlordName ||
                        "Landlord"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {conversation.propertyTitle}
                    </p>

                  </div>

                </div>

                {/* ================================= */}
                {/* MESSAGES */}
                {/* ================================= */}

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">

                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">

                      <div>

                        <p className="font-medium text-slate-600">
                          No messages yet.
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Send a message to
                          start the conversation.
                        </p>

                      </div>

                    </div>
                  ) : (
                    messages.map(
                      (message) => {

                        const isMine =
                          message.senderId ===
                          user.uid;

                        const isEditing =
                          editingMessageId ===
                          message.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >

                            <div
                              className={`group max-w-[80%] ${
                                isMine
                                  ? "items-end"
                                  : "items-start"
                              }`}
                            >

                              {/* Message Bubble */}

                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isMine
                                    ? "rounded-br-md bg-blue-600 text-white"
                                    : "rounded-bl-md bg-white text-slate-800 shadow-sm"
                                }`}
                              >

                                {!isMine && (
                                  <p className="mb-1 text-xs font-semibold text-blue-600">
                                    {message.senderName ||
                                      "Landlord"}
                                  </p>
                                )}

                                {isEditing ? (
                                  <div className="min-w-[260px]">

                                    <textarea
                                      value={
                                        editingText
                                      }
                                      onChange={(
                                        e,
                                      ) =>
                                        setEditingText(
                                          e.target
                                            .value,
                                        )
                                      }
                                      rows="3"
                                      autoFocus
                                      className="w-full rounded-lg border border-white/30 bg-white/10 p-2 text-sm text-white outline-none placeholder:text-white/60"
                                    />

                                    <div className="mt-2 flex justify-end gap-2">

                                      <button
                                        type="button"
                                        onClick={
                                          handleCancelEdit
                                        }
                                        className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1 text-xs hover:bg-white/30"
                                      >
                                        <FaTimes />
                                        Cancel
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSaveEdit(
                                            message.id,
                                          )
                                        }
                                        className="flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs text-blue-600 hover:bg-slate-100"
                                      >
                                        <FaCheck />
                                        Save
                                      </button>

                                    </div>

                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap text-sm leading-6">
                                    {message.text}
                                  </p>
                                )}

                              </div>

                              {/* ================================= */}
                              {/* EDIT / DELETE BUTTONS */}
                              {/* ================================= */}

                              {isMine &&
                                !isEditing && (
                                  <div className="mt-1 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartEdit(
                                          message,
                                        )
                                      }
                                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-blue-600"
                                    >
                                      <FaEdit />
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteMessage(
                                          message.id,
                                        )
                                      }
                                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-600"
                                    >
                                      <FaTrash />
                                      Delete
                                    </button>

                                  </div>
                                )}

                            </div>

                          </div>
                        );
                      },
                    )
                  )}

                </div>

                {/* ================================= */}
                {/* MESSAGE INPUT */}
                {/* ================================= */}

                <form
                  onSubmit={
                    handleSendMessage
                  }
                  className="border-t bg-white p-4"
                >

                  <div className="flex items-center gap-3">

                    <input
                      type="text"
                      value={text}
                      onChange={(e) =>
                        setText(
                          e.target.value,
                        )
                      }
                      placeholder="Type your message..."
                      className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                    />

                    <button
                      type="submit"
                      disabled={
                        sending ||
                        !text.trim()
                      }
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaPaperPlane />
                    </button>

                  </div>

                </form>

              </>
            )}

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Messages;