import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <form action="/logout" method="post">
      <button
        type="submit"
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/80 px-5 py-3 font-semibold text-slate-100 shadow-lg shadow-black/20 backdrop-blur transition hover:border-red-300/60 hover:bg-red-500/10 hover:text-white"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Log out
      </button>
    </form>
  );
}
