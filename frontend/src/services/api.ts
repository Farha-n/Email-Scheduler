import { EmailItem, User } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const fetchJson = async <T>(path: string, options?: RequestInit) => {
  const shouldSendJson = Boolean(options?.body);
  const headers: HeadersInit = {
    ...(shouldSendJson ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers ?? {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};

export const getCurrentUser = () =>
  fetchJson<{ user: User | null }>("/api/auth/me");

export const logout = () =>
  fetchJson<{ success: boolean }>("/api/auth/logout", { method: "POST" });

export const scheduleEmails = (payload: {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetween: number;
  hourlyLimit: number;
  zoneId?: string;
}) =>
  fetchJson<{ scheduled: number }>("/api/emails/schedule", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getScheduledEmails = () =>
  fetchJson<{ emails: EmailItem[] }>("/api/emails/scheduled");

export const getSentEmails = () =>
  fetchJson<{ emails: EmailItem[] }>("/api/emails/sent");

export const deleteEmail = (id: number) =>
  fetchJson<{ success: boolean }>(`/api/emails/${id}`, { method: "DELETE" });

export const getGoogleAuthUrl = () => `${API_BASE}/api/auth/google`;
