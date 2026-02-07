type Tab = "scheduled" | "sent";

export const Tabs = ({
  value,
  onChange,
  counts
}: {
  value: Tab;
  onChange: (tab: Tab) => void;
  counts?: { scheduled: number; sent: number };
}) => {
  return (
    <div className="flex flex-col gap-2">
      {(["scheduled", "sent"] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex items-center justify-between rounded-full px-3 py-2 text-xs font-semibold transition ${
            value === tab
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500 hover:text-slate-600"
          }`}
        >
          <span>{tab === "scheduled" ? "Scheduled" : "Sent"}</span>
          {counts ? (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">
              {tab === "scheduled" ? counts.scheduled : counts.sent}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
};
