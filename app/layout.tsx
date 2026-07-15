import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/analytics';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aitoolbet.com'),
  title: { default: 'AI Tool Hub', template: '%s | AI Tool Hub' },
  description: 'Discover and compare the best AI software for teachers, businesses, creators, developers, marketers, and entrepreneurs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="impact-site-verification" {...{ value: '4f9fb31e-98aa-4776-be88-89f59b79fab4' }} />
      </head>
      <body>{children}<GoogleAnalytics /></body>
    </html>
  );
}
