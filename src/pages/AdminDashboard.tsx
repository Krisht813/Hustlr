import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

interface UserProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { profile, isAdmin, isSuperAdmin, loading: authLoading, signOut } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
    }
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data as UserProfile[])
    }
    setLoading(false)
  }

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as UserProfile['role'] } : u))
      showToast(`Role updated to ${newRole}`)
    }
    setEditingUser(null)
  }

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      showToast('User deleted successfully')
    }
    setConfirmDelete(null)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === '' ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    users: users.filter(u => u.role === 'user').length,
  }

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    user: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-[#8b92a0]',
  }

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] dark:bg-[#0a0c10] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#0c56d0] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7fc] dark:bg-[#0a0c10]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/25"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0e1220]/80 backdrop-blur-xl border-b border-[#e3e2e7] dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-xl font-black text-[#00143f] dark:text-white tracking-tighter font-headline">
              Hustlr<span className="text-[#7da1ff]">.</span>
            </button>
            <div className="h-6 w-px bg-[#e3e2e7] dark:bg-white/[0.08]" />
            <span className="text-sm font-semibold text-[#00143f] dark:text-white">Admin Dashboard</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'}`}>
              {profile?.role?.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#5e6168] dark:text-[#8b92a0]">{profile?.email}</span>
            <button
              onClick={signOut}
              className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total, icon: 'group', color: 'from-[#0c56d0] to-[#3d7aed]' },
            { label: 'Admins', value: stats.admins, icon: 'shield_person', color: 'from-purple-500 to-purple-600' },
            { label: 'Regular Users', value: stats.users, icon: 'person', color: 'from-emerald-500 to-emerald-600' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-white/[0.03] border border-[#e3e2e7] dark:border-white/[0.06] rounded-2xl p-5 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-white text-[22px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#00143f] dark:text-white font-headline">{stat.value}</p>
                <p className="text-xs text-[#5e6168] dark:text-[#8b92a0]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#00143f] dark:text-white font-headline">User Management</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9e9ea6] dark:text-[#4a5068]">search</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.04] border border-[#e3e2e7] dark:border-white/[0.08] rounded-xl text-sm text-[#00143f] dark:text-white placeholder:text-[#9e9ea6] dark:placeholder:text-[#4a5068] focus:outline-none focus:border-[#0c56d0]/40 dark:focus:border-[#7da1ff]/40 transition-all"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-white/[0.04] border border-[#e3e2e7] dark:border-white/[0.08] rounded-xl text-sm text-[#00143f] dark:text-white focus:outline-none focus:border-[#0c56d0]/40 dark:focus:border-[#7da1ff]/40 transition-all cursor-pointer"
            >
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <button
              onClick={fetchUsers}
              className="p-2.5 bg-white dark:bg-white/[0.04] border border-[#e3e2e7] dark:border-white/[0.08] rounded-xl text-[#5e6168] dark:text-[#8b92a0] hover:text-[#00143f] dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-white/[0.02] border border-[#e3e2e7] dark:border-white/[0.06] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-6 w-6 border-2 border-[#0c56d0] border-t-transparent rounded-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[48px] text-[#c4c6d0] dark:text-[#3a3f4e] mb-3 block">person_off</span>
              <p className="text-[#5e6168] dark:text-[#8b92a0] text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e3e2e7] dark:border-white/[0.06]">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#5e6168] dark:text-[#8b92a0] uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#5e6168] dark:text-[#8b92a0] uppercase tracking-wider">Username</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#5e6168] dark:text-[#8b92a0] uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#5e6168] dark:text-[#8b92a0] uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#5e6168] dark:text-[#8b92a0] uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-[#5e6168] dark:text-[#8b92a0] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      className="border-b border-[#e3e2e7]/50 dark:border-white/[0.03] hover:bg-[#f4f3f8] dark:hover:bg-white/[0.02] transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0c56d0] to-[#7da1ff] flex items-center justify-center text-white text-sm font-bold">
                              {u.first_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-[#00143f] dark:text-white">{u.first_name} {u.last_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5e6168] dark:text-[#8b92a0] font-mono">@{u.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5e6168] dark:text-[#8b92a0]">{u.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === u.id ? (
                          <select
                            defaultValue={u.role}
                            onChange={e => updateRole(u.id, e.target.value)}
                            onBlur={() => setEditingUser(null)}
                            autoFocus
                            className="text-xs font-medium px-2 py-1 rounded-lg bg-white dark:bg-white/[0.06] border border-[#e3e2e7] dark:border-white/[0.1] text-[#00143f] dark:text-white focus:outline-none"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            {isSuperAdmin && <option value="super_admin">super_admin</option>}
                          </select>
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5e6168] dark:text-[#8b92a0]">
                          {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Can't edit own role or super_admin role (unless you're super_admin) */}
                          {u.id !== profile?.id && (isSuperAdmin || u.role !== 'super_admin') && (
                            <button
                              onClick={() => setEditingUser(u.id)}
                              className="p-1.5 rounded-lg text-[#5e6168] dark:text-[#8b92a0] hover:bg-[#e3e2e7] dark:hover:bg-white/[0.06] hover:text-[#00143f] dark:hover:text-white transition-all"
                              title="Change role"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          {isSuperAdmin && u.id !== profile?.id && u.role !== 'super_admin' && (
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              className="p-1.5 rounded-lg text-[#5e6168] dark:text-[#8b92a0] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all"
                              title="Delete user"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#9e9ea6] dark:text-[#4a5068] mt-4">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              className="bg-white dark:bg-[#1a1c24] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[#e3e2e7] dark:border-white/[0.08]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
              </div>
              <h3 className="text-lg font-bold text-[#00143f] dark:text-white font-headline mb-2">Delete user?</h3>
              <p className="text-sm text-[#5e6168] dark:text-[#8b92a0] mb-6">
                This will permanently delete this user's profile. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#e3e2e7] dark:border-white/[0.08] text-[#00143f] dark:text-white text-sm font-medium hover:bg-[#f4f3f8] dark:hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
