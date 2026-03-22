import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeInOut' as const },
  }),
}

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
    // Apply dark mode from localStorage
    const theme = localStorage.getItem('hustlr-theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const sections = [
    {
      title: 'Information We Collect',
      icon: 'database',
      content: [
        'We collect information you provide directly, such as when you create an account, fill out a form, or communicate with us. This may include your name, email address, company name, and payment information.',
        'We automatically collect certain technical information when you use our services, including your IP address, browser type, operating system, referring URLs, and information about how you interact with our platform.',
        'We may also collect information from third-party sources, such as social media platforms, to enhance your profile and improve our services.',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: 'settings',
      content: [
        'To provide, maintain, and improve our services, including personalized features and recommendations.',
        'To process transactions and send related information, including purchase confirmations and invoices.',
        'To communicate with you about products, services, and events offered by Hustlr, and provide news and information we think will be of interest to you.',
        'To monitor and analyze trends, usage, and activities in connection with our services to improve user experience.',
      ],
    },
    {
      title: 'Data Sharing & Disclosure',
      icon: 'share',
      content: [
        'We do not sell your personal information. We may share information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, and email delivery.',
        'We may disclose your information if required by law, regulation, legal process, or governmental request.',
        'In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.',
      ],
    },
    {
      title: 'Data Security',
      icon: 'shield',
      content: [
        'We implement industry-standard security measures to protect your personal information, including encryption in transit (TLS 1.3) and at rest (AES-256).',
        'Access to personal data is restricted to employees and contractors who need it to operate, develop, or improve our services.',
        'We conduct regular security audits and penetration testing to identify and address potential vulnerabilities.',
      ],
    },
    {
      title: 'Your Rights & Choices',
      icon: 'person',
      content: [
        'You may access, update, or delete your personal information at any time through your account settings.',
        'You can opt out of receiving promotional communications from us by following the unsubscribe instructions in our emails.',
        'Depending on your location, you may have additional rights under applicable data protection laws, including the right to data portability and the right to restrict processing.',
      ],
    },
    {
      title: 'Cookies & Tracking',
      icon: 'cookie',
      content: [
        'We use cookies and similar tracking technologies to collect and use personal information about you. You can control the use of cookies at the browser level.',
        'We use analytics cookies to understand how our service is used and improve your experience. These can be disabled without affecting core functionality.',
      ],
    },
    {
      title: 'Contact Us',
      icon: 'mail',
      content: [
        'If you have any questions about this Privacy Policy, please contact us at privacy@hustlr.io or write to us at Hustlr Inc., 100 Market Street, San Francisco, CA 94105.',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-surface dark:bg-[#121212]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00143f] via-[#00276a] to-[#0c56d0] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.45, 0, 0.55, 1] }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium mb-8 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/80">privacy_tip</span>
              </div>
              <span className="text-white/50 text-sm font-medium uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use Hustlr.
            </p>
            <p className="text-white/40 text-sm mt-6">Last updated: March 22, 2026</p>
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/[0.02] rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/[0.03] rounded-full blur-[60px]" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              className="group"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeIn}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/5 dark:bg-[#b2c5ff]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/10 dark:group-hover:bg-[#b2c5ff]/15 transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-surface-tint dark:text-[#b2c5ff]">{section.icon}</span>
                </div>
                <h2 className="font-headline text-xl font-bold text-primary dark:text-white">
                  {section.title}
                </h2>
              </div>
              <div className="pl-[52px] space-y-3">
                {section.content.map((paragraph, j) => (
                  <p key={j} className="text-on-surface-variant dark:text-[#c4c6d0] leading-relaxed text-[15px]">
                    {paragraph}
                  </p>
                ))}
              </div>
              {i < sections.length - 1 && (
                <div className="mt-10 border-b border-outline-variant/15 dark:border-white/5" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Footer */}
      <footer className="border-t border-outline-variant/15 dark:border-white/5 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-lg font-bold text-primary dark:text-white font-headline">Hustlr.</Link>
          <div className="flex gap-6 text-sm text-on-surface-variant dark:text-[#c4c6d0]">
            <span className="font-medium text-primary dark:text-white">Privacy Policy</span>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
          </div>
          <p className="text-xs text-on-surface-variant/60 dark:text-white/40">© 2026 Hustlr Inc.</p>
        </div>
      </footer>
    </div>
  )
}
