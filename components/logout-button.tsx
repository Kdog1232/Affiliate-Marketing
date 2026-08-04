import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <form action="/logout" method="post">
      <button
        type="submit"
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-surface/95 px-5 py-3 font-semibold text-content-primary shadow-lg shadow-content-primary/20 backdrop-blur transition hover:border-danger/60 hover:bg-danger/10 hover:text-content-primary"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Log out
      </button>
    </form>
  );
}
