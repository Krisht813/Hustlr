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

export default function TermsOfService() {
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
      title: 'Acceptance of Terms',
      icon: 'handshake',
      content: [
        'By creating an account, accessing, or using any part of the Hustlr platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.',
        'If you are using the services on behalf of an organization, you are agreeing to these terms for that organization and represent that you have the authority to bind the organization to these terms.',
      ],
    },
    {
      title: 'Account Registration',
      icon: 'person_add',
      content: [
        'You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your account credentials.',
        'You must be at least 16 years old to create an account. You are responsible for all activity that occurs under your account, whether or not you authorized that activity.',
        'You must immediately notify us of any unauthorized use of your account or any other breach of security.',
      ],
    },
    {
      title: 'Permitted Use',
      icon: 'check_circle',
      content: [
        'You may use Hustlr only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that violates applicable laws or regulations.',
        'You shall not attempt to gain unauthorized access to any portion of the service, other accounts, or computer systems through hacking, password mining, or other means.',
        'You may not use the service to transmit spam, malware, or any material that is threatening, abusive, harassing, defamatory, or otherwise objectionable.',
      ],
    },
    {
      title: 'Intellectual Property',
      icon: 'copyright',
      content: [
        'Hustlr and its original content, features, and functionality are owned by Hustlr Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.',
        'You retain ownership of any content you submit, post, or display through the services. By submitting content, you grant Hustlr a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content solely for operating and improving the service.',
      ],
    },
    {
      title: 'Subscription & Billing',
      icon: 'credit_card',
      content: [
        'Some features of Hustlr require a paid subscription. By subscribing, you agree to pay the applicable fees as described at the time of purchase.',
        'Subscriptions automatically renew unless you cancel before the renewal date. You may cancel your subscription at any time through your account settings.',
        'We reserve the right to change our pricing. If we do, we will provide at least 30 days\' notice before the new pricing takes effect for existing subscribers.',
        'Refunds are available within 14 days of initial purchase. No refunds will be issued for partial or unused subscription periods after this window.',
      ],
    },
    {
      title: 'Service Availability',
      icon: 'cloud_done',
      content: [
        'We strive to maintain 99.9% uptime but do not guarantee uninterrupted or error-free access. We may suspend the service for maintenance, updates, or other reasons.',
        'We are not liable for any loss or damage resulting from service interruptions, data loss, or security breaches beyond our reasonable control.',
      ],
    },
    {
      title: 'Limitation of Liability',
      icon: 'gavel',
      content: [
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, HUSTLR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR ACCESS TO OR USE OF THE SERVICES.',
        'Our total liability for any claims under these terms shall not exceed the amount you paid us in the twelve (12) months preceding the event giving rise to the claim.',
      ],
    },
    {
      title: 'Termination',
      icon: 'block',
      content: [
        'We may terminate or suspend your account and access to the services immediately, without prior notice, if you breach these Terms.',
        'Upon termination, your right to use the service ceases immediately. We will make your data available for export for 30 days following termination. After that period, we may delete your data.',
      ],
    },
    {
      title: 'Changes to Terms',
      icon: 'edit_document',
      content: [
        'We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before they take effect.',
        'Continued use of the service after changes become effective constitutes your acceptance of the revised terms.',
      ],
    },
    {
      title: 'Governing Law',
      icon: 'balance',
      content: [
        'These Terms shall be governed by the laws of the State of California, USA, without regard to conflict of law principles.',
        'Any disputes arising from these Terms shall be resolved through binding arbitration in San Francisco, California, under the rules of the American Arbitration Association.',
        'For questions about these Terms, contact us at legal@hustlr.io.',
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
                <span className="material-symbols-outlined text-white/80">description</span>
              </div>
              <span className="text-white/50 text-sm font-medium uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Please read these terms carefully before using Hustlr. By accessing our platform, you agree to these terms.
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
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <span className="font-medium text-primary dark:text-white">Terms of Service</span>
          </div>
          <p className="text-xs text-on-surface-variant/60 dark:text-white/40">© 2026 Hustlr Inc.</p>
        </div>
      </footer>
    </div>
  )
}
