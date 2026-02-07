import { User } from "../types";

export const Header = ({
  user,
  onLogout,
  searchValue,
  onSearchChange,
  onRefresh,
  onToggleFilter,
  filterActive
}: {
  user: User;
  onLogout: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onToggleFilter: () => void;
  filterActive: boolean;
}) => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            placeholder="Search subject or recipient"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-600 outline-none"
          />
        </div>
        <button
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 ${
            filterActive ? "ring-2 ring-emerald-200" : ""
          }`}
          aria-label="Filter"
          onClick={onToggleFilter}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
          aria-label="Refresh"
          onClick={onRefresh}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12a8 8 0 1 1-2.34-5.66" />
            <path d="M20 4v6h-6" />
          </svg>
        </button>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <button
            onClick={onLogout}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
