import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './lib/auth'

// Avatar images
const avatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6iHGkm69VfosgTGrtZ5m852nC91Xm4QBAGgfzcgo0xb9-j3grnfMLOwzB-t1jPXZ3aRMBtgbT_NamssEWfeEhZNMFw4eULeeRjMYOR_s-Ct443Y5tG8GKuY3OoS2VokcREUPhrArX0cgWyqgR3oVBuPG4kKGQ7h3YvmjrmPZ_WZclcuQbmNrorUo4cL_OO7F3dio_oBKt_pfZhj964eAO0NoSvwnZCaw3XfvW_HD4tKcAMSLppmpFwu7yCLDhiVpvI7nEdT8LpQNt',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCKM-aeHetJCXIkZH7dTgA8BXlOPyzujzkGZmwlUoxNwlmtV-Eoy3FNtgMPjS1sWmNL3gSNEz9cVeqnWKt31e_rQGVOFu5D2KZAxdw2nuVl4rERBhyjdQOJ8Uyv9Im367O5pC8UpJQz2sP96ZScRaFgCTQQYTOQjL3F_EEOLbs2EXvP3lQ92yhTfGSc4LSYN9AZOskBKrx72ta1pIqryV_2UgWwmx1_0Cd5Cpog4wlBtmmw0wFZpryHVzDe4Jqh7z6iVBsJzqSGK7yI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHrdLrH3AzRK2NrIDCYokTiaFPdHZvCMvnUzg0l6Vype04Frr3Vg_ZzG8w87GxQAORRX_OX2ILIvgES4IGr8odMAJuYjM576z5I6_hU8qzzvexdr3iwHETheYDE-VBB3KWgIgW1hFvI7I2YoUvj1VjNS0h93Gr5wbpd0Uh13lrXJFE239w-NOHS1-JIYXUgOwKO0ylgUYiJCJZrcoQRO7p_ot3UrpnGRMlXXervWE-OwsiCk2OGICS4dMBiuzld2kSUBSYiHdUpu78',
]

const benefitsImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBBY6RsVGiaKEI5x3tutmeABHdcqe8u15cKxYJY-IHLOJMPWC9Ps0gUmTNJCCHxXbDeCK9iCLhzssRQdiD3vT4HVteMXb4RR10x_EVL5wmxWBykUvbQvQpH_rbnP8-VjRh7UbkcyUWT9bre0tjb1PyRxcZEDwHBqG2qvfv76u5aqvIOaIbRkYq1vcaegyl_qjJSQului6iII4nI76n1HKGtzkVWyxtuU42lsVqSZlXm4B5LLqV4BUQsZYJliCVxi7G8DxGDnoiZjXU_'

// Reusable icon component
function Icon({ name, className = '', fill = false }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  )
}

// ---- Theme Toggle (Framer Motion) ----

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="w-[26px] h-[26px] rounded-full flex items-center justify-center"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          marginLeft: isDark ? 'auto' : '0px',
          background: isDark
            ? 'linear-gradient(135deg, #b2c5ff, #618eff)'
            : 'linear-gradient(135deg, #fff, #faf9fe)',
          boxShadow: isDark
            ? '0 0 10px rgba(178,197,255,0.5)'
            : '0 1px 4px rgba(0,0,0,0.15)',
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.svg
              key="moon"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="#00143f"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#0c56d0"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#0c56d0" strokeWidth="2" strokeLinecap="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  )
}

// ---- Page Reveal Overlay ----

