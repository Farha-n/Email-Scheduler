import { useMemo, useState } from "react";

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const deliveryZones = [
  { id: "anantnag", label: "Anantnag" },
  { id: "srinagar", label: "Srinagar" },
  { id: "south-kashmir", label: "South Kashmir" },
  { id: "north-kashmir", label: "North Kashmir" },
  { id: "outside-kashmir", label: "Outside Kashmir" }
] as const;

type DeliveryZoneId = typeof deliveryZones[number]["id"];

export const ComposeModal = ({
  onClose,
  onSchedule
}: {
  onClose: () => void;
  onSchedule: (payload: {
    subject: string;
    body: string;
    recipients: string[];
    startTime: string;
    delayBetween: number;
    hourlyLimit: number;
    zoneId: string;
  }) => Promise<void>;
}) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delayBetween, setDelayBetween] = useState(5);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [zoneId, setZoneId] = useState<DeliveryZoneId>("anantnag");
  const [fileEmails, setFileEmails] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recipientCount = fileEmails.length;

  const parseFile = async (file: File) => {
    const text = await file.text();
    const matches = text.match(emailRegex) ?? [];
    const unique = Array.from(new Set(matches.map((value) => value.toLowerCase())));
    setFileEmails(unique);
  };

  const isValid = useMemo(() => {
    return subject.trim() && body.trim() && recipientCount > 0 && startTime;
  }, [subject, body, recipientCount, startTime]);

  const handleSubmit = async () => {
    if (!isValid) {
      setStatus("Add a subject, body, start time, and upload recipients.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const isoStartTime = new Date(startTime).toISOString();
      await onSchedule({
        subject,
        body,
        recipients: fileEmails,
        startTime: isoStartTime,
        delayBetween,
        hourlyLimit,
        zoneId
      });
      setStatus("All set. Scheduled.");
      setSubject("");
      setBody("");
      setFileEmails([]);
      setStartTime("");
    } catch (error) {
      setStatus("Could not schedule emails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-700">New email</div>
            <div className="text-xs text-slate-400">Schedule a batch</div>
          </div>
          <button onClick={onClose} className="text-sm text-slate-400">
            X
          </button>
        </div>
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="Subject"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Body</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="mt-1 h-40 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="Write your message..."
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Start time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Delay (seconds)</label>
                <input
                  type="number"
                  min={1}
                  value={delayBetween}
                  onChange={(event) => setDelayBetween(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Hourly limit</label>
                <input
                  type="number"
                  min={1}
                  value={hourlyLimit}
                  onChange={(event) => setHourlyLimit(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-500">Delivery zone</label>
                <select
                  value={zoneId}
                  onChange={(event) => setZoneId(event.target.value as DeliveryZoneId)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  {deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-[11px] text-slate-400">
                  Zone can tweak spacing and hourly caps.
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-500">Upload list</div>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    parseFile(file);
                  }
                }}
                className="mt-2 w-full text-sm"
              />
              <div className="mt-3 text-sm text-slate-600">
                {recipientCount === 0 ? "No recipients yet" : `${recipientCount} recipients found`}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-500">Status</div>
              <div className="mt-2 text-sm text-slate-600">
                {status ?? "Ready"}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
