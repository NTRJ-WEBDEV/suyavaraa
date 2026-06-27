import Link from 'next/link'
import { Shield, Heart, Users, CheckCircle, Star, Lock, Eye, Sparkles, ArrowRight, Crown } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf6f1] text-[#1d140f]">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[#e8d5c0] bg-[#faf6f1]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a0f0a]">
              <Sparkles size={16} className="text-[#f8c58a]" />
            </div>
            <span className="text-lg font-bold tracking-tight">Suyavaraa</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-[#6b4b3e] md:flex">
            <a href="#how-it-works" className="transition hover:text-[#1d140f]">How it works</a>
            <a href="#features" className="transition hover:text-[#1d140f]">Features</a>
            <a href="#trust" className="transition hover:text-[#1d140f]">Trust & Safety</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[#6b4b3e] transition hover:text-[#1d140f]">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full bg-[#1a0f0a] px-5 py-2.5 text-sm font-semibold text-[#f8c58a] transition hover:bg-[#2a1b14]">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#e91e6310] blur-3xl" />
          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#d4a01715] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8d5c0] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#7c2d12]">
            <Shield size={12} />
            Verification-first matchmaking
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Find love the{' '}
            <span className="bg-gradient-to-r from-[#e91e63] to-[#d4a017] bg-clip-text text-transparent">
              safe way.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#6b4b3e] sm:text-xl">
            Suyavaraa is Tamil Nadu's first dual-mode platform — modern dating and traditional matrimony — with 4-layer identity verification so every connection starts with trust.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-[#e91e63] px-8 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(233,30,99,0.35)] transition hover:-translate-y-0.5 hover:bg-[#ad1457]"
            >
              Start Dating
              <Heart size={16} className="transition group-hover:scale-110" />
            </Link>
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full border-2 border-[#d4a017] bg-white px-8 py-4 text-sm font-bold text-[#a37a10] shadow-[0_20px_50px_rgba(212,160,23,0.2)] transition hover:-translate-y-0.5 hover:bg-[#fdf6e3]"
            >
              Find a Match
              <Crown size={16} className="transition group-hover:scale-110" />
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#9b7060]">Free to join · No credit card required</p>
        </div>
      </section>

      {/* ── Dual Mode Cards ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Dating */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fce4ec] to-[#f8bbd9] p-8 transition hover:-translate-y-1">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#e91e6320]" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e91e63]">
                  <Heart size={24} className="text-white" fill="white" />
                </div>
                <h2 className="text-2xl font-bold text-[#880e4f]">Dating Mode</h2>
                <p className="mt-2 text-sm leading-6 text-[#ad1457]">
                  Swipe, match, and connect with verified singles nearby. Express yourself through Impress posts, join Tribes, and spark real conversations.
                </p>
                <ul className="mt-5 space-y-2">
                  {['Smart swipe discovery', 'Tribes & interest groups', 'Impress post feed', 'Real-time chat'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-medium text-[#880e4f]">
                      <CheckCircle size={14} className="shrink-0 text-[#e91e63]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#e91e63] transition hover:gap-2.5">
                  Explore Dating <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Matrimony */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fdf6e3] to-[#f5e6b0] p-8 transition hover:-translate-y-1">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#d4a01720]" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4a017]">
                  <Crown size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#5c4108]">Matrimony Mode</h2>
                <p className="mt-2 text-sm leading-6 text-[#a37a10]">
                  Thoughtful partner search for those ready to settle down. Browse Zones by community, join Suyamvaram events, and find your life partner with family confidence.
                </p>
                <ul className="mt-5 space-y-2">
                  {['Community Zones', 'Suyamvaram challenges', 'Detailed profiles', 'Family-friendly browsing'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-medium text-[#5c4108]">
                      <CheckCircle size={14} className="shrink-0 text-[#d4a017]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#d4a017] transition hover:gap-2.5">
                  Explore Matrimony <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-[#1a0f0a] px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#f8c58a]">Simple process</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Get started in minutes</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', icon: <Star size={20} />, title: 'Create account', desc: 'Sign up with your email and choose Dating or Matrimony mode.' },
              { step: '02', icon: <Shield size={20} />, title: 'Verify identity', desc: 'Complete phone OTP and selfie check to get your Trust Badge.' },
              { step: '03', icon: <Users size={20} />, title: 'Build your profile', desc: 'Add photos, interests, and let your personality shine.' },
              { step: '04', icon: <Heart size={20} />, title: 'Start connecting', desc: 'Discover verified profiles and start meaningful conversations.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-xs font-bold tracking-widest text-[#f8c58a]/40">{item.step}</div>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#f8c58a]">
                  {item.icon}
                </div>
                <h3 className="mb-2 font-bold">{item.title}</h3>
                <p className="text-sm leading-6 text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#7c2d12]">Everything you need</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Built for real connections</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Heart size={22} className="text-[#e91e63]" />, bg: 'bg-[#fce4ec]', title: 'Smart Discovery', desc: 'Swipe deck for dating, grid browse for matrimony — tailored to how you actually look for love.' },
              { icon: <Shield size={22} className="text-[#2e7d32]" />, bg: 'bg-[#e8f5e9]', title: 'Trust Score', desc: 'Every profile has a Trust Score built from verified actions — so you know who you\'re talking to.' },
              { icon: <Users size={22} className="text-[#1565c0]" />, bg: 'bg-[#e3f2fd]', title: 'Tribes & Zones', desc: 'Join interest-based Tribes for dating or community Zones for matrimony to meet like-minded people.' },
              { icon: <Lock size={22} className="text-[#6a1b9a]" />, bg: 'bg-[#f3e5f5]', title: 'Private & Secure', desc: 'Your data stays yours. Block users, report abuse, and control who sees your profile.' },
              { icon: <Eye size={22} className="text-[#e65100]" />, bg: 'bg-[#fff3e0]', title: 'Impress Feed', desc: 'Share moments through posts, get reactions, and let your personality come through before the first message.' },
              { icon: <Crown size={22} className="text-[#d4a017]" />, bg: 'bg-[#fdf6e3]', title: 'Suyamvaram Events', desc: 'Host or join matrimony events — a modern take on the traditional Swayamvaram, built for families and individuals.' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#e8d5c0] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 font-bold">{f.title}</h3>
                <p className="text-sm leading-6 text-[#6b4b3e]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ── */}
      <section id="trust" className="bg-gradient-to-b from-[#fdf6e3] to-[#faf6f1] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#7c2d12]">Trust & Safety</p>
              <h2 className="text-3xl font-bold sm:text-4xl">4-layer verification. Because real safety matters.</h2>
              <p className="mt-4 text-base leading-7 text-[#6b4b3e]">
                Every profile on Suyavaraa goes through multiple verification steps before they can match with anyone. No catfish, no fakes.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { n: '01', label: 'Email verification', desc: 'Confirmed email address before any access.' },
                  { n: '02', label: 'Mobile OTP', desc: 'Phone number verified via one-time passcode.' },
                  { n: '03', label: 'Selfie check', desc: 'Live selfie reviewed by our safety team.' },
                  { n: '04', label: 'Optional ID review', desc: 'Government ID upload for maximum trust level.' },
                ].map((v) => (
                  <div key={v.n} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a0f0a] text-xs font-bold text-[#f8c58a]">{v.n}</div>
                    <div>
                      <p className="font-semibold">{v.label}</p>
                      <p className="text-sm text-[#6b4b3e]">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '4-layer', label: 'Identity verification' },
                { value: '3 roles', label: 'Admin access control' },
                { value: '100%', label: 'Profiles reviewed' },
                { value: '0', label: 'Tolerance for fakes' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#e8d5c0] bg-white p-6 text-center shadow-sm">
                  <p className="text-3xl font-bold text-[#1a0f0a]">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-[#6b4b3e]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl bg-[#1a0f0a] px-8 py-16 text-center text-white shadow-[0_40px_100px_rgba(26,15,10,0.25)]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f8c58a]">
              <Sparkles size={12} />
              Join Suyavaraa today
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
              Your verified match is waiting.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/60">
              Whether you're looking for a casual connection or a life partner — start safe, start verified, start on Suyavaraa.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#e91e63] px-8 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(233,30,99,0.4)] transition hover:-translate-y-0.5 hover:bg-[#ad1457]"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8d5c0] bg-[#faf6f1] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a0f0a]">
                  <Sparkles size={13} className="text-[#f8c58a]" />
                </div>
                <span className="font-bold">Suyavaraa</span>
              </div>
              <p className="mt-2 text-xs text-[#9b7060]">Dating and matrimony with verification-first trust.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[#6b4b3e]">
              <Link href="/login" className="transition hover:text-[#1d140f]">Sign in</Link>
              <Link href="/signup" className="transition hover:text-[#1d140f]">Sign up</Link>
              <Link href="/support/privacy" className="transition hover:text-[#1d140f]">Privacy</Link>
              <Link href="/support/terms" className="transition hover:text-[#1d140f]">Terms</Link>
              <Link href="/support" className="transition hover:text-[#1d140f]">Support</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#e8d5c0] pt-6 text-center text-xs text-[#9b7060]">
            © {new Date().getFullYear()} Suyavaraa. All rights reserved. · Made in Tamil Nadu 🤝
          </div>
        </div>
      </footer>
    </div>
  )
}