function PageReveal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'exit' | 'split' | 'hidden'>('intro')
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    document.body.classList.add('reveal-active')

    const exitTimer = setTimeout(() => setPhase('exit'), 1200)
    const splitTimer = setTimeout(() => setPhase('split'), 1600)
    const hideTimer = setTimeout(() => {
      setPhase('hidden')
      document.body.classList.remove('reveal-active')
      onCompleteRef.current()
    }, 2500)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(splitTimer)
      clearTimeout(hideTimer)
      document.body.classList.remove('reveal-active')
    }
  }, [])

  if (phase === 'hidden') return null

  const overlayClass = [
    'reveal-overlay',
    phase === 'exit' ? 'reveal-exit' : '',
    phase === 'split' ? 'reveal-done reveal-exit' : '',
  ].join(' ')

  return (
    <div className={overlayClass}>
      <div className="reveal-half reveal-half--top"></div>
      <div className="reveal-half reveal-half--bottom"></div>
      <div className="reveal-brand">
        <div className="reveal-logo-text">
          Hustlr<span className="reveal-logo-dot">.</span>
        </div>
        <div className="reveal-line"></div>
      </div>
    </div>
  )
}

// ---- Scroll Reveal Hook ----

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          } else {
            entry.target.classList.remove('revealed')
          }
        })
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe the container itself
    observer.observe(container)

    // Also observe all scroll-animate children
    const children = container.querySelectorAll('.scroll-animate')
    children.forEach((child) => observer.observe(child))

    return () => observer.disconnect()
  }, [threshold])

  return ref
}

const NAV_ITEMS = [
  { label: 'Features', icon: 'auto_awesome', href: '#features' },
  { label: 'Benefits', icon: 'bolt', href: '#benefits' },
]

