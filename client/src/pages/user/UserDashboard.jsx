import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import api from "../../utils/api"
import { toast } from "react-toastify"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts"
import { FiTrendingUp, FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi"
import { FaFire } from "react-icons/fa"

const DIFFICULTY_COLORS = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
}

const VERDICT_STYLES = {
  AC: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: FiCheckCircle },
  WA: { label: "Wrong Answer", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: FiXCircle },
  TLE: { label: "Time Limit Exceeded", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: FiClock },
  MLE: { label: "Memory Limit Exceeded", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: FiClock },
  CE: { label: "Compilation Error", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20", icon: FiXCircle },
}

export default function UserDashboard() {
  const { user } = useSelector((state) => state.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/v1/users/dashboard-stats")
        setStats(res.data)
      } catch (err) {
        toast.error("Failed to load dashboard statistics")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Analyzing your progress...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const solvedData = [
    { name: "Easy", value: stats.solvedBreakdown.easy, fill: DIFFICULTY_COLORS.easy },
    { name: "Medium", value: stats.solvedBreakdown.medium, fill: DIFFICULTY_COLORS.medium },
    { name: "Hard", value: stats.solvedBreakdown.hard, fill: DIFFICULTY_COLORS.hard },
    { name: "Remaining", value: Math.max(0, (stats.totalProblems || 1200) - stats.solvedBreakdown.total), fill: "rgba(255,255,255,0.03)" }
  ]

  // Activity Heatmap Generation (Github Style Grid)
  const renderHeatmap = () => {
      const displayDays = 365; // ~1 year to cover the whole width
      const grid = [];
      const activityMap = {};
      let maxCount = 1;
      
      stats.activityData.forEach(d => {
          activityMap[d.date] = d.count;
          if (d.count > maxCount) maxCount = d.count;
      });
      
      const today = new Date();
      let start = new Date(today);
      start.setDate(today.getDate() - displayDays);
      
      // Rewind to the nearest Sunday to match a 7-row grid correctly
      while(start.getDay() !== 0) {
          start.setDate(start.getDate() - 1);
      }
      
      const totalDays = Math.ceil(Math.abs(today - start) / (1000 * 60 * 60 * 24)) + 1;
      const current = new Date(start);
      
      for(let i = 0; i < totalDays; i++) {
          // activityData groups by UTC date strings ("YYYY-MM-DD")
          const utcDateStr = current.toISOString().split('T')[0];
          
          const count = activityMap[utcDateStr] || 0;
          let opacity = "bg-white/[0.03]";
          
          if (count > 0) {
             const intensity = count / maxCount;
             if (intensity > 0.75) opacity = "bg-violet-600";
             else if (intensity > 0.5) opacity = "bg-violet-600/80";
             else if (intensity > 0.25) opacity = "bg-violet-600/60";
             else opacity = "bg-violet-600/40";
          }
          
          grid.push(
              <div 
                key={utcDateStr} 
                className={`w-3.5 h-3.5 rounded-[3px] ${opacity} transition-all hover:ring-2 hover:ring-violet-400/50 cursor-pointer`}
                title={`${current.toDateString()}: ${count} submissions`}
              />
          );
          current.setDate(current.getDate() + 1);
      }
      return grid;
  }

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* ═══ WELCOME HEADER ═══ */}
      <section className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{stats.user.username}!</span>
        </h1>
        <p className="text-gray-400 font-medium">
          You're in the top <span className="text-emerald-400">{stats.topPercentage || 5}% of learners</span>. Keep the momentum!
        </p>
      </section>

      {/* ═══ STATS GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Problems Solved */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 group hover:border-white/[0.1] transition-all duration-500">
           <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Problems Solved</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{stats.solvedBreakdown.total}</span>
                        <span className="text-gray-600 font-bold">/{stats.totalProblems || 1200}</span>
                    </div>
                </div>
                <div className="p-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
                    <FiCheckCircle size={24} />
                </div>
           </div>

           <div className="flex items-center gap-8">
               <div className="w-32 h-32 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                            <Pie
                                data={solvedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={55}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {solvedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-[10px] font-bold text-gray-500 uppercase">SOLVED</span>
                       <span className="text-lg font-black text-white">{Math.round((stats.solvedBreakdown.total/(stats.totalProblems || 1200))*100) || 0}%</span>
                   </div>
               </div>
               
               <div className="flex-1 space-y-3">
                   <DifficultyItem label="Easy" count={stats.solvedBreakdown.easy} total={stats.totalBreakdown?.easy} color={DIFFICULTY_COLORS.easy} />
                   <DifficultyItem label="Medium" count={stats.solvedBreakdown.medium} total={stats.totalBreakdown?.medium} color={DIFFICULTY_COLORS.medium} />
                   <DifficultyItem label="Hard" count={stats.solvedBreakdown.hard} total={stats.totalBreakdown?.hard} color={DIFFICULTY_COLORS.hard} />
               </div>
           </div>
        </div>

        {/* Acceptance Rate */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 group hover:border-white/[0.1] transition-all duration-500 flex flex-col">
           <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Acceptance Rate</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{stats.acceptanceRate}%</span>
                    </div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                    <FiTrendingUp size={24} />
                </div>
           </div>
           
           <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    <FiTrendingUp size={12} />
                    <span>+2.4%</span>
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-tighter">from last month</span>
           </div>

           <div className="flex-1 -mx-8 -mb-8 mt-auto h-24 truncate opacity-40 group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.activityData.slice(-10)}>
                        <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
           </div>
        </div>

        {/* Current Streak */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 group hover:border-white/[0.1] transition-all duration-500">
           <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Current Streak</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{stats.streak.current}</span>
                        <span className="text-gray-400 font-bold">Days</span>
                    </div>
                </div>
                <div className="p-3 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-500 shadow-xl shadow-orange-500/20 animate-pulse">
                    <FaFire size={24} />
                </div>
           </div>

           <div className="relative z-10">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-tight">
                    Longest streak: <span className="text-white">{stats.streak.longest} days</span>
                </p>
           </div>

           {/* Ghost Fire Icon Background */}
           <div className="absolute right-0 bottom-0 opacity-[0.03] scale-[2.5] pr-4 pb-4 rotate-12 group-hover:scale-[2.8] group-hover:rotate-0 transition-all duration-700 pointer-events-none">
                <FaFire size={80} />
           </div>
        </div>

      </div>

      {/* ═══ ACTIVITY OVERVIEW ═══ */}
      <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                    <FiCalendar size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Activity Overview</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>Less</span>
                  <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-[3px] bg-white/[0.03]" />
                      <div className="w-3 h-3 rounded-[3px] bg-violet-600/40" />
                      <div className="w-3 h-3 rounded-[3px] bg-violet-600/60" />
                      <div className="w-3 h-3 rounded-[3px] bg-violet-600/80" />
                      <div className="w-3 h-3 rounded-[3px] bg-violet-600" />
                  </div>
                  <span>More</span>
              </div>
          </div>

          {/* Heatmap Grid */}
          <div className="w-full overflow-x-auto pb-4">
             <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
                {renderHeatmap()}
             </div>
          </div>
      </section>

      {/* ═══ RECENT SUBMISSIONS ═══ */}
      <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                    <FiClock size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Recent Submissions</h3>
              </div>
              <button className="text-violet-400 hover:text-violet-300 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group/btn">
                  VIEW ALL
                  <div className="w-5 h-px bg-violet-500/30 group-hover/btn:w-8 transition-all" />
              </button>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/[0.04]">
                          <th className="pb-4 font-black">Problem</th>
                          <th className="pb-4 font-black">Status</th>
                          <th className="pb-4 font-black">Difficulty</th>
                          <th className="pb-4 font-black">Runtime</th>
                          <th className="pb-4 font-black text-right">Submitted</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                      {stats.recentSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                                No submissions yet. Start coding!
                            </td>
                          </tr>
                      ) : (
                          stats.recentSubmissions.map((sub) => {
                              const style = VERDICT_STYLES[sub.verdict] || VERDICT_STYLES.CE;
                              const Icon = style.icon;
                              return (
                                <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors group/row">
                                    <td className="py-5 font-bold text-white text-sm group-hover/row:text-violet-400 transition-colors">
                                        {sub.problem?.title || "Untitled Problem"}
                                    </td>
                                    <td className="py-5">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider ${style.bg} ${style.color} ${style.border}`}>
                                            <Icon size={12} />
                                            {style.label}
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: DIFFICULTY_COLORS[sub.problem?.difficulty] }}>
                                            {sub.problem?.difficulty}
                                        </span>
                                    </td>
                                    <td className="py-5 text-gray-400 font-mono text-xs">
                                        {sub.runtime || 0} <span className="text-gray-600 font-bold ml-1">ms</span>
                                    </td>
                                    <td className="py-5 text-right text-gray-500 text-xs font-medium">
                                        {timeAgo(sub.createdAt)}
                                    </td>
                                </tr>
                              )
                          })
                      )}
                  </tbody>
              </table>
          </div>
      </section>

    </div>
  )
}

/* ── HELPERS ── */

function DifficultyItem({ label, count, total = 0, color }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center justify-between group/diff">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-xs font-bold text-gray-400 group-hover/diff:text-gray-300 transition-colors">
                    {label} <span className="text-gray-500 font-medium">({count}{total > 0 ? `/${total}` : ''})</span>
                </span>
            </div>
            <div className="flex-1 mx-4 h-1 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full rounded-full group-hover/diff:opacity-80 transition-all shadow-sm" style={{ background: color, width: `${Math.min(100, percentage)}%` }} />
            </div>
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
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString();
}
