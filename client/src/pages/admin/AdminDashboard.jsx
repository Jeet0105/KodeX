import { useEffect, useState } from "react"
import api from "../../utils/api"
import { toast } from "react-toastify"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { FiUsers, FiFileText, FiSend, FiTrendingUp } from "react-icons/fi"

const VERDICT_COLORS = {
  AC: "#22c55e",
  WA: "#ef4444",
  TLE: "#f59e0b",
  MLE: "#a855f7",
  CE: "#6b7280",
}

const DIFFICULTY_COLORS = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/v1/admin/dashboard")
        setStats(res.data)
      } catch (err) {
        toast.error("Failed to load dashboard stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "from-violet-600 to-violet-400",
      bg: "bg-violet-500/10",
      text: "text-violet-400",
    },
    {
      label: "Total Problems",
      value: stats.totalProblems,
      icon: FiFileText,
      color: "from-blue-600 to-blue-400",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
    },
    {
      label: "Total Submissions",
      value: stats.totalSubmissions,
      icon: FiSend,
      color: "from-emerald-600 to-emerald-400",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
    },
    {
      label: "Acceptance Rate",
      value: `${stats.acceptanceRate}%`,
      icon: FiTrendingUp,
      color: "from-amber-600 to-amber-400",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
    },
  ]

  const verdictData = Object.entries(stats.verdictBreakdown).map(
    ([name, value]) => ({ name, value })
  )

  const difficultyData = Object.entries(stats.difficultyBreakdown).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: DIFFICULTY_COLORS[name],
    })
  )

  return (
    <div className="p-6 lg:p-8 space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 group hover:border-white/[0.12] transition-all duration-300"
            style={{ background: "rgba(20,10,42,0.5)" }}
          >
            {/* Gradient glow */}
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${card.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}
            />

            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.bg} mb-3`}>
                <card.icon size={20} className={card.text} />
              </div>
              <p className="text-gray-400 text-sm font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value.toLocaleString?.() ?? card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Submissions trend */}
        <div
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] p-6"
          style={{ background: "rgba(20,10,42,0.5)" }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Submissions Trend</h3>
          <p className="text-gray-400 text-sm mb-6">Last 30 days</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.submissionsPerDay}>
                <defs>
                  <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1235",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#submissionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verdict distribution */}
        <div
          className="rounded-2xl border border-white/[0.06] p-6"
          style={{ background: "rgba(20,10,42,0.5)" }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Verdicts</h3>
          <p className="text-gray-400 text-sm mb-6">Distribution overview</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {verdictData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={VERDICT_COLORS[entry.name] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a1235",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {verdictData.map((v) => (
              <div key={v.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: VERDICT_COLORS[v.name] }}
                />
                <span className="text-xs text-gray-400">
                  {v.name} ({v.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SECOND ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Difficulty breakdown */}
        <div
          className="rounded-2xl border border-white/[0.06] p-6"
          style={{ background: "rgba(20,10,42,0.5)" }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Problems by Difficulty</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1235",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {difficultyData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent submissions */}
        <div
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] p-6"
          style={{ background: "rgba(20,10,42,0.5)" }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Submissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Problem</th>
                  <th className="text-left pb-3 font-medium">Verdict</th>
                  <th className="text-left pb-3 font-medium">Language</th>
                  <th className="text-right pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.recentSubmissions?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  stats.recentSubmissions?.map((sub) => (
                    <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {sub.user?.avatarUrl ? (
                            <img
                              src={sub.user.avatarUrl}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-violet-600/50 flex items-center justify-center text-[10px] font-bold">
                              {sub.user?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                          )}
                          <span className="text-gray-300">
                            {sub.user?.username || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400">
                        {sub.problem?.title || "Deleted"}
                      </td>
                      <td className="py-3">
                        <VerdictBadge verdict={sub.verdict} />
                      </td>
                      <td className="py-3 text-gray-400 capitalize">{sub.language}</td>
                      <td className="py-3 text-gray-500 text-right text-xs">
                        {timeAgo(sub.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ QUICK STATS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickStat label="Active Users (7d)" value={stats.activeUsers} />
        <QuickStat
          label="Top Problem"
          value={stats.topProblems?.[0]?.title || "N/A"}
          sub={stats.topProblems?.[0] ? `${stats.topProblems[0].submissions} submissions` : ""}
        />
        <QuickStat
          label="New Users Today"
          value={
            stats.newUsersPerDay?.find(
              (d) => d.date === new Date().toISOString().slice(0, 10)
            )?.count || 0
          }
        />
      </div>
    </div>
  )
}


/* ── Helper components ── */

function VerdictBadge({ verdict }) {
  const styles = {
    AC: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    WA: "bg-red-500/15 text-red-400 border-red-500/20",
    TLE: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    MLE: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    CE: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  }

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${
        styles[verdict] || styles.CE
      }`}
    >
      {verdict}
    </span>
  )
}

function QuickStat({ label, value, sub }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "rgba(20,10,42,0.5)" }}
    >
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-xl font-bold text-white mt-1 truncate">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