function Header({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isScrollingTo = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Track which section is in view via scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingTo.current) return

      let found: string | null = null
      for (const item of NAV_ITEMS) {
        const el = document.querySelector(item.href)
        if (el) {
          const rect = el.getBoundingClientRect()
          // Section is "in view" if its top is above the middle of the viewport
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom > 100) {
            found = item.label
          }
        }
      }
      setActiveTab(found)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b ${
          scrolled
            ? 'bg-[#faf9fe]/90 dark:bg-[#121212]/90 border-[#e3e2e7] dark:border-white/10 shadow-lg shadow-black/[0.03] dark:shadow-black/20'
            : 'bg-[#faf9fe]/60 dark:bg-[#121212]/60 border-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 2.3 }}
      >
        <nav className="flex justify-between items-center w-full px-8 py-3.5 max-w-7xl mx-auto">
          {/* Logo */}
          <motion.a
            href="#"
            className="text-2xl font-black text-[#00143f] dark:text-white tracking-tighter font-headline select-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.preventDefault()
              if (user) {
                navigate('/dashboard')
              } else {
                setActiveTab(null)
                isScrollingTo.current = true
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setTimeout(() => { isScrollingTo.current = false }, 800)
              }
            }}
          >
            Hustlr<span className="text-surface-tint dark:text-[#b2c5ff]">.</span>
          </motion.a>

          <div className="hidden md:flex items-center">
            <div
              className="relative flex items-center gap-0.5 bg-[#eeedf2]/70 dark:bg-white/[0.06] rounded-full p-1 border border-[#e3e2e7]/50 dark:border-white/[0.06]"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.label
                return (
                  <motion.button
                    key={item.label}
                    className={`relative z-10 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full cursor-pointer select-none transition-colors duration-150 ${
                      isActive
                        ? 'text-[#00143f] dark:text-white'
                        : 'text-[#5e6168] dark:text-[#8b92a0]'
                    }`}
                    onClick={() => {
                      setActiveTab(item.label)
                      isScrollingTo.current = true
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                      setTimeout(() => { isScrollingTo.current = false }, 800)
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-white dark:bg-white/[0.12] rounded-full shadow-sm shadow-black/[0.04] dark:shadow-none"
                        layoutId="active-tab-pill"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <Icon name={item.icon} className={`text-[18px] transition-colors duration-150 ${
                      isActive ? 'text-surface-tint dark:text-[#b2c5ff]' : ''
                    }`} />
                    <span>{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={onToggle} />

            {user ? (
              <Link
                to="/dashboard"
                className="bg-velocity-gradient text-on-primary px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#00143f]/25 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="hidden sm:block text-[#00143f] dark:text-[#dae2ff] font-semibold text-sm px-4 py-2 rounded-full hover:bg-[#eeedf2] dark:hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>

                <Link to="/signin">
                  <motion.button
                    className="bg-velocity-gradient text-on-primary px-5 py-2.5 rounded-full font-bold text-sm shadow-md"
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,20,63,0.25)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <motion.button
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[#eeedf2] dark:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              <motion.span
                className="block w-4 h-0.5 bg-[#00143f] dark:bg-white rounded-full"
                animate={
                  mobileOpen
                    ? { rotate: 45, y: 3 }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block w-4 h-0.5 bg-[#00143f] dark:bg-white rounded-full mt-1.5"
                animate={
                  mobileOpen
                    ? { rotate: -45, y: -3 }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#faf9fe] dark:bg-[#121212] pt-24 px-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex flex-col gap-1 mt-4">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.label}
                  className={`flex items-center gap-3 text-left text-lg font-semibold py-4 px-5 rounded-2xl transition-colors ${
                    activeTab === item.label
                      ? 'text-[#00143f] dark:text-white bg-[#eeedf2] dark:bg-white/[0.06]'
                      : 'text-[#5e6168] dark:text-[#8b92a0]'
                  }`}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
                  onClick={() => {
                    setActiveTab(item.label)
                    setMobileOpen(false)
                    isScrollingTo.current = true
                    setTimeout(() => {
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                    }, 300)
                    setTimeout(() => { isScrollingTo.current = false }, 1100)
                  }}
                >
                  <Icon name={item.icon} className={`text-[22px] ${
                    activeTab === item.label ? 'text-surface-tint dark:text-[#b2c5ff]' : ''
                  }`} />
                  {item.label}
                  {activeTab === item.label && (
                    <motion.div
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-surface-tint dark:bg-[#b2c5ff]"
                      layoutId="mobile-active-dot"
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                </motion.button>
              ))}
              <motion.div
                className="mt-6 flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button className="w-full py-3 rounded-xl border border-[#e3e2e7] dark:border-white/10 text-[#00143f] dark:text-white font-semibold">
                  Sign In
                </button>
                <button className="w-full py-3 rounded-xl bg-velocity-gradient text-white font-bold shadow-lg">
                  Get Started
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function HeroSection({ revealed }: { revealed: boolean }) {
  const bentoRef = useScrollReveal(0.2)

  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className={`lg:col-span-7 z-10 hero-stagger ${revealed ? 'revealed' : ''}`}>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary dark:text-white leading-[1.1] tracking-tighter mb-8">
            Master Your Hustle, <br />
            <span className="text-surface-tint dark:text-[#b2c5ff]">Accelerate Your Growth</span>
          </h1>
          <p className="text-on-surface-variant dark:text-[#c4c6d0] text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed">
            The architectural workspace for high-velocity entrepreneurs. Eliminate dashboard fatigue with a focused,
            minimal environment designed for rapid delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              className="bg-velocity-gradient text-on-primary px-10 py-4 rounded-md text-lg font-bold shadow-xl flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(0,20,63,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started for Free
              <Icon name="arrow_forward" />
            </motion.button>
            <motion.button
              className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-md text-lg font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Watch Demo
            </motion.button>
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div ref={bentoRef} className="lg:col-span-5 relative bento-reveal">
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 dark:shadow-black/40 border border-outline-variant/20 dark:border-white/[0.06]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          >
            {/* Window Chrome */}
            <div className="bg-[#f0eff4] dark:bg-[#1a1a1e] px-4 py-3 flex items-center gap-2 border-b border-outline-variant/15 dark:border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-white/60 dark:bg-white/5 rounded-md h-5 max-w-[160px] mx-auto" />
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="bg-[#faf9fe] dark:bg-[#141418] flex">
              {/* Mini Sidebar */}
              <div className="w-11 shrink-0 border-r border-outline-variant/10 dark:border-white/5 py-4 flex flex-col items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-primary/15 dark:bg-[#b2c5ff]/15" />
                <div className="w-5 h-5 rounded-md bg-primary/8 dark:bg-white/5" />
                <div className="w-5 h-5 rounded-md bg-primary/8 dark:bg-white/5" />
                <div className="mt-auto w-5 h-5 rounded-full bg-surface-container-high dark:bg-white/5" />
              </div>

              {/* Main Content */}
              <div className="flex-1 p-5 space-y-4 min-w-0">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 rounded bg-on-surface/10 dark:bg-white/10" />
                    <div className="h-2 w-28 rounded bg-on-surface/5 dark:bg-white/5" />
                  </div>
                  <motion.div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 dark:bg-green-400/10"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Live</span>
                  </motion.div>
                </div>

                {/* Chart Area */}
                <div className="bg-white dark:bg-white/[0.03] rounded-xl p-4 border border-outline-variant/10 dark:border-white/5">
                  <div className="flex items-end gap-1 h-[96px]">
                    {[38, 52, 45, 68, 56, 72, 60, 80, 70, 85, 75, 90].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-[3px] bg-gradient-to-t from-primary/50 to-primary/25 dark:from-[#b2c5ff]/40 dark:to-[#b2c5ff]/15"
                        animate={{ height: [`${h * 0.5}%`, `${h}%`] }}
                        transition={{
                          duration: 2.5,
                          delay: i * 0.1,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: [0.45, 0, 0.55, 1],
                          repeatDelay: 3,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Tasks', value: '127', pct: 75 },
                    { label: 'Velocity', value: '84%', pct: 84 },
                    { label: 'Sprint', value: '98%', pct: 98 },
                  ].map((m, i) => (
                    <div key={i} className="bg-white dark:bg-white/[0.03] rounded-lg p-2.5 border border-outline-variant/10 dark:border-white/5">
                      <div className="text-[9px] text-on-surface-variant/50 dark:text-white/35 uppercase tracking-wider font-medium">{m.label}</div>
                      <div className="text-sm font-bold text-on-surface dark:text-white mt-0.5">{m.value}</div>
                      <div className="mt-1.5 h-1 rounded-full bg-surface-container-high/40 dark:bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary dark:bg-[#b2c5ff]"
                          animate={{ width: ['15%', `${m.pct}%`] }}
                          transition={{ duration: 2.5, delay: 0.3 + i * 0.4, repeat: Infinity, repeatType: 'reverse', ease: [0.45, 0, 0.55, 1], repeatDelay: 3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Task List */}
                <div className="space-y-2">
                  {[true, true, false].map((done, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2.5"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: i * 1 }}
                    >
                      <div className={`w-3 h-3 rounded-[3px] border ${
                        done
                          ? 'bg-primary dark:bg-[#b2c5ff] border-primary dark:border-[#b2c5ff]'
                          : 'border-outline/30 dark:border-white/15'
                      }`} />
                      <div className={`h-2 rounded bg-on-surface/6 dark:bg-white/6 ${
                        i === 0 ? 'w-28' : i === 1 ? 'w-36' : 'w-20'
                      }`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ambient Background */}
      <motion.div
        className="absolute -top-24 -right-24 w-96 h-96 bg-primary/4 dark:bg-[#b2c5ff]/4 rounded-full blur-[120px] -z-10"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      />
      <motion.div
        className="absolute top-1/2 -left-24 w-64 h-64 bg-surface-tint/6 dark:bg-[#b2c5ff]/4 rounded-full blur-[100px] -z-10"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      />
    </section>
  )
}

function FeaturesSection() {
  const ref = useScrollReveal(0.05)
  return (
    <section ref={ref} id="features" className="py-32 bg-surface-container-low dark:bg-[#1a1a1a] section-reveal">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-20 scroll-animate scroll-fade-up">
          <span className="text-surface-tint dark:text-[#b2c5ff] font-headline font-extrabold tracking-widest uppercase text-sm">
            Features
          </span>
          <h2 className="font-headline text-4xl font-bold text-primary dark:text-white mt-4">The Kinetic Workspace</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 — Real-time Collaboration */}
          <div className="md:col-span-2 bg-surface-container-lowest dark:bg-[#2a2a2a] rounded-xl p-10 flex flex-col justify-between transition-all hover:translate-y-[-4px] scroll-animate scroll-scale-fade scroll-delay-1">
            <div>
              <div className="bg-primary-fixed dark:bg-[#00276a] text-on-primary-fixed-variant dark:text-[#b2c5ff] w-14 h-14 rounded-xl flex items-center justify-center mb-8">
                <Icon name="hub" className="text-3xl" />
              </div>
              <h3 className="font-headline text-2xl font-bold text-primary dark:text-white mb-4">Real-time Collaboration</h3>
              <p className="text-on-surface-variant dark:text-[#c4c6d0] text-lg leading-relaxed max-w-xl">
                Synchronize your team instantly. Our &ldquo;No-Refresh&rdquo; engine ensures that every ticket move,
                comment, and status update is visible to the entire team in milliseconds.
              </p>
            </div>
            <div className="mt-12 flex gap-4">
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden"
                  >
                    <img className="w-full h-full object-cover" alt={`Team member ${i + 1}`} src={src} />
                  </div>
                ))}
              </div>
              <div className="text-on-surface-variant dark:text-[#c4c6d0] text-sm self-center">Team is currently active</div>
            </div>
          </div>

          {/* Feature 2 — Automated Reporting */}
          <div className="bg-velocity-gradient rounded-xl p-10 text-on-primary flex flex-col transition-all hover:translate-y-[-4px] scroll-animate scroll-scale-fade scroll-delay-2">
            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-8">
              <Icon name="auto_awesome" className="text-3xl text-primary-fixed" />
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">Automated Reporting</h3>
            <p className="text-primary-fixed/80 text-lg leading-relaxed mb-8">
              Burn-down charts and velocity reports that build themselves. Spend your time creating, not calculating.
            </p>
            <div className="mt-auto bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>SPRINT 42</span>
                <span>98% COMPLETE</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Feature 3 — Customizable Workflows */}
          <div className="bg-tertiary-fixed rounded-xl p-10 flex flex-col transition-all hover:translate-y-[-4px] scroll-animate scroll-scale-fade scroll-delay-3">
            <div className="bg-on-tertiary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-8">
              <Icon name="settings_input_component" className="text-3xl text-on-tertiary-fixed" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-on-tertiary-fixed mb-4">Customizable Workflows</h3>
            <p className="text-on-tertiary-fixed-variant text-lg leading-relaxed mb-8">
              Your process is unique. Build triggers and transitions that match exactly how your team operates.
            </p>
          </div>

          {/* Feature 4 — Precision Backlog */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-10 flex flex-col md:flex-row gap-8 items-center transition-all hover:translate-y-[-4px] scroll-animate scroll-scale-fade scroll-delay-4">
            <div className="flex-1">
              <h3 className="font-headline text-2xl font-bold text-primary mb-4">Precision Backlog</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Prioritize with surgical precision using our weight-based scoring and dynamic filtering. No more lost
                tickets.
              </p>
            </div>
            <div className="flex-1 bg-surface-container-low rounded-lg p-6 w-full">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
                  <Icon name="priority_high" className="text-error text-xl" fill />
                  <div className="h-2 w-full bg-surface-container-high rounded"></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded shadow-sm opacity-60">
                  <Icon name="stat_1" className="text-surface-tint text-xl" />
                  <div className="h-2 w-full bg-surface-container-high rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const ref = useScrollReveal(0.05)
  return (
    <section ref={ref} id="benefits" className="py-32 bg-surface dark:bg-[#121212] section-reveal">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 scroll-animate scroll-slide-left">
            <span className="text-surface-tint dark:text-[#b2c5ff] font-headline font-extrabold tracking-widest uppercase text-sm">
              Benefits
            </span>
            <h2 className="font-headline text-5xl font-bold text-primary dark:text-white mt-4 mb-8">The Architecture of Speed</h2>
            <p className="text-on-surface-variant dark:text-[#c4c6d0] text-xl leading-relaxed mb-12">
              Traditional project tools are built for managers. Hustlr is built for teams. We&rsquo;ve stripped away the
              overhead to create an environment that feels like an extension of your IDE.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <Icon name="bolt" className="text-primary dark:text-[#b2c5ff]" fill />
                <div>
                  <h4 className="font-bold text-primary dark:text-white mb-1">Zero Latency</h4>
                  <p className="text-on-surface-variant dark:text-[#c4c6d0] text-sm">
                    Engineered for sub-100ms interactions across all global regions.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Icon name="visibility" className="text-primary dark:text-[#b2c5ff]" fill />
                <div>
                  <h4 className="font-bold text-primary dark:text-white mb-1">Radical Clarity</h4>
                  <p className="text-on-surface-variant dark:text-[#c4c6d0] text-sm">
                    Visual hierarchy that highlights what matters and hides the noise.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full scroll-animate scroll-slide-right scroll-delay-2">
            <div className="aspect-video bg-surface-container-high rounded-2xl relative overflow-hidden group">
              <img
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                alt="Modern data visualization on a screen showing team velocity"
                src={benefitsImage}
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Icon name="play_arrow" className="text-4xl" fill />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const ref = useScrollReveal(0.1)
  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-8 mb-20 section-reveal">
      <div className="bg-velocity-gradient rounded-3xl p-12 md:p-24 text-center relative overflow-hidden scroll-animate scroll-scale-up">
        <div className="relative z-10">
          <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-on-primary mb-8 tracking-tighter">
            Ready to accelerate your <br className="hidden md:block" /> hustle?
          </h2>
          <p className="text-primary-fixed/80 text-xl max-w-2xl mx-auto mb-12">
            Join 2,000+ teams already using Hustlr to ship 30% faster every single week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-10 py-4 rounded-md text-lg font-bold shadow-xl hover:bg-primary-fixed transition-all">
              Get Started for Free
            </button>
            <button className="bg-white/10 text-on-primary border border-white/20 px-10 py-4 rounded-md text-lg font-bold hover:bg-white/20 transition-all">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 border-[40px] border-white/5 rounded-full"></div>
        <div className="absolute -top-24 -left-24 w-80 h-80 border-[40px] border-white/5 rounded-full"></div>
      </div>
    </section>
  )
}

function Footer({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <footer className="w-full py-12 mt-20 bg-[#f4f3f8] dark:bg-[#1a1c1f]">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-bold text-[#00143f] dark:text-white font-headline">Hustlr.</span>
          <p className="text-[#43474f] dark:text-[#c4c6d0] font-body text-sm antialiased">
            © 2026 Hustlr Inc. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-[#43474f] dark:text-[#c4c6d0] font-body text-sm antialiased hover:underline transition-all" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-[#43474f] dark:text-[#c4c6d0] font-body text-sm antialiased hover:underline transition-all" to="/terms">
              Terms of Service
            </Link>

          </div>
          <ThemeToggle isDark={isDark} onToggle={onToggle} />
        </div>
      </div>
    </footer>
  )
}

// ---- Main App ----

function App() {
  const [revealDone, setRevealDone] = useState(false)
  const handleRevealComplete = useCallback(() => setRevealDone(true), [])
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hustlr-theme') === 'dark'
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('hustlr-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), [])

  return (
    <div className="bg-surface dark:bg-[#121212] text-on-surface dark:text-[#e3e2e7] font-body antialiased min-h-screen">
      <PageReveal onComplete={handleRevealComplete} />
      <Header isDark={isDark} onToggle={toggleTheme} />
      <main className="pt-24">
        <HeroSection revealed={revealDone} />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer isDark={isDark} onToggle={toggleTheme} />
    </div>
  )
}

export default App
