import { LogoutButton } from '@/components/logout-button';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="fixed right-6 top-6 z-50">
        <LogoutButton />
      </div>
      {children}
    </>
  );
}
