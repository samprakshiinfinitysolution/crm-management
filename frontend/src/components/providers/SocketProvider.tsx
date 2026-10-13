"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store";
import { getSocket, disconnectSocket, WS_EVENTS } from "@/lib/socket";
import { crmApi } from "@/store/api/baseApi";
import { useGetOnlineUsersQuery } from "@/store/api/userApi";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
  isUserOnline: (userId?: string | null) => boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUserIds: [],
  isUserOnline: () => false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeOnlineIds, setRealtimeOnlineIds] = useState<string[] | null>(null);

  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Seed initial online users list via HTTP query
  const { data: initialOnlineData } = useGetOnlineUsersQuery(undefined, {
    skip: !user,
  });

  // Derived online users list: uses realtime updates when connected, falls back to HTTP response
  const onlineUserIds = useMemo(() => {
    if (!user) return [];
    if (realtimeOnlineIds !== null) {
      return realtimeOnlineIds;
    }
    return initialOnlineData?.data || [];
  }, [user, realtimeOnlineIds, initialOnlineData?.data]);

  const isUserOnline = useCallback(
    (userId?: string | null): boolean => {
      if (!userId) return false;
      return onlineUserIds.includes(userId);
    },
    [onlineUserIds],
  );

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(token);

    const onConnect = () => {
      setIsConnected(true);
      console.log("🟢 Connected to CRM WebSocket server");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("🔴 Disconnected from CRM WebSocket server");
    };

    const onUsersOnlineList = (list: string[]) => {
      if (Array.isArray(list)) {
        setRealtimeOnlineIds(list);
      }
    };

    const onUserStatusChanged = (payload: { userId: string; isOnline: boolean }) => {
      if (!payload?.userId) return;
      setRealtimeOnlineIds((prev) => {
        const currentList = prev !== null ? prev : (initialOnlineData?.data || []);
        if (payload.isOnline) {
          return currentList.includes(payload.userId) ? currentList : [...currentList, payload.userId];
        } else {
          return currentList.filter((id) => id !== payload.userId);
        }
      });
    };

    const onNewNotification = (data: { title?: string; message?: string }) => {
      toast.info(data.title || "New Notification", {
        description: data.message,
      });
      dispatch(crmApi.util.invalidateTags(["Notifications"]));
    };

    const onNotificationCount = () => {
      dispatch(crmApi.util.invalidateTags(["Notifications"]));
    };

    const onLeadAssigned = (data: { count?: number; message?: string }) => {
      toast.success(
        data.message || `${data.count || 1} new lead(s) assigned to you!`,
      );
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Lead",
          "Distribution",
          "Workload",
          "Notifications",
        ]),
      );
    };

    const onLeadReassigned = (data: { count?: number; message?: string }) => {
      toast.info(data.message || "Lead reassigned");
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Lead",
          "Distribution",
          "Workload",
          "Notifications",
        ]),
      );
    };

    const onLeadStatusChanged = () => {
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Lead",
          "Distribution",
          "Workload",
        ]),
      );
    };

    const onFollowUpDue = (data: { title?: string; message?: string }) => {
      toast.warning(data.title || "Follow-up Due", {
        description: data.message,
      });
      dispatch(crmApi.util.invalidateTags(["Notifications"]));
    };

    const onDashboardUpdate = () => {
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Workload",
          "Distribution",
          "Imports",
          "Dashboard",
          "Metrics",
        ]),
      );
    };

    const onIncomingChatMessage = (msg: {
      id?: string;
      conversationId?: string;
      senderId?: string;
      content?: string;
      sender?: { id: string; name: string };
    }) => {
      if (!msg || msg.senderId === user?.id) return;
      dispatch(crmApi.util.invalidateTags(["Conversations"]));
    };

    socket.on(WS_EVENTS.CONNECT, onConnect);
    socket.on(WS_EVENTS.DISCONNECT, onDisconnect);
    socket.on(WS_EVENTS.USERS_ONLINE_LIST, onUsersOnlineList);
    socket.on(WS_EVENTS.USER_STATUS_CHANGED, onUserStatusChanged);
    socket.on(WS_EVENTS.NOTIFICATION_NEW, onNewNotification);
    socket.on(WS_EVENTS.NOTIFICATION_COUNT, onNotificationCount);
    socket.on(WS_EVENTS.LEAD_ASSIGNED, onLeadAssigned);
    socket.on(WS_EVENTS.LEAD_REASSIGNED, onLeadReassigned);
    socket.on(WS_EVENTS.LEAD_STATUS_CHANGED, onLeadStatusChanged);
    socket.on(WS_EVENTS.FOLLOWUP_DUE, onFollowUpDue);
    socket.on(WS_EVENTS.DASHBOARD_METRICS_UPDATE, onDashboardUpdate);
    socket.on(WS_EVENTS.MESSAGE, onIncomingChatMessage);
    socket.on(WS_EVENTS.MESSAGE_NEW, onIncomingChatMessage);

    return () => {
      socket.off(WS_EVENTS.CONNECT, onConnect);
      socket.off(WS_EVENTS.DISCONNECT, onDisconnect);
      socket.off(WS_EVENTS.USERS_ONLINE_LIST, onUsersOnlineList);
      socket.off(WS_EVENTS.USER_STATUS_CHANGED, onUserStatusChanged);
      socket.off(WS_EVENTS.NOTIFICATION_NEW, onNewNotification);
      socket.off(WS_EVENTS.NOTIFICATION_COUNT, onNotificationCount);
      socket.off(WS_EVENTS.LEAD_ASSIGNED, onLeadAssigned);
      socket.off(WS_EVENTS.LEAD_REASSIGNED, onLeadReassigned);
      socket.off(WS_EVENTS.LEAD_STATUS_CHANGED, onLeadStatusChanged);
      socket.off(WS_EVENTS.FOLLOWUP_DUE, onFollowUpDue);
      socket.off(WS_EVENTS.DASHBOARD_METRICS_UPDATE, onDashboardUpdate);
      socket.off(WS_EVENTS.MESSAGE, onIncomingChatMessage);
      socket.off(WS_EVENTS.MESSAGE_NEW, onIncomingChatMessage);
    };
  }, [user, token, dispatch, initialOnlineData?.data]);

  const socketInstance = user ? getSocket(token) : null;

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        isConnected,
        onlineUserIds,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
