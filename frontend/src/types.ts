export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
};

export type EmailItem = {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  scheduledTime: string;
  status: string;
  senderEmail: string;
  sentAt: string | null;
  createdAt: string;
};
