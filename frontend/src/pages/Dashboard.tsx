import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Tabs } from "../components/Tabs";
import { EmailTable } from "../components/EmailTable";
import { ComposeModal } from "../components/ComposeModal";
import { EmailItem, User } from "../types";
import {
  deleteEmail,
  getScheduledEmails,
  getSentEmails,
  logout,
  scheduleEmails
} from "../services/api";

export const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [tab, setTab] = useState<"scheduled" | "sent">("scheduled");
  const [scheduledEmails, setScheduledEmails] = useState<EmailItem[]>([]);
  const [sentEmails, setSentEmails] = useState<EmailItem[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [search, setSearch] = useState("");
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  const loadScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const response = await getScheduledEmails();
      setScheduledEmails(response.emails);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const loadSent = async () => {
    setLoadingSent(true);
    try {
      const response = await getSentEmails();
      setSentEmails(response.emails);
    } finally {
      setLoadingSent(false);
    }
  };

  useEffect(() => {
    loadScheduled();
    loadSent();
  }, []);

  const normalizeText = (value: string) => value.toLowerCase();

  const filteredScheduled = useMemo(() => {
    if (!search.trim()) {
      return scheduledEmails;
    }
    const searchTerm = normalizeText(search);
    return scheduledEmails.filter((email) =>
      [email.recipient, email.subject].some((field) => normalizeText(field).includes(searchTerm))
    );
  }, [scheduledEmails, search]);

  const filteredSent = useMemo(() => {
    let result = sentEmails;
    if (search.trim()) {
      const searchTerm = normalizeText(search);
      result = result.filter((email) =>
        [email.recipient, email.subject].some((field) => normalizeText(field).includes(searchTerm))
      );
    }
    if (showFailedOnly) {
      result = result.filter((email) => email.status === "failed");
    }
    return result;
  }, [sentEmails, search, showFailedOnly]);

  const removeEmail = async (email: EmailItem) => {
    await deleteEmail(email.id);
    await loadScheduled();
    await loadSent();
  };

  const activeTable = useMemo(() => {
    if (tab === "scheduled") {
      return (
        <EmailTable
          title="Scheduled"
          rows={filteredScheduled}
          loading={loadingScheduled}
          emptyLabel="No scheduled emails"
          onDelete={removeEmail}
        />
      );
    }
    return (
      <EmailTable
        title="Sent"
        rows={filteredSent}
        loading={loadingSent}
        emptyLabel="No sent emails"
        showSentTime
        onDelete={removeEmail}
      />
    );
  }, [
    tab,
    filteredScheduled,
    filteredSent,
    loadingScheduled,
    loadingSent,
    loadScheduled,
    loadSent,
    removeEmail
  ]);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="flex min-h-screen">
        <aside className="flex w-72 flex-col gap-6 border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur">
          <div>
            <div className="text-lg font-semibold text-slate-900">ONB</div>
            <div className="text-xs text-slate-400">ReachInbox</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {user.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCompose(true)}
            className="rounded-full border border-emerald-600 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Compose
          </button>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Core
            </div>
            <Tabs
              value={tab}
              onChange={setTab}
              counts={{ scheduled: scheduledEmails.length, sent: sentEmails.length }}
            />
          </div>
        </aside>

        <main className="flex-1">
          <Header
            user={user}
            onLogout={handleLogout}
            searchValue={search}
            onSearchChange={setSearch}
            onRefresh={async () => {
              await loadScheduled();
              await loadSent();
            }}
            onToggleFilter={() => setShowFailedOnly((prev) => !prev)}
            filterActive={showFailedOnly}
          />
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  {tab === "scheduled" ? "Scheduled" : "Sent"}
                </div>
                <div className="text-xs text-slate-400">
                  {tab === "scheduled" ? "Queued and waiting to go out" : "Delivered and failed"}
                </div>
              </div>
              <button
                onClick={() => setShowCompose(true)}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
              >
                New email
              </button>
            </div>
            {activeTable}
          </div>
        </main>
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => {
            setShowCompose(false);
            loadScheduled();
            loadSent();
          }}
          onSchedule={async (payload) => {
            await scheduleEmails(payload);
            await loadScheduled();
            await loadSent();
          }}
        />
      )}
    </div>
  );
};
