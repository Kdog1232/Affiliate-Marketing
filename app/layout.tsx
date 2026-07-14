import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/analytics';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
  title: { default: 'AI Tool Hub', template: '%s | AI Tool Hub' },
  description: 'Discover and compare the best AI software for teachers, businesses, creators, developers, marketers, and entrepreneurs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<GoogleAnalytics /></body>
    </html>
  );
}
