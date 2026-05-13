export const CONNECTION_EVENTS = {
  CONNECT: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",
} as const;

export const NOTIFICATION_EVENTS = {
  SEND: "notification_send",
  NEW : "notification_new",
  RECEIVE: "notification_receive",
  MARK_READ: "notification_mark_read",
  MARK_ALL_READ: "notification_mark_all_read",
  DELETE: "notification_delete",
  USER_NOTIFICATIONS: "notification_user_list",
  UNREAD_COUNT: "notification_unread_count",
  REQUEST_COUNT: "notification_request_count",
  READ_SYNC: "notification_read_sync",
} as const;
