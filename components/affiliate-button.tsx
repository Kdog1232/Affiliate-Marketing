import { ExternalLink } from 'lucide-react';

export function AffiliateButton({ href, children, variant = 'primary', className = '' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary'; className?: string }) {
  return (
    <a href={href} target="_blank" rel="nofollow sponsored noopener noreferrer" className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${variant === 'primary' ? 'bg-brand text-content-inverse shadow-glow hover:bg-brand-light' : 'border border-border bg-surface text-content-primary hover:bg-surface'} ${className}`}>
      {children}<ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
