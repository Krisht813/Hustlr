import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function SignIn() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [email, setEmail] = useState('')
  const [loginId, setLoginId] = useState('') // username or email for login
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Password validation rules
  const pwRules = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]
  const pwStrength = pwRules.filter(r => r.met).length
  const allPwRulesMet = pwStrength === pwRules.length
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    window.scrollTo(0, 0)
    const theme = localStorage.getItem('hustlr-theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    const t1 = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t1)
  }, [])

  // Clear messages when switching modes
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    setError('')
    setSuccess('')
    setResetEmailSent(false)
  }, [isSignUp, isForgotPassword])

  // Live username availability check with debounce
  useEffect(() => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)

    const val = username.trim().toLowerCase()

    if (!val) {
      setUsernameStatus('idle')
      return
    }

    // Validate format: 3+ chars, lowercase letters, numbers, underscores only
    if (val.length < 3 || !/^[a-z0-9_]+$/.test(val)) {
      setUsernameStatus('invalid')
      return
    }

    setUsernameStatus('checking')

    usernameTimerRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', val)
          .maybeSingle()

        if (error) {
          console.error('Username check error:', error)
          setUsernameStatus('available') // assume available on error
          return
        }

        setUsernameStatus(data ? 'taken' : 'available')
      } catch (err) {
        console.error('Username check failed:', err)
        setUsernameStatus('available')
      }
    }, 500)

    return () => {
      if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    }
  }, [username])

  const handleSignUp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }
    if (!username.trim()) {
      setError('Please choose a username.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }
    if (!allPwRulesMet) {
      setError('Password does not meet all requirements.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms & Conditions.')
      return
    }

    setSubmitting(true)
    setError('')

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()

    if (existingUser) {
      setError('Username is already taken. Please choose another.')
      setSubmitting(false)
      return
    }

    // Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim().toLowerCase(),
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    if (data.user) {
      // Create profile record
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: username.trim().toLowerCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      })

      setSuccess('Account created! Check your email to confirm your account.')
      setSubmitting(false)
    }
  }

  const handleSignIn = async () => {
    if (!loginId.trim()) {
      setError('Please enter your username or email.')
      return
    }
    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    setSubmitting(true)
    setError('')

    let emailToUse = loginId.trim()

    // If the login ID doesn't look like an email, look up the email by username
    if (!emailToUse.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailToUse.toLowerCase())
        .single()

      if (profileError || !profile) {
        setError('No account found with that username.')
        setSubmitting(false)
        return
      }
      emailToUse = profile.email
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    })

    if (authError) {
      setError('Invalid credentials. Please try again.')
      setSubmitting(false)
      return
    }

    setSuccess('Signed in successfully!')
    setSubmitting(false)
    setTimeout(() => navigate('/dashboard'), 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      handleSignUp()
    } else {
      handleSignIn()
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/signin`,
    })

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.')
      setSubmitting(false)
      return
    }

    setResetEmailSent(true)
    setSubmitting(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      setError(`Failed to sign in with ${provider}. Please try again.`)
    }
  }

  const inputClass = "w-full bg-white dark:bg-white/[0.04] border border-[#e3e2e7] dark:border-white/[0.08] rounded-xl px-4 py-3.5 text-[#00143f] dark:text-white text-sm placeholder:text-[#9e9ea6] dark:placeholder:text-[#4a5068] focus:outline-none focus:border-surface-tint/40 dark:focus:border-[#7da1ff]/40 focus:ring-1 focus:ring-surface-tint/20 dark:focus:ring-[#7da1ff]/20 transition-all"

  return (
    <>
      {/* Page Reveal Animation */}
      <AnimatePresence>
        {loading && (
          <motion.div className="fixed inset-0 z-[100] flex" initial={{ opacity: 1 }}>
            <motion.div
              className="w-1/2 h-full bg-[#020818]"
              exit={{ x: '-100%' }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
            />
            <motion.div
              className="w-1/2 h-full bg-[#020818]"
              exit={{ x: '100%' }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4, ease: [0.45, 0, 0.55, 1] }}
            >
              <div className="text-center">
                <motion.h1
                  className="text-5xl font-black text-white tracking-tighter font-headline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  Hustlr<span className="text-[#7da1ff]">.</span>
                </motion.h1>
                <motion.div
                  className="mt-6 h-[2px] w-32 mx-auto bg-white/10 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="h-full bg-[#7da1ff] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.35, ease: [0.45, 0, 0.55, 1] }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page */}
      <LayoutGroup>
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Video Panel */}
          <motion.div
            layout
            className="relative lg:w-[50%] shrink-0 overflow-hidden bg-[#020818]"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ order: isSignUp ? 0 : 1 }}
          >
            <div className="relative h-64 sm:h-80 lg:h-full lg:min-h-screen">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="https://videos.pexels.com/video-files/27980029/12280043_1920_1080_30fps.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020818]/90 via-[#020818]/20 to-[#020818]/50 z-[1]" />
              <div className="absolute inset-0 bg-[#020818]/30 z-[1]" />

              <div className={`absolute top-0 left-0 right-0 p-8 z-10 flex transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSignUp ? 'justify-start' : 'justify-end'}`}>
                <Link to={user ? "/dashboard" : "/"} className="text-2xl font-black text-white tracking-tighter font-headline">
                  Hustlr<span className="text-[#7da1ff]">.</span>
                </Link>
              </div>

              <div className={`absolute bottom-0 left-0 right-0 p-8 lg:p-12 z-10 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSignUp ? 'text-left items-start' : 'text-right items-end'} flex flex-col`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? 'signup-text' : 'login-text'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <h2 className="text-3xl lg:text-4xl font-bold text-white font-headline tracking-tight leading-tight mb-3">
                      {isSignUp ? (
                        <>Master Your Hustle,<br /><span className="text-[#7da1ff]">Ship Faster.</span></>
                      ) : (
                        <>Welcome Back,<br /><span className="text-[#7da1ff]">Let's Go.</span></>
                      )}
                    </h2>
                    <p className={`text-white/40 text-base max-w-[340px] leading-relaxed ${isSignUp ? '' : 'ml-auto'}`}>
                      {isSignUp
                        ? 'Join 2,000+ teams already accelerating their workflow with the modern project workspace.'
                        : 'Your workspace is waiting. Pick up where you left off.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Form Panel */}
          <motion.div
            layout
            className="flex-1 bg-[#f8f7fc] dark:bg-[#0e1220] flex items-center justify-center px-6 py-12 sm:px-12 lg:px-20"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ order: isSignUp ? 1 : 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isForgotPassword ? 'forgot' : isSignUp ? 'signup' : 'login'}
                className="w-full max-w-[460px]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Header */}
                <h1 className="text-3xl md:text-4xl font-bold text-[#00143f] dark:text-white font-headline tracking-tight mb-2">
                  {isForgotPassword ? 'Reset password' : isSignUp ? 'Create an account' : 'Welcome back'}
                </h1>
                <p className="text-[#5e6168] dark:text-[#8b92a0] text-sm mb-8">
                  {isForgotPassword ? (
                    <>Remember your password?{' '}
                      <button onClick={() => setIsForgotPassword(false)} className="text-surface-tint dark:text-[#7da1ff] hover:text-primary dark:hover:text-[#a3bfff] underline underline-offset-2 font-medium transition-colors">
                        Back to login
                      </button>
                    </>
                  ) : isSignUp ? (
                    <>Already have an account?{' '}
                      <button onClick={() => setIsSignUp(false)} className="text-surface-tint dark:text-[#7da1ff] hover:text-primary dark:hover:text-[#a3bfff] underline underline-offset-2 font-medium transition-colors">
                        Log in
                      </button>
                    </>
                  ) : (
                    <>Don't have an account?{' '}
                      <button onClick={() => setIsSignUp(true)} className="text-surface-tint dark:text-[#7da1ff] hover:text-primary dark:hover:text-[#a3bfff] underline underline-offset-2 font-medium transition-colors">
                        Sign up
                      </button>
                    </>
                  )}
                </p>

                {/* Error / Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot Password View */}
                {isForgotPassword ? (
                  resetEmailSent ? (
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <motion.div
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0c56d0]/10 to-[#7da1ff]/10 dark:from-[#7da1ff]/10 dark:to-[#0c56d0]/10 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
                      >
                        <motion.span
                          className="material-symbols-outlined text-[40px] text-[#0c56d0] dark:text-[#7da1ff]"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          mark_email_read
                        </motion.span>
                      </motion.div>
                      <h2 className="text-xl font-bold text-[#00143f] dark:text-white mb-2 font-headline">Check your inbox</h2>
                      <p className="text-[#5e6168] dark:text-[#8b92a0] text-sm leading-relaxed max-w-[320px] mx-auto mb-8">
                        If an account exists with <span className="font-medium text-[#00143f] dark:text-white">{resetEmail}</span>, you'll receive a password reset link shortly.
                      </p>
                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); setResetEmail('') }}
                          className="w-full bg-gradient-to-r from-[#0c56d0] to-[#3d7aed] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#0c56d0]/25 transition-all"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Back to login
                        </motion.button>
                        <button
                          type="button"
                          onClick={() => setResetEmailSent(false)}
                          className="w-full text-[#5e6168] dark:text-[#8b92a0] hover:text-[#00143f] dark:hover:text-white text-sm font-medium py-2 transition-colors"
                        >
                          Didn't receive it? Try again
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <p className="text-[#5e6168] dark:text-[#8b92a0] text-sm -mt-4 mb-2">
                        Enter the email address associated with your account and we'll send you a link to reset your password.
                      </p>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className={inputClass}
                        autoFocus
                      />
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-[#0c56d0] to-[#3d7aed] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#0c56d0]/25 hover:shadow-[#0c56d0]/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        whileHover={!submitting ? { scale: 1.01 } : {}}
                        whileTap={!submitting ? { scale: 0.98 } : {}}
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          'Send reset link'
                        )}
                      </motion.button>
                    </form>
                  )
                ) : (
                <>
                {/* Sign Up / Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                          className={`${inputClass} pr-10 ${usernameStatus === 'available' ? '!border-emerald-400 dark:!border-emerald-500/40' : ''} ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? '!border-red-400 dark:!border-red-500/40' : ''}`}
                        />
                        {/* Live validation indicator */}
                        <div className="absolute right-3 flex items-center justify-center">
                          {usernameStatus === 'checking' && (
                            <svg className="animate-spin h-4 w-4 text-[#7da1ff]" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                          {usernameStatus === 'available' && (
                            <span className="material-symbols-outlined text-emerald-500 text-[20px] leading-none">check_circle</span>
                          )}
                          {usernameStatus === 'taken' && (
                            <span className="material-symbols-outlined text-red-500 text-[20px] leading-none">cancel</span>
                          )}
                          {usernameStatus === 'invalid' && (
                            <span className="material-symbols-outlined text-amber-500 text-[20px] leading-none">warning</span>
                          )}
                        </div>
                      </div>
                      {/* Helper text */}
                      {usernameStatus !== 'idle' && usernameStatus !== 'checking' && (
                        <p className={`text-xs mt-1.5 ${
                          usernameStatus === 'available' ? 'text-emerald-500' :
                          usernameStatus === 'taken' ? 'text-red-500' :
                          'text-amber-500'
                        }`}>
                          {usernameStatus === 'available' && 'Username is available!'}
                          {usernameStatus === 'taken' && 'Username is already taken.'}
                          {usernameStatus === 'invalid' && 'Min 3 chars. Only letters, numbers & underscores.'}
                        </p>
                      )}
                    </div>
                  )}

                  {isSignUp ? (
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Username or Email"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className={inputClass}
                    />
                  )}

                  <div>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pr-11 ${isSignUp && password.length > 0 ? (allPwRulesMet ? '!border-emerald-400 dark:!border-emerald-500/40' : '!border-amber-400 dark:!border-amber-500/40') : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[#9e9ea6] dark:text-[#4a5068] hover:text-[#5e6168] dark:hover:text-white/60 transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px] leading-none">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* Password strength indicator — sign up only */}
                    {isSignUp && password.length > 0 && (
                      <div className="mt-2.5 space-y-2">
                        {/* Strength bar */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= pwStrength
                                  ? pwStrength <= 2 ? 'bg-red-400' : pwStrength <= 4 ? 'bg-amber-400' : 'bg-emerald-400'
                                  : 'bg-[#e3e2e7] dark:bg-white/[0.08]'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Rules checklist */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {pwRules.map((rule) => (
                            <div key={rule.label} className="flex items-center gap-1.5">
                              <span className={`material-symbols-outlined text-[14px] leading-none ${rule.met ? 'text-emerald-500' : 'text-[#9e9ea6] dark:text-[#4a5068]'}`}>
                                {rule.met ? 'check_circle' : 'circle'}
                              </span>
                              <span className={`text-[11px] ${rule.met ? 'text-emerald-500' : 'text-[#9e9ea6] dark:text-[#4a5068]'}`}>
                                {rule.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm password — sign up only */}
                  {isSignUp && (
                    <div>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`${inputClass} pr-11 ${confirmPassword.length > 0 ? (passwordsMatch ? '!border-emerald-400 dark:!border-emerald-500/40' : '!border-red-400 dark:!border-red-500/40') : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 text-[#9e9ea6] dark:text-[#4a5068] hover:text-[#5e6168] dark:hover:text-white/60 transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px] leading-none">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      {confirmPassword.length > 0 && (
                        <p className={`text-xs mt-1.5 ${passwordsMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                          {passwordsMatch ? 'Passwords match!' : 'Passwords do not match.'}
                        </p>
                      )}
                    </div>
                  )}

                  {isSignUp && (
                    <label className="flex items-center gap-3 cursor-pointer select-none group pt-1">
                      <div className="relative">
                        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="sr-only" />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          agreed
                            ? 'bg-[#0c56d0] border-[#0c56d0]'
                            : 'border-[#c4c6d0] dark:border-white/20 bg-transparent group-hover:border-[#8b92a0] dark:group-hover:border-white/30'
                        }`}>
                          {agreed && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                        </div>
                      </div>
                      <span className="text-[#5e6168] dark:text-[#8b92a0] text-sm">
                        I agree to the{' '}
                        <Link to="/terms" className="text-surface-tint dark:text-[#7da1ff] hover:text-primary dark:hover:text-[#a3bfff] underline underline-offset-2 transition-colors">
                          Terms & Conditions
                        </Link>
                      </span>
                    </label>
                  )}

                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setIsForgotPassword(true)} className="text-surface-tint dark:text-[#7da1ff] hover:text-primary dark:hover:text-[#a3bfff] text-xs font-medium transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#0c56d0] to-[#3d7aed] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#0c56d0]/25 hover:shadow-[#0c56d0]/40 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!submitting ? { scale: 1.01 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </span>
                    ) : (
                      isSignUp ? 'Create account' : 'Sign in'
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-px bg-[#e3e2e7] dark:bg-white/[0.06]" />
                  <span className="text-[#9e9ea6] dark:text-[#4a5068] text-xs font-medium">Or {isSignUp ? 'register' : 'sign in'} with</span>
                  <div className="flex-1 h-px bg-[#e3e2e7] dark:bg-white/[0.06]" />
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => handleOAuthLogin('google')}
                    className="flex items-center justify-center gap-2.5 bg-white dark:bg-white/[0.04] border border-[#e3e2e7] dark:border-white/[0.08] rounded-xl py-3.5 text-[#00143f] dark:text-white text-sm font-medium hover:bg-[#f4f3f8] dark:hover:bg-white/[0.07] transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </motion.button>
                  <motion.button
                    onClick={() => handleOAuthLogin('github')}
                    className="flex items-center justify-center gap-2.5 bg-white dark:bg-white/[0.04] border border-[#e3e2e7] dark:border-white/[0.08] rounded-xl py-3.5 text-[#00143f] dark:text-white text-sm font-medium hover:bg-[#f4f3f8] dark:hover:bg-white/[0.07] transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="fill-[#00143f] dark:fill-white">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </motion.button>
                </div>
                </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </>
  )
}
