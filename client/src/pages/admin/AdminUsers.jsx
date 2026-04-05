import { useEffect, useState, useCallback } from "react"
import api from "../../utils/api"
import { toast } from "react-toastify"
import { FiSearch, FiShield, FiSlash, FiCheck, FiX, FiChevronDown } from "react-icons/fi"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  /* Ban modal state */
  const [banModal, setBanModal] = useState({ open: false, user: null, banning: true })
  const [banReason, setBanReason] = useState("")

  /* Role dropdown state */
  const [roleDropdown, setRoleDropdown] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 20 }
      if (debouncedSearch) params.search = debouncedSearch
      if (roleFilter !== "all") params.role = roleFilter
      if (statusFilter !== "all") params.status = statusFilter

      const res = await api.get("/api/v1/admin/users", { params })
      setUsers(res.data.users)
      setTotalPages(res.data.totalPages)
      setTotalUsers(res.data.totalUsers)
    } catch (err) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(delay)
  }, [search])

  /* ── Actions ── */

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole })
      toast.success(res.data.message)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      )
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role")
    }
    setRoleDropdown(null)
  }

  const handleBan = async () => {
    const { user: targetUser, banning } = banModal
    try {
      const res = await api.patch(`/api/v1/admin/users/${targetUser._id}/ban`, {
        ban: banning,
        reason: banReason,
      })
      toast.success(res.data.message)
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id
            ? { ...u, isBanned: banning, banReason: banning ? banReason : null }
            : u
        )
      )
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed")
    }
    setBanModal({ open: false, user: null, banning: true })
    setBanReason("")
  }

  return (
    <div className="p-6 lg:p-8 space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">
          {totalUsers} total user{totalUsers !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ═══ FILTERS ═══ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#140A2A] border border-white/[0.08] focus:border-violet-500/50 outline-none text-sm text-white placeholder-gray-500 transition-colors"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl bg-[#140A2A] border border-white/[0.08] text-sm text-gray-300 outline-none cursor-pointer focus:border-violet-500/50 transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl bg-[#140A2A] border border-white/[0.08] text-sm text-gray-300 outline-none cursor-pointer focus:border-violet-500/50 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* ═══ TABLE ═══ */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "rgba(20,10,42,0.5)" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-medium">User</th>
                  <th className="text-left px-4 py-4 font-medium">Email</th>
                  <th className="text-left px-4 py-4 font-medium">Role</th>
                  <th className="text-left px-4 py-4 font-medium">Status</th>
                  <th className="text-left px-4 py-4 font-medium">Solved</th>
                  <th className="text-left px-4 py-4 font-medium">Joined</th>
                  <th className="text-left px-4 py-4 font-medium">Last Login</th>
                  <th className="text-right px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-16 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-violet-600/50 flex items-center justify-center text-xs font-bold text-white">
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-white">{u.username}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-400">{u.email}</td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setRoleDropdown(roleDropdown === u._id ? null : u._id)
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                              u.role === "admin"
                                ? "bg-violet-500/15 text-violet-300 border-violet-500/20"
                                : "bg-blue-500/10 text-blue-300 border-blue-500/15"
                            }`}
                          >
                            <FiShield size={12} />
                            {u.role}
                            <FiChevronDown size={12} />
                          </button>

                          {roleDropdown === u._id && (
                            <div className="absolute top-full left-0 mt-1 w-32 bg-[#1A1235] border border-white/[0.1] rounded-xl shadow-xl z-20 overflow-hidden">
                              {["user", "admin"].map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(u._id, r)}
                                  className={`w-full text-left px-4 py-2.5 text-xs font-medium capitalize cursor-pointer transition-colors ${
                                    u.role === r
                                      ? "text-violet-300 bg-violet-500/10"
                                      : "text-gray-300 hover:bg-white/[0.04]"
                                  }`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                            <FiSlash size={12} /> Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <FiCheck size={12} /> Active
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-300 font-medium">
                        {u.solvedProblems?.length || 0}
                      </td>

                      <td className="px-4 py-4 text-gray-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4 text-gray-400 text-xs">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {u.isBanned ? (
                          <button
                            onClick={() =>
                              setBanModal({ open: true, user: u, banning: false })
                            }
                            className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setBanModal({ open: true, user: u, banning: true })
                            }
                            className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ PAGINATION ═══ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page === 1
                ? "opacity-40 cursor-not-allowed text-gray-500"
                : "text-gray-300 hover:text-white bg-[#140A2A] hover:bg-white/[0.06] cursor-pointer"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page === totalPages
                ? "opacity-40 cursor-not-allowed text-gray-500"
                : "text-gray-300 hover:text-white bg-[#140A2A] hover:bg-white/[0.06] cursor-pointer"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ═══ BAN MODAL ═══ */}
      {banModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl border border-white/[0.08] p-6 space-y-5"
            style={{ background: "#140A2A" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {banModal.banning ? "Ban User" : "Unban User"}
              </h3>
              <button
                onClick={() => {
                  setBanModal({ open: false, user: null, banning: true })
                  setBanReason("")
                }}
                className="text-gray-500 hover:text-white p-1 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-gray-400 text-sm">
              {banModal.banning
                ? `Are you sure you want to ban `
                : `Are you sure you want to unban `}
              <span className="text-white font-semibold">
                {banModal.user?.username}
              </span>
              ?
            </p>

            {banModal.banning && (
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Reason (optional)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter ban reason..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0617] border border-white/[0.08] focus:border-violet-500/50 outline-none text-sm text-white placeholder-gray-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setBanModal({ open: false, user: null, banning: true })
                  setBanReason("")
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer ${
                  banModal.banning
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {banModal.banning ? "Ban User" : "Unban User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
