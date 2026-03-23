import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface SignOutConfirmModalProps {
  open: boolean
  userName?: string
  userEmail?: string
  isLoading?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export default function SignOutConfirmModal({
  open,
  userName,
  userEmail,
  isLoading = false,
  onClose,
  onConfirm,
}: SignOutConfirmModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isLoading, onClose])

  const displayName = userName?.trim() || 'your account'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close sign out confirmation"
            className="absolute inset-0 bg-[#09101f]/55 backdrop-blur-md"
            onClick={isLoading ? undefined : onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_28px_80px_rgba(9,16,31,0.24)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111827]/95"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(12,86,208,0.18),_transparent_72%)] dark:bg-[radial-gradient(circle_at_top,_rgba(125,161,255,0.18),_transparent_72%)]" />

            <div className="relative p-6 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#0c56d0] via-[#4d86ea] to-[#8eb0ff] text-white shadow-lg shadow-[#0c56d0]/20">
                    <span className="material-symbols-outlined text-[26px]">logout</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0c56d0] dark:text-[#8eb0ff]">
                      Session
                    </p>
                    <h2 id="signout-modal-title" className="mt-1 text-xl font-bold tracking-tight text-[#00143f] dark:text-white">
                      Sign out?
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e2e7] text-[#7b8090] transition-colors hover:border-[#cfd3dc] hover:text-[#00143f] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-[#8b92a0] dark:hover:border-white/[0.12] dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <p className="text-sm leading-6 text-[#5e6168] dark:text-[#9ba3b6]">
                You are signed in as <span className="font-semibold text-[#00143f] dark:text-white">{displayName}</span>
                {userEmail ? <span className="text-[#8b92a0] dark:text-[#6f778a]"> ({userEmail})</span> : null}. You can sign back in anytime.
              </p>

              <div className="mt-5 rounded-2xl border border-[#dbe5fb] bg-[#f6f9ff] p-4 dark:border-[#2a3b61] dark:bg-[#0f172a]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0c56d0] shadow-sm dark:bg-white/[0.05] dark:text-[#8eb0ff]">
                    <span className="material-symbols-outlined text-[18px]">shield_lock</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#00143f] dark:text-white">A quick security check</p>
                    <p className="mt-1 text-xs leading-5 text-[#5e6168] dark:text-[#8b92a0]">
                      Signing out will end this session on this device and return you to the sign-in screen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#d9dce3] px-4 py-3 text-sm font-semibold text-[#00143f] transition-colors hover:bg-[#f4f6fb] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-white dark:hover:bg-white/[0.04]"
                >
                  Stay signed in
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00143f] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00143f]/15 transition-all hover:bg-[#0c56d0] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#7da1ff] dark:text-[#07111f] dark:hover:bg-[#98b7ff]"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-[#07111f]/25 dark:border-t-[#07111f]" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign out
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
