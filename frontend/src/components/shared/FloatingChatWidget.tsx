"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useGetConversationsQuery,
  useGetUsersQuery,
  useGetMessagesQuery,
  useCreateDirectConversationMutation,
  useSendMessageMutation,
  useSendAttachmentMutation,
  useMarkConversationAsReadMutation,
} from "@/store/api/userApi";
import { UserRole, type AuthUser, type ConversationMessage } from "@/types/api.types";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store";
import { useDebounce } from "@/lib/useDebounce";
import { useSocket } from "@/components/providers/SocketProvider";
import { crmApi } from "@/store/api/baseApi";
import { usePathname } from "next/navigation";
import {
  ChatHeader,
  ChatContactList,
  ChatMessagesView,
  ChatInputBar,
  ChatTriggerButton,
  type ChatContact,
  type ChatMessage,
  type LatestMessageInfo,
  type TabType,
} from "@/components/chat";


export function FloatingChatWidget() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  // Floating chat is exclusively for authenticated CRM members and should never
  // mount or attach listeners on login/auth routes or unauthenticated states.
  if (!user || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null;
  }

  return <FloatingChatWidgetInner key={pathname} user={user} pathname={pathname} />;
}

function FloatingChatWidgetInner({
  user,
}: {
  user: AuthUser;
  pathname: string;
}) {
  const dispatch = useAppDispatch();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadContactIds, setUnreadContactIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Draggable & Repositionable Floating Trigger State
  // -------------------------------------------------------------------------
  const BUTTON_SIZE = 56;
  const PADDING = 16;
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    hasMoved: false,
  });

  // Load saved position or initialize default on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crm_floating_chat_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === "number" &&
          typeof parsed.y === "number" &&
          !isNaN(parsed.x) &&
          !isNaN(parsed.y)
        ) {
          const clampedX = Math.min(
            Math.max(PADDING, parsed.x),
            window.innerWidth - BUTTON_SIZE - PADDING
          );
          const clampedY = Math.min(
            Math.max(PADDING, parsed.y),
            window.innerHeight - BUTTON_SIZE - PADDING
          );
          queueMicrotask(() => {
            setPosition({ x: clampedX, y: clampedY });
          });
          return;
        }
      }
    } catch {
      // Ignore storage access errors
    }

    queueMicrotask(() => {
      setPosition({
        x: Math.max(PADDING, window.innerWidth - BUTTON_SIZE - 24),
        y: Math.max(PADDING, window.innerHeight - BUTTON_SIZE - 24),
      });
    });
  }, []);

  // Re-clamp position if viewport resizes
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.min(
            Math.max(PADDING, prev.x),
            window.innerWidth - BUTTON_SIZE - PADDING
          ),
          y: Math.min(
            Math.max(PADDING, prev.y),
            window.innerHeight - BUTTON_SIZE - PADDING
          ),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Window pointer move and pointer end handlers during active dragging
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        dragRef.current.hasMoved = true;
      }

      const nextX = Math.min(
        Math.max(PADDING, dragRef.current.origX + deltaX),
        window.innerWidth - BUTTON_SIZE - PADDING
      );
      const nextY = Math.min(
        Math.max(PADDING, dragRef.current.origY + deltaY),
        window.innerHeight - BUTTON_SIZE - PADDING
      );

      setPosition({ x: nextX, y: nextY });
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handlePointerEnd = () => {
      setIsDragging(false);
      setPosition((curr) => {
        if (curr && dragRef.current.hasMoved) {
          try {
            localStorage.setItem("crm_floating_chat_pos", JSON.stringify(curr));
          } catch {
            // Ignore storage write error
          }
        }
        return curr;
      });

      // Clear hasMoved after small delay so click event doesn't fire toggle
      setTimeout(() => {
        dragRef.current.hasMoved = false;
      }, 80);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", handlePointerEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", handlePointerEnd);
    window.addEventListener("touchcancel", handlePointerEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handlePointerEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handlePointerEnd);
      window.removeEventListener("touchcancel", handlePointerEnd);
    };
  }, [isDragging]);

  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!position) return;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      origX: position.x,
      origY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  // Automatically close message box when navigation menus or sidebars are opened
  useEffect(() => {
    const handleClose = () => setIsOpen(false);

    window.addEventListener("crm:menu-open", handleClose);
    window.addEventListener("crm:close-chat", handleClose);

    // Also close if clicking any hamburger button, sidebar toggle, or dropdown menu trigger
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isMenuToggle = target.closest(
        'button[aria-label*="navigation" i], button[aria-label*="sidebar" i], button[aria-label*="menu" i], [data-slot="dropdown-menu-trigger"], [data-menu-toggle]'
      );
      if (isMenuToggle) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });

    return () => {
      window.removeEventListener("crm:menu-open", handleClose);
      window.removeEventListener("crm:close-chat", handleClose);
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  const [createDirectConversation] = useCreateDirectConversationMutation();
  const [sendMessageMutation] = useSendMessageMutation();
  const [sendAttachmentMutation, { isLoading: isUploadingAttachment }] =
    useSendAttachmentMutation();
  const [markConversationAsRead] = useMarkConversationAsReadMutation();

  const handleMarkAsRead = React.useCallback(
    (convId?: string | null) => {
      if (!convId) return;
      markConversationAsRead({ conversationId: convId })
        .unwrap()
        .catch((err) => {
          console.debug("Failed to mark conversation as read:", err);
        });
    },
    [markConversationAsRead],
  );

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    setUnreadContactIds((prev) => {
      const filtered = prev.filter((id) => id !== contact.id);
      if (filtered.length === 0) setHasNewMessage(false);
      return filtered;
    });

    if (contact.conversationId) {
      setActiveConversationId(contact.conversationId);
      handleMarkAsRead(contact.conversationId);
    } else {
      setActiveConversationId(null);
    }
  };

  const handleToggleOpen = () => {
    if (dragRef.current.hasMoved) {
      return;
    }
    setIsOpen((prev) => {
      const next = !prev;
      if (next && selectedContact) {
        const hasUnread = unreadContactIds.includes(selectedContact.id);
        if (hasUnread) {
          setUnreadContactIds((prevUnread) => {
            const filtered = prevUnread.filter((id) => id !== selectedContact.id);
            if (filtered.length === 0) setHasNewMessage(false);
            return filtered;
          });
          const currentConv = activeConversationId || selectedContact.conversationId;
          if (currentConv) {
            handleMarkAsRead(currentConv);
          }
        }
      }
      return next;
    });
  };

  const debounceValue = useDebounce(searchQuery, 500);

  const params = useMemo(
    () => ({
      search: debounceValue.trim() || undefined,
      status: "active",
      page: 1,
      limit: 50,
    }),
    [debounceValue],
  );

  const { data: searchedUsersRes } = useGetUsersQuery(params, {
    skip: !isOpen,
  });

  const { data: conversationsRes } = useGetConversationsQuery(undefined, {
    skip: !user,
    pollingInterval: 20000,
  });

  // Derive chat contacts from conversations and directory search
  const allContacts: ChatContact[] = useMemo(() => {
    const contactMap = new Map<string, ChatContact>();

    // 1. Existing conversations
    if (conversationsRes?.data && conversationsRes.data.length > 0) {
      for (const conversation of conversationsRes.data) {
        const otherParticipant =
          conversation.participants?.find((p) => p.userId !== user?.id) ??
          conversation.participants?.[0];
        const profile = otherParticipant?.user;
        if (profile && profile.id !== user?.id) {
          contactMap.set(profile.id, {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role || "SALES_EXECUTIVE",
            isActive: profile.isActive ?? true,
            conversationId: conversation.id,
          });
        }
      }
    }

    // 2. Direct search results
    if (searchedUsersRes?.data && searchedUsersRes.data.length > 0) {
      for (const u of searchedUsersRes.data) {
        if (u.id !== user?.id && !contactMap.has(u.id)) {
          contactMap.set(u.id, {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || "SALES_EXECUTIVE",
            isActive: u.isActive ?? true,
          });
        }
      }
    }

    return Array.from(contactMap.values());
  }, [conversationsRes, searchedUsersRes, user]);

  // Filter employees and admin/TL separately
  const employeesList = useMemo(() => {
    return allContacts.filter(
      (c) =>
        c.role === UserRole.SALES_EXECUTIVE ||
        c.role === "SALES_EXECUTIVE"
    );
  }, [allContacts]);

  const adminTlList = useMemo(() => {
    return allContacts.filter(
      (c) =>
        c.role === UserRole.ADMIN ||
        c.role === UserRole.TEAM_LEADER ||
        c.role === "ADMIN" ||
        c.role === "TEAM_LEADER"
    );
  }, [allContacts]);

  const activeContactList = activeTab === "employees" ? employeesList : adminTlList;

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return activeContactList;
    const q = searchQuery.toLowerCase();
    return activeContactList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q),
    );
  }, [activeContactList, searchQuery]);

  const targetConvId = activeConversationId || selectedContact?.conversationId;
  const { data: messagesRes, isLoading: isLoadingMessages } = useGetMessagesQuery(
    { conversationId: targetConvId! },
    { skip: !isOpen || !selectedContact || !targetConvId },
  );

  // Derive the active contact's server messages purely from query data so they
  // can be merged into local conversation state during render (instead of via a
  // setState-in-effect, which the React compiler flags as a cascading-render risk).
  const activeServerMessages = useMemo<{
    contactId: string;
    messages: ChatMessage[];
  } | null>(() => {
    if (!selectedContact || !messagesRes?.data) return null;

    const payload: unknown = messagesRes.data;
    const messageList: ConversationMessage[] = Array.isArray(payload)
      ? (payload as ConversationMessage[])
      : Array.isArray((payload as { messages?: ConversationMessage[] })?.messages)
        ? (payload as { messages: ConversationMessage[] }).messages
        : [];

    const serverMessages: ChatMessage[] = messageList.map((m) => {
      const isAttachment = m.type === "IMAGE" || m.type === "FILE";
      let attachment: ChatMessage["attachment"];
      let text = m.content;
      if (isAttachment) {
        try {
          const parsed = JSON.parse(m.content);
          attachment = {
            url: parsed.url || parsed.secureUrl,
            secureUrl: parsed.secureUrl,
            publicId: parsed.publicId,
            resourceType: parsed.resourceType,
            format: parsed.format,
            bytes: parsed.bytes,
            width: parsed.width,
            height: parsed.height,
            fileName: parsed.fileName,
            mimeType: parsed.mimeType,
            caption: parsed.caption,
          };
          text = parsed.caption || "";
        } catch {
          // Fall back to treating content as plain text.
        }
      }
      return {
        id: m.id,
        sender: m.senderId === user?.id ? "user" : "other",
        text,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawCreatedAt: m.createdAt,
        type: m.type,
        attachment,
      };
    });

    return { contactId: selectedContact.id, messages: serverMessages };
  }, [messagesRes?.data, selectedContact, user?.id]);

  // Merge freshly-loaded server messages into local state during render, guarded
  // by a stored previous key so it only runs when the loaded payload changes.
  const activeMessagesKey = activeServerMessages
    ? `${activeServerMessages.contactId}:${activeServerMessages.messages
        .map((m) => m.id)
        .join(",")}`
    : "";
  const [prevMessagesKey, setPrevMessagesKey] = useState("");
  if (activeServerMessages && prevMessagesKey !== activeMessagesKey) {
    setPrevMessagesKey(activeMessagesKey);
    setConversations((prev) => ({
      ...prev,
      [activeServerMessages.contactId]: activeServerMessages.messages,
    }));
  }


  // Listen for real-time incoming messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg: {
      id?: string;
      conversationId?: string;
      senderId?: string;
      content: string;
      type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
      createdAt?: string | Date;
      sender?: { id: string; name: string };
    }) => {
      if (!msg || !msg.senderId || msg.senderId === user?.id) return;

      const senderId = msg.senderId;

      // Parse attachment payloads (IMAGE/FILE store JSON in content).
      let text = msg.content;
      let attachment: ChatMessage["attachment"];
      const type: ChatMessage["type"] = msg.type;
      if (msg.type === "IMAGE" || msg.type === "FILE") {
        try {
          const parsed = JSON.parse(msg.content);
          attachment = {
            url: parsed.url || parsed.secureUrl,
            secureUrl: parsed.secureUrl,
            publicId: parsed.publicId,
            resourceType: parsed.resourceType,
            format: parsed.format,
            bytes: parsed.bytes,
            width: parsed.width,
            height: parsed.height,
            fileName: parsed.fileName,
            mimeType: parsed.mimeType,
            caption: parsed.caption,
          };
          text = parsed.caption || "";
        } catch {
          // Fall back to plain text.
        }
      }

      setConversations((prev) => {
        const contactMsgs = prev[senderId] || [];
        if (contactMsgs.some((m) => m.id === msg.id)) {
          return prev;
        }
        return {
          ...prev,
          [senderId]: [
            ...contactMsgs,
            {
              id: msg.id || Date.now().toString(),
              sender: "other",
              text,
              timestamp: msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              rawCreatedAt: msg.createdAt || Date.now(),
              type,
              attachment,
            },
          ],
        };
      });

      // Show pulse notification indicator if widget is closed or viewing a different contact
      if (!isOpen || selectedContact?.id !== senderId) {
        setHasNewMessage(true);
        setUnreadContactIds((prev) =>
          prev.includes(senderId) ? prev : [...prev, senderId],
        );
        const senderName = msg.sender?.name || "Colleague";
        const preview =
          type === "IMAGE"
            ? "📷 Sent an image"
            : type === "FILE"
            ? "📎 Sent an attachment"
            : text.slice(0, 60);
        toast.info(`Message from ${senderName}`, {
          description: preview,
        });
      } else {
        // Chat is open with this contact: mark conversation as read on the backend
        const activeId = msg.conversationId || targetConvId;
        if (activeId) {
          handleMarkAsRead(activeId);
        }
      }

      if (msg.conversationId) {
        dispatch(
          crmApi.util.invalidateTags([
            { type: "Conversations", id: `MESSAGES_${msg.conversationId}` },
            { type: "Conversations", id: "LIST" },
          ]),
        );
      }
    };

    socket.on("message", handleIncomingMessage);
    socket.on("message:new", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.off("message:new", handleIncomingMessage);
    };
  }, [
    socket,
    user?.id,
    isOpen,
    selectedContact,
    targetConvId,
    dispatch,
    handleMarkAsRead,
  ]);

  // Join and leave active conversation rooms for directed broadcasts
  useEffect(() => {
    if (!socket || !targetConvId) return;
    socket.emit("conversation:join", { conversationId: targetConvId });
    return () => {
      socket.emit("conversation:leave", { conversationId: targetConvId });
    };
  }, [socket, targetConvId]);

  // Helper to extract the latest message for any contact
  const getContactLatestMessage = React.useCallback(
    (contact: ChatContact): LatestMessageInfo => {
      // 1. Check local state (messages sent or received in this session)
      const localMsgs = conversations[contact.id];
      let localLatest: LatestMessageInfo | null = null;
      if (localMsgs && localMsgs.length > 0) {
        const last = localMsgs[localMsgs.length - 1];
        localLatest = {
          text: last.text,
          timestamp: last.timestamp,
          timeMs: last.rawCreatedAt ? new Date(last.rawCreatedAt).getTime() : 0,
        };
      }

      // 2. Check conversation history from server
      let serverLatest: LatestMessageInfo | null = null;
      if (conversationsRes?.data) {
        const conv = conversationsRes.data.find(
          (c) =>
            c.id === contact.conversationId ||
            c.participants?.some((p) => p.userId === contact.id),
        );
        if (conv && conv.messages && conv.messages.length > 0) {
          const msg = conv.messages[0];
          const date = new Date(msg.createdAt);
          serverLatest = {
            text: msg.content,
            timestamp: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timeMs: date.getTime(),
          };
        }
      }

      if (localLatest && serverLatest) {
        return localLatest.timeMs >= serverLatest.timeMs ? localLatest : serverLatest;
      }
      return localLatest || serverLatest || { text: "", timestamp: "", timeMs: 0 };
    },
    [conversations, conversationsRes],
  );

  // Sort contacts by latest message timestamp descending
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      const msgA = getContactLatestMessage(a);
      const msgB = getContactLatestMessage(b);

      if (msgA.timeMs !== msgB.timeMs) {
        return msgB.timeMs - msgA.timeMs;
      }

      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredContacts, getContactLatestMessage]);

  const currentMessages = useMemo(() => {
    if (!selectedContact) return [];
    return conversations[selectedContact.id] || [];
  }, [selectedContact, conversations]);

  // Smoothly scroll to bottom on message updates
  useEffect(() => {
    if (selectedContact) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact) return;

    const contactId = selectedContact.id;
    const textToSend = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawCreatedAt: Date.now(),
    };

    setConversations((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), userMsg],
    }));
    setInput("");

    let targetConv = activeConversationId || selectedContact.conversationId;
    if (!targetConv) {
      try {
        const res = await createDirectConversation({ toUserId: contactId }).unwrap();
        if (res.data?.id) {
          targetConv = res.data.id;
          setActiveConversationId(res.data.id);
        }
      } catch (err) {
        console.error("Failed to initialize direct conversation before sending:", err);
      }
    }

    if (targetConv) {
      sendMessageMutation({
        conversationId: targetConv,
        content: textToSend,
      }).catch((err) => {
        console.error("Failed to send message via API:", err);
      });
    }
  };
  // Send an image/file attachment via Cloudinary-backed endpoint.
  const handleAttach = async (file: File) => {
    if (!selectedContact) return;

    const contactId = selectedContact.id;
    const isImage = file.type.startsWith("image/");
    const tempId = `uploading-${Date.now()}`;
    const now = new Date();

    // Optimistic "uploading" bubble so the UI feels instant.
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: "user",
      text: "",
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      rawCreatedAt: now.getTime(),
      type: isImage ? "IMAGE" : "FILE",
      attachment: {
        url: "",
        fileName: file.name,
        mimeType: file.type,
        bytes: file.size,
      },
      isUploading: true,
    };
    setConversations((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), optimisticMsg],
    }));

    // Ensure a conversation exists before uploading.
    let targetConv = activeConversationId || selectedContact.conversationId;
    if (!targetConv) {
      try {
        const res = await createDirectConversation({ toUserId: contactId }).unwrap();
        if (res.data?.id) {
          targetConv = res.data.id;
          setActiveConversationId(res.data.id);
        }
      } catch (err) {
        console.error("Failed to initialize conversation before attachment:", err);
        toast.error("Couldn't start the conversation. Please try again.");
        setConversations((prev) => ({
          ...prev,
          [contactId]: (prev[contactId] || []).filter((m) => m.id !== tempId),
        }));
        return;
      }
    }

    if (!targetConv) return;

    try {
      const res = await sendAttachmentMutation({
        conversationId: targetConv,
        file,
        caption: input.trim() || undefined,
      }).unwrap();

      const sent = res.data;
      const confirmed: ChatMessage = {
        id: sent?.id || tempId,
        sender: "user",
        text: input.trim(),
        timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawCreatedAt: sent?.createdAt || now.getTime(),
        type: sent?.type || (isImage ? "IMAGE" : "FILE"),
        attachment: optimisticMsg.attachment,
      };

      setConversations((prev) => ({
        ...prev,
        [contactId]: (prev[contactId] || []).map((m) =>
          m.id === tempId ? confirmed : m,
        ),
      }));
      setInput("");
    } catch (err: unknown) {
      console.error("Failed to upload attachment:", err);
      // Remove the optimistic bubble on failure.
      setConversations((prev) => ({
        ...prev,
        [contactId]: (prev[contactId] || []).filter((m) => m.id !== tempId),
      }));
      const errorObj = err as { data?: { message?: string } };
      const message =
        errorObj?.data?.message ||
        "Failed to send attachment. Please check your connection and try again.";
      toast.error(message);
    }
  };



  const mergedUnreadContactIds = useMemo(() => {
    const ids = new Set(unreadContactIds);
    if (conversationsRes?.data && user?.id) {
      for (const conv of conversationsRes.data) {
        const myParticipant = conv.participants?.find((p) => p.userId === user.id);
        const otherParticipant =
          conv.participants?.find((p) => p.userId !== user.id) ?? conv.participants?.[0];
        const otherUserId = otherParticipant?.user?.id || otherParticipant?.userId;
        if (!otherUserId || otherUserId === user.id) continue;

        const latestMsg = conv.messages?.[0];
        if (latestMsg && latestMsg.senderId !== user.id) {
          const lastRead = myParticipant?.lastReadAt
            ? new Date(myParticipant.lastReadAt).getTime()
            : 0;
          const msgTime = new Date(latestMsg.createdAt).getTime();
          if (msgTime > lastRead && selectedContact?.id !== otherUserId) {
            ids.add(otherUserId);
          }
        }
      }
    }
    return Array.from(ids);
  }, [unreadContactIds, conversationsRes, user, selectedContact]);
  const totalUnreadCount = mergedUnreadContactIds.length;
  const shouldShowPulse = hasNewMessage || totalUnreadCount > 0;

  // Only render the widget for authenticated workspace users
  if (!user) {
    return null;
  }

  const isPositioned = position !== null;
  const isLowerHalf = position
    ? position.y > (typeof window !== "undefined" ? window.innerHeight / 2 : 500)
    : true;
  const isRightHalf = position
    ? position.x > (typeof window !== "undefined" ? window.innerWidth / 2 : 500)
    : true;

  return (
    <>
      {/* Chat Modal / Popup */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            ...(isPositioned
              ? {
                  ...(isLowerHalf
                    ? { bottom: `${window.innerHeight - position.y + 12}px` }
                    : { top: `${position.y + BUTTON_SIZE + 12}px` }),
                  ...(isRightHalf
                    ? { right: `${Math.max(16, window.innerWidth - position.x - BUTTON_SIZE)}px` }
                    : { left: `${Math.max(16, position.x)}px` }),
                }
              : {
                  bottom: "88px",
                  right: "24px",
                }),
            maxHeight: "calc(100vh - 100px)",
          }}
          className="z-50 w-80 sm:w-96 h-130 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all transform animate-in fade-in duration-200 no-scrollbar"
        >
          <ChatHeader
            selectedContact={selectedContact}
            onBack={() => {
              setSelectedContact(null);
              setActiveConversationId(null);
            }}
            onClose={() => setIsOpen(false)}
          />

          {!selectedContact ? (
            <ChatContactList
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              employeesCount={employeesList.length}
              adminTlCount={adminTlList.length}
              contacts={sortedContacts}
              unreadContactIds={mergedUnreadContactIds}
              getContactLatestMessage={getContactLatestMessage}
              onSelectContact={handleSelectContact}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 dark:bg-slate-950/30 no-scrollbar">
              <ChatMessagesView
                isLoading={isLoadingMessages}
                messages={currentMessages}
                selectedContact={selectedContact}
                messagesEndRef={messagesEndRef}
              />
              <ChatInputBar
                input={input}
                contactName={selectedContact.name}
                onInputChange={setInput}
                onSubmit={handleSendMessage}
                onAttach={handleAttach}
                isUploading={isUploadingAttachment}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Trigger Icon (Draggable & Repositionable) */}
      <div
        style={{
          position: "fixed",
          ...(isPositioned
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
              }
            : {
                bottom: "24px",
                right: "24px",
              }),
          touchAction: "none",
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          handleStartDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches.length !== 1) return;
          handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="z-50 select-none"
      >
        <ChatTriggerButton
          isOpen={isOpen}
          hasNewMessage={shouldShowPulse}
          unreadCount={totalUnreadCount}
          onToggle={handleToggleOpen}
          isDragging={isDragging}
        />
      </div>
    </>
  );
}
