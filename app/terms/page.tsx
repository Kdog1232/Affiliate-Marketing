import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, FileText, Mail, Scale, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | AIToolBet' },
  description: 'Read the Terms of Service governing the use of AIToolBet.com.',
};

const sections = [
  {
    title: 'Acceptance of Terms',
    icon: CheckCircle2,
    content: [
      'By accessing or using AIToolBet.com, you agree to be bound by these Terms of Service. If you do not agree with these terms, please discontinue use of the website.',
    ],
  },
  {
    title: 'Website Purpose',
    icon: FileText,
    content: [
      'AIToolBet provides AI software reviews, comparisons, tutorials, educational resources, and affiliate recommendations for professionals evaluating AI products.',
      'All content is provided for informational and educational purposes only and should not be considered legal, financial, or professional advice.',
    ],
  },
  {
    title: 'Affiliate Disclosure',
    icon: ShieldCheck,
    content: [
      'Some links on AIToolBet.com are affiliate links. We may receive commissions when users purchase products or services through our links, at no additional cost to the user.',
      'Recommendations are based on independent research and honest evaluations. Affiliate relationships do not influence our opinions, ratings, or editorial conclusions.',
    ],
  },
  {
    title: 'Accuracy',
    icon: AlertCircle,
    content: [
      'AI software changes frequently, and pricing, product features, availability, plans, limits, and terms may change without notice.',
      'Users should verify all information directly with software vendors before making purchasing decisions or relying on a product for business-critical workflows.',
    ],
  },
  {
    title: 'Intellectual Property',
    icon: Scale,
    content: [
      'All website content, including text, graphics, layouts, reviews, and original resources, belongs to AIToolBet unless otherwise noted.',
      'You may not copy, reproduce, redistribute, republish, or commercially exploit our content without prior written permission from AIToolBet.',
    ],
  },
  {
    title: 'Limitation of Liability',
    icon: ShieldCheck,
    content: [
      'AIToolBet is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, AIToolBet disclaims liability for any direct, indirect, incidental, consequential, special, or punitive damages arising from your use of the website, reliance on its content, or interactions with third-party products and services.',
    ],
  },
  {
    title: 'External Links',
    icon: ExternalLink,
    content: [
      'AIToolBet.com may link to third-party websites, tools, platforms, and services. We are not responsible for the accuracy, policies, availability, security, or content of third-party websites.',
    ],
  },
  {
    title: 'Changes',
    icon: FileText,
    content: [
      'We may update these Terms of Service at any time without notice. Continued use of AIToolBet.com after changes are posted constitutes acceptance of the updated terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-radial-blue">
      <div className="absolute inset-x-0 top-0 -z-0 h-96 bg-gradient-to-b from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to AIToolBet
        </Link>

        <section className="py-16 text-center sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-blue-300">Legal information</p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-white sm:text-7xl">Terms of Service</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Please read these terms carefully before using AIToolBet.com, our AI software reviews, comparisons, tutorials, and affiliate resources.
          </p>
        </section>

        <section className="grid gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.title} className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">{section.title}</h2>
                    <div className="mt-4 space-y-4 text-base leading-7 text-slate-300">
                      {section.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="my-10 rounded-3xl border border-blue-300/20 bg-gradient-to-br from-blue-500/20 via-white/[.08] to-cyan-400/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-200">Contact</p>
              <h2 className="mt-3 text-3xl font-bold text-white">AIToolBet</h2>
              <a href="https://aitoolbet.com" className="mt-2 inline-flex text-slate-300 transition hover:text-white">https://aitoolbet.com</a>
            </div>
            <a href="mailto:contact@aitoolbet.com" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-400">
              <Mail className="h-4 w-4" aria-hidden="true" />
              contact@aitoolbet.com
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
