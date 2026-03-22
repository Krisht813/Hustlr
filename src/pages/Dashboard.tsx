import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'

const greetingByTime = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const quickActions = [
  { icon: 'rocket_launch', label: 'New Project', color: 'from-violet-500 to-purple-600' },
  { icon: 'group_add', label: 'Invite Team', color: 'from-blue-500 to-cyan-500' },
  { icon: 'analytics', label: 'Analytics', color: 'from-emerald-500 to-teal-500' },
  { icon: 'settings', label: 'Settings', color: 'from-amber-500 to-orange-500' },
]

const recentActivity = [
  { icon: 'task_alt', text: 'Completed onboarding checklist', time: '2 min ago', color: 'text-emerald-500' },
  { icon: 'login', text: 'Signed in successfully', time: 'Just now', color: 'text-blue-500' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, loading, isAdmin, isSuperAdmin, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin')
    }
  }, [loading, user, navigate])

  useEffect(() => {
    const theme = localStorage.getItem('hustlr-theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('hustlr-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('hustlr-theme', 'light')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] dark:bg-[#0a0c10] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin h-8 w-8 border-2 border-[#0c56d0] border-t-transparent rounded-full" />
          <p className="text-sm text-[#5e6168] dark:text-[#8b92a0]">Loading your workspace...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleConfig = {
    super_admin: {
      badge: 'Super Admin',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white',
      accent: 'purple',
    },
    admin: {
      badge: 'Admin',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      accent: 'blue',
    },
    user: {
      badge: 'Member',
      badgeColor: 'bg-[#e3e2e7] dark:bg-white/[0.08] text-[#5e6168] dark:text-[#8b92a0]',
      accent: 'slate',
    },
  }

  const currentRole = roleConfig[profile?.role || 'user']

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'folder_open', label: 'Projects', active: false },
    { icon: 'chat_bubble', label: 'Messages', active: false, badge: 3 },
    { icon: 'calendar_month', label: 'Calendar', active: false },
    { icon: 'description', label: 'Documents', active: false },
    { icon: 'analytics', label: 'Analytics', active: false },
  ]

  return (
    <div className="min-h-screen bg-[#f4f3f8] dark:bg-[#0a0c10] flex">
      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-white dark:bg-[#0e1220] border-r border-[#e3e2e7] dark:border-white/[0.06] flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-[72px]'}`}
        initial={false}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-[#e3e2e7] dark:border-white/[0.06] ${sidebarOpen ? 'px-5 justify-between' : 'px-0 justify-center'}`}>
          <Link to="/" className="text-xl font-black text-[#00143f] dark:text-white tracking-tighter font-headline">
            {sidebarOpen ? <>Hustlr<span className="text-[#7da1ff]">.</span></> : <span className="text-[#7da1ff]">H</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg text-[#9e9ea6] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.04] transition-all ${sidebarOpen ? '' : 'hidden lg:block absolute -right-3 bg-white dark:bg-[#0e1220] border border-[#e3e2e7] dark:border-white/[0.06] shadow-sm'}`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map(item => (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center gap-3 rounded-xl transition-all group relative ${
                    sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                  } ${
                    item.active
                      ? 'bg-[#0c56d0]/[0.08] dark:bg-[#7da1ff]/[0.08] text-[#0c56d0] dark:text-[#7da1ff]'
                      : 'text-[#5e6168] dark:text-[#8b92a0] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.03] hover:text-[#00143f] dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && !sidebarOpen && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Admin Section */}
          {isAdmin && (
            <div className="mt-6 px-3">
              <div className={`${sidebarOpen ? 'px-3 mb-2' : 'text-center mb-2'}`}>
                {sidebarOpen && <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9ea6] dark:text-[#4a5068]">Admin</p>}
              </div>
              <button
                onClick={() => navigate('/admin')}
                className={`w-full flex items-center gap-3 rounded-xl transition-all ${
                  sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                } text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/[0.06]`}
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                {sidebarOpen && <span className="text-sm font-medium">Admin Dashboard</span>}
              </button>
            </div>
          )}
        </nav>

        {/* Bottom: Theme toggle */}
        <div className={`p-3 border-t border-[#e3e2e7] dark:border-white/[0.06] ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 rounded-xl text-[#5e6168] dark:text-[#8b92a0] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.03] transition-all ${
              sidebarOpen ? 'px-3 py-2.5 w-full' : 'p-2.5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
            {sidebarOpen && <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0e1220]/80 backdrop-blur-xl border-b border-[#e3e2e7] dark:border-white/[0.06] flex items-center justify-between px-6 lg:px-8">
          <div>
            <h2 className="text-sm font-semibold text-[#00143f] dark:text-white">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-[#5e6168] dark:text-[#8b92a0] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.04] transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-[#f4f3f8] dark:hover:bg-white/[0.04] transition-colors"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0c56d0] to-[#7da1ff] flex items-center justify-center text-white text-sm font-bold">
                    {profile?.first_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-[#00143f] dark:text-white leading-tight">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-[11px] text-[#9e9ea6] dark:text-[#4a5068]">@{profile?.username}</p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#9e9ea6]">expand_more</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1c24] rounded-xl shadow-xl border border-[#e3e2e7] dark:border-white/[0.08] overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-[#e3e2e7] dark:border-white/[0.06]">
                        <p className="text-sm font-semibold text-[#00143f] dark:text-white">{profile?.first_name} {profile?.last_name}</p>
                        <p className="text-xs text-[#9e9ea6] dark:text-[#4a5068] mt-0.5">{profile?.email}</p>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 ${currentRole.badgeColor}`}>
                          {currentRole.badge}
                        </span>
                      </div>
                      <div className="py-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5e6168] dark:text-[#8b92a0] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.04] transition-colors">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                          Profile
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5e6168] dark:text-[#8b92a0] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.04] transition-colors">
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                          Settings
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => { setShowProfileMenu(false); navigate('/admin') }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/[0.06] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Admin Dashboard
                          </button>
                        )}
                      </div>
                      <div className="border-t border-[#e3e2e7] dark:border-white/[0.06] py-1">
                        <button
                          onClick={() => { signOut(); navigate('/signin') }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#00143f] dark:text-white font-headline tracking-tight">
                  {greetingByTime()}, {profile?.first_name} 👋
                </h1>
                <p className="text-[#5e6168] dark:text-[#8b92a0] text-sm mt-1">
                  Here's what's happening with your workspace today.
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${currentRole.badgeColor}`}>
                {currentRole.badge}
              </span>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Projects', value: '12', change: '+2 this week', icon: 'folder_open', gradient: 'from-[#0c56d0] to-[#3d7aed]' },
              { label: 'Tasks Completed', value: '148', change: '86% completion', icon: 'task_alt', gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Team Members', value: '24', change: '+3 new', icon: 'group', gradient: 'from-violet-500 to-purple-600' },
              { label: 'Hours Tracked', value: '320h', change: 'This month', icon: 'schedule', gradient: 'from-amber-500 to-orange-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-white/[0.02] border border-[#e3e2e7] dark:border-white/[0.06] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-none transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-[20px]">{stat.icon}</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#c4c6d0] dark:text-[#3a3f4e]">trending_up</span>
                </div>
                <p className="text-2xl font-bold text-[#00143f] dark:text-white font-headline">{stat.value}</p>
                <p className="text-xs text-[#9e9ea6] dark:text-[#4a5068] mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-emerald-500 font-medium mt-2">{stat.change}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-[#e3e2e7] dark:border-white/[0.06] rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-base font-bold text-[#00143f] dark:text-white font-headline mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-[#e3e2e7] dark:border-white/[0.06] hover:border-[#0c56d0]/20 dark:hover:border-[#7da1ff]/20 hover:shadow-md hover:shadow-black/[0.03] dark:hover:shadow-none transition-all group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-white text-[20px]">{action.icon}</span>
                    </div>
                    <span className="text-xs font-medium text-[#5e6168] dark:text-[#8b92a0] group-hover:text-[#00143f] dark:group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Admin Quick Access */}
              {isAdmin && (
                <div className="mt-5 pt-5 border-t border-[#e3e2e7] dark:border-white/[0.06]">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-500/[0.06] dark:to-violet-500/[0.06] border border-purple-200/60 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[20px]">admin_panel_settings</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">Admin Dashboard</p>
                        <p className="text-[11px] text-purple-500/70 dark:text-purple-400/50">Manage users, roles & settings</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-purple-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white dark:bg-white/[0.02] border border-[#e3e2e7] dark:border-white/[0.06] rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-base font-bold text-[#00143f] dark:text-white font-headline mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f4f3f8] dark:bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                      <span className={`material-symbols-outlined text-[16px] ${activity.color}`}>{activity.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-[#00143f] dark:text-white">{activity.text}</p>
                      <p className="text-[11px] text-[#9e9ea6] dark:text-[#4a5068] mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Card */}
              <div className="mt-6 pt-5 border-t border-[#e3e2e7] dark:border-white/[0.06]">
                <div className="flex items-center gap-3 mb-4">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0c56d0] to-[#7da1ff] flex items-center justify-center text-white text-lg font-bold">
                      {profile?.first_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#00143f] dark:text-white">{profile?.first_name} {profile?.last_name}</p>
                    <p className="text-[11px] text-[#9e9ea6] dark:text-[#4a5068]">@{profile?.username}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#5e6168] dark:text-[#8b92a0]">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    {profile?.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5e6168] dark:text-[#8b92a0]">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="material-symbols-outlined text-[14px] text-[#5e6168] dark:text-[#8b92a0]">shield</span>
                    <span className={`font-medium ${
                      isSuperAdmin ? 'text-purple-600 dark:text-purple-400' :
                      isAdmin ? 'text-blue-600 dark:text-blue-400' :
                      'text-[#5e6168] dark:text-[#8b92a0]'
                    }`}>
                      {currentRole.badge}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Super Admin Banner */}
          {isSuperAdmin && (
            <motion.div
              className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full bg-white/20 translate-y-1/2" />
              </div>
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-white/80 text-[20px]">verified</span>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Super Admin Access</p>
                  </div>
                  <p className="text-white text-lg font-bold font-headline">Full system control enabled</p>
                  <p className="text-white/60 text-sm mt-1">You have unrestricted access to all admin features and settings.</p>
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="shrink-0 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium transition-all"
                >
                  Open Admin
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
