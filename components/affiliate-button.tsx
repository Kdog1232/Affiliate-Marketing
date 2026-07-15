import { ExternalLink } from 'lucide-react';

export function AffiliateButton({ href, children, variant = 'primary', className = '' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary'; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored" className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${variant === 'primary' ? 'bg-blue-500 text-white shadow-glow hover:bg-blue-400' : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'} ${className}`}>
      {children}<ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
