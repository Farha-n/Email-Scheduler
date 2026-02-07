import { getGoogleAuthUrl } from "../services/api";

export const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-emerald-100 text-emerald-700">R</div>
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-xs text-slate-400">Welcome to ReachInbox</p>
        </div>

        <button
          onClick={() => {
            window.location.href = getGoogleAuthUrl();
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600">
            G
          </span>
          Sign in with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          email sign-in (not set up)
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-3">
          <input
            disabled
            placeholder="Email ID"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
          <input
            disabled
            placeholder="Password"
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
          <button
            disabled
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white opacity-60"
          >
            Login
          </button>
          <div className="text-center text-[11px] text-slate-400">
            Email sign-in is off for this demo.
          </div>
        </div>
      </div>
    </div>
  );
};
