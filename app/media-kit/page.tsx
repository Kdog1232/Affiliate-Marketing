import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Code2,
  GraduationCap,
  Handshake,
  HelpCircle,
  Mail,
  Megaphone,
  PenTool,
  Rocket,
  Share2,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: 'AIToolBet Media Kit' },
  description:
    'Partner with AIToolBet to showcase AI software to educators, creators, entrepreneurs, and businesses through trusted reviews and educational content.',
};

const audience = [
  { title: 'Educators', icon: GraduationCap, description: 'Teachers, trainers, and academic teams evaluating AI for learning and productivity.' },
  { title: 'Creators', icon: PenTool, description: 'Writers, designers, video creators, and makers building faster creative workflows.' },
  { title: 'Entrepreneurs', icon: Rocket, description: 'Founders comparing practical AI tools for launching and scaling lean businesses.' },
  { title: 'Small Businesses', icon: Building2, description: 'Operators seeking approachable AI products for sales, service, and operations.' },
  { title: 'Developers', icon: Code2, description: 'Technical teams exploring AI coding, automation, and product development tools.' },
  { title: 'Marketing Professionals', icon: Megaphone, description: 'Growth teams researching AI software for campaigns, content, and analytics.' },
];

const contentTypes = [
  'AI Reviews',
  'AI Comparisons',
  'Best AI Tool Lists',
  'Tutorials',
  'Buying Guides',
  'Educational Articles',
  'Product Walkthroughs',
  'Affiliate Recommendations',
];

const partnerships = [
  'Affiliate Partnerships',
  'Sponsored Reviews',
  'Product Spotlights',
  'Launch Campaigns',
  'Newsletter Features',
  'Social Media Promotion',
];

const reasons = [
  'Honest reviews',
  'High-intent visitors',
  'SEO-focused content',
  'Educational audience',
  'Long-form buying guides',
  'Evergreen content',
  'AI-focused niche',
];

const socialLinks = [
  { label: 'Website', href: 'https://aitoolbet.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aitoolbet' },
  { label: 'YouTube', href: 'https://www.youtube.com/@aitoolbet' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@aitoolbet' },
  { label: 'Facebook', href: 'https://www.facebook.com/aitoolbet' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/aitoolbet' },
];

const faqs = [
  {
    question: 'Do you accept sponsorships?',
    answer:
      'Yes. AIToolBet considers sponsorship opportunities when the product is relevant to our audience and the collaboration can be clearly disclosed to readers.',
  },
  {
    question: 'How do affiliate partnerships work?',
    answer:
      'Affiliate partnerships may include tracked links that generate a commission when a reader purchases through AIToolBet. Editorial coverage remains based on independent research and usefulness to our audience.',
  },
  {
    question: 'Can vendors request product reviews?',
    answer:
      'Yes. Vendors can request that we evaluate a product, share product details, or provide access for testing. Review timing and inclusion are not guaranteed.',
  },
  {
    question: 'Do you guarantee positive reviews?',
    answer:
      'No. AIToolBet maintains editorial independence. Sponsored or affiliate relationships do not guarantee positive coverage, specific rankings, or approval of claims that cannot be verified.',
  },
];

export default function MediaKitPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-radial-blue">
      <div className="absolute inset-x-0 top-0 -z-0 h-[34rem] bg-gradient-to-b from-blue-500/25 via-cyan-400/10 to-transparent blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to AIToolBet
        </Link>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-blue-300">Media Kit</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">Partner With AIToolBet</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              Helping educators, creators, entrepreneurs, developers, marketers, and small businesses discover the best AI software through trusted reviews, comparisons, tutorials, and buying guides.
            </p>
            <a href="mailto:contact@aitoolbet.com" className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-400">
              Contact for Partnerships
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="glass rounded-[2rem] p-6 sm:p-8">
            <div className="rounded-3xl bg-gradient-to-br from-blue-500/25 via-white/[.08] to-cyan-400/10 p-6 ring-1 ring-white/10">
              <Sparkles className="h-10 w-10 text-blue-200" aria-hidden="true" />
              <h2 className="mt-6 text-3xl font-bold text-white">AI software discovery for practical buyers</h2>
              <p className="mt-4 leading-7 text-slate-300">
                AIToolBet connects AI vendors with readers actively researching software that can improve productivity, education, business operations, creativity, and development workflows.
              </p>
            </div>
          </div>
        </section>

        <InfoSection eyebrow="About" title="About AIToolBet">
          <p className="max-w-4xl text-lg leading-8 text-slate-300">
            AIToolBet is an AI software discovery platform focused on helping professionals find practical AI tools that improve productivity, education, business operations, creativity, and development workflows.
          </p>
        </InfoSection>

        <InfoSection eyebrow="Audience" title="Our Audience">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {audience.map((item) => <IconCard key={item.title} {...item} />)}
          </div>
        </InfoSection>

        <InfoSection eyebrow="Editorial" title="Content We Produce">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contentTypes.map((item) => <SimpleCard key={item} icon={BookOpen} title={item} />)}
          </div>
        </InfoSection>

        <InfoSection eyebrow="Collaborations" title="Partnership Opportunities">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerships.map((item) => <SimpleCard key={item} icon={Handshake} title={item} />)}
          </div>
        </InfoSection>

        <section className="grid gap-6 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Benefits</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Why Partner With Us</h2>
          </div>
          <div className="glass rounded-3xl p-6 sm:p-8">
            <ul className="grid gap-4 sm:grid-cols-2">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-6 py-16 lg:grid-cols-2">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <Share2 className="h-8 w-8 text-blue-200" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-bold text-white">Social Links</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} className="rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300/50 hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-blue-500/20 via-white/[.08] to-cyan-400/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <Mail className="h-8 w-8 text-blue-200" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-bold text-white">Contact</h2>
            <p className="mt-3 text-slate-300">For partnerships, review requests, sponsorships, and media inquiries, contact the AIToolBet team.</p>
            <a href="mailto:contact@aitoolbet.com" className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400">
              contact@aitoolbet.com
            </a>
          </div>
        </section>

        <InfoSection eyebrow="FAQ" title="Frequently Asked Questions">
          <div className="grid gap-5 lg:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="glass rounded-3xl p-6">
                <HelpCircle className="h-6 w-6 text-blue-200" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold text-white">{faq.question}</h3>
                <p className="mt-3 leading-7 text-slate-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </InfoSection>
      </div>
    </main>
  );
}

function InfoSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="py-16">
      <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function IconCard({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Users }) {
  return (
    <article className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:border-blue-300/60">
      <Icon className="h-8 w-8 text-blue-200" aria-hidden="true" />
      <h3 className="mt-5 text-2xl font-bold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{description}</p>
    </article>
  );
}

function SimpleCard({ title, icon: Icon }: { title: string; icon: typeof Star }) {
  return (
    <article className="glass flex items-center gap-3 rounded-2xl p-5">
      <Icon className="h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
      <h3 className="font-semibold text-white">{title}</h3>
    </article>
  );
}
