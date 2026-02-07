import { EmailItem } from "../types";

export const EmailTable = ({
  title,
  rows,
  loading,
  emptyLabel,
  showSentTime,
  onDelete
}: {
  title: string;
  rows: EmailItem[];
  loading: boolean;
  emptyLabel: string;
  showSentTime?: boolean;
  onDelete?: (email: EmailItem) => void;
}) => {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-700">
        {title}
      </div>
      {loading ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">{emptyLabel}</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row) => {
            const timeValue = showSentTime
              ? row.sentAt
                ? new Date(row.sentAt).toLocaleString()
                : "-"
              : new Date(row.scheduledTime).toLocaleString();

            return (
              <div key={row.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">To: {row.recipient}</div>
                  <div className="truncate text-sm text-slate-700">
                    <span className="font-semibold">{row.subject}</span>
                  </div>
                  <div className="truncate text-xs text-slate-400">
                    {row.body}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {timeValue}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.status === "sent"
                        ? "bg-emerald-100 text-emerald-700"
                        : row.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {row.status}
                  </span>
                  {onDelete ? (
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-rose-500"
                      aria-label="Delete email"
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
