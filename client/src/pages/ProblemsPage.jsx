import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import api from "../utils/api"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

const DIFFICULTIES = ["Easy", "Medium", "Hard"]
const TOPICS = ["Array", "Hash Table", "String", "Two Pointers", "Stack", "DP", "Binary Search", "Greedy", "DFS", "Heap", "Linked List", "Sorting"]

const diffColors = {
    easy: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.2)" },
    medium: { bg: "rgba(234,179,8,0.1)", text: "#facc15", border: "rgba(234,179,8,0.2)" },
    hard: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.2)" },
}

export default function ProblemsPage() {
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selDiffs, setSelDiffs] = useState([])

    const [selTopics, setSelTopics] = useState([])
    const [hoveredRow, setHoveredRow] = useState(null)
    const [metadata, setMetadata] = useState({ counts: { easy: 0, medium: 0, hard: 0 }, totalProblems: 0 })
    const [userStats, setUserStats] = useState(null)

    const navigate = useNavigate()
    const { user } = useSelector((s) => s.user)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [metaRes, userRes] = await Promise.all([
                    api.get("/api/v1/problems/metadata"),
                    user ? api.get("/api/v1/users/me/rank") : Promise.resolve({ data: null })
                ]);
                setMetadata(metaRes.data);
                if (userRes.data) setUserStats(userRes.data);
            } catch (error) {
                console.error("Failed to fetch page stats", error);
            }
        };
        fetchStats();
    }, [user]);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 450)
        return () => clearTimeout(t)
    }, [search])

    const fetchProblems = useCallback(async () => {
        const ctrl = new AbortController()
        setLoading(true)
        try {
            const params = { page, limit: 15 }
            if (debouncedSearch.trim()) params.search = debouncedSearch
            if (selDiffs.length === 1) params.difficulty = selDiffs[0].toLowerCase()
            if (selTopics.length === 1) params.topic = selTopics[0]
            const res = await api.get("/api/v1/problems", { params, signal: ctrl.signal })
            setProblems(res.data.problems)
            setTotalPages(res.data.totalPages)
            setTotal(res.data.totalProblems)
        } catch (e) {
            if (e.name === "CanceledError") return
        } finally {
            setLoading(false)
        }
        return () => ctrl.abort()
    }, [page, debouncedSearch, selDiffs, selTopics])

    useEffect(() => { fetchProblems() }, [fetchProblems])

    const toggleDiff = (d) => { setSelDiffs(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]); setPage(1) }
    const toggleTopic = (t) => { setSelTopics(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]); setPage(1) }
    const clearAll = () => { setSelDiffs([]); setSelTopics([]); setSearch(""); setPage(1) }
    const pickRandom = () => { if (!problems.length) return; navigate(`/problems/${problems[Math.floor(Math.random() * problems.length)]._id}`) }

    const pageNums = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
        if (page <= 3) return [1, 2, 3, 4, "...", totalPages]
        if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
        return [1, "...", page - 1, page, page + 1, "...", totalPages]
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#080612] text-[#e2e8f0]" style={{ fontFamily: "'Syne', sans-serif" }}>
                <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .kx-input::placeholder { color: #374151; }
        .kx-input:focus { outline: none; border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
        .kx-row { transition: background 0.12s ease; cursor: pointer; }
        .kx-row:hover { background: rgba(124,58,237,0.06) !important; }
        .kx-chip { transition: all 0.15s ease; cursor: pointer; user-select: none; }
        .kx-chip:hover { border-color: rgba(124,58,237,0.5) !important; }
        .kx-pgbtn { transition: all 0.15s ease; cursor: pointer; }
        .kx-pgbtn:hover:not([disabled]) { background: rgba(124,58,237,0.15) !important; color: #a78bfa !important; }
        .kx-pgbtn[disabled] { opacity: 0.25; cursor: not-allowed; }
        .kx-random { background: linear-gradient(135deg, #6d28d9, #a855f7); transition: all 0.2s ease; cursor: pointer; border: none; }
        .kx-random:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,58,237,0.4); opacity: 0.92; }
        .kx-random:active { transform: translateY(0); }
        .kx-card-hover { transition: border-color 0.2s ease, background 0.2s ease; cursor: pointer; }
        .kx-card-hover:hover { border-color: rgba(124,58,237,0.35) !important; background: rgba(124,58,237,0.05) !important; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .kx-skel { background: linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; border-radius:6px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .kx-fadein { animation: fadeUp 0.3s ease forwards; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.25);border-radius:4px}
      `}</style>

                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute rounded-full" style={{ top: "-15%", right: "5%", width: "600px", height: "600px", background: "radial-gradient(circle,rgba(109,40,217,0.07) 0%,transparent 65%)" }} />
                    <div className="absolute rounded-full" style={{ bottom: "10%", left: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle,rgba(168,85,247,0.04) 0%,transparent 65%)" }} />
                </div>

                <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-10 pb-20">

                    {/* TOP META ROW */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="text-[11px] text-gray-600 tracking-[0.12em] font-semibold mb-1.5">
                                DASHBOARD / PROBLEM LIST
                            </div>
                            <h1 className="text-[40px] font-extrabold tracking-tight leading-none"
                                style={{ background: "linear-gradient(135deg,#e2e8f0 40%,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                Challenges
                            </h1>
                        </div>

                        {user && (
                            <div className="flex gap-3">
                                {/* Solved */}
                                <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                                    <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold leading-none">
                                            {userStats?.solvedCount || 0}
                                            <span className="text-sm text-gray-600 font-normal">/{metadata.totalProblems?.toLocaleString()}</span>
                                        </div>
                                        <div className="text-[11px] text-gray-600 mt-1 tracking-[0.05em]">Solved</div>
                                    </div>
                                </div>
                                {/* Rank */}
                                <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                                    <div className="w-9 h-9 rounded-full bg-violet-600/15 flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold leading-none text-violet-400">
                                            {userStats?.rank ? `#${userStats.rank}` : "—"}
                                        </div>
                                        <div className="text-[11px] text-gray-600 mt-1 tracking-[0.05em]">Rank</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MAIN LAYOUT */}
                    <div className="flex gap-5 items-start">

                        {/* SIDEBAR */}
                        <aside className="w-[230px] shrink-0 sticky top-6">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">

                                {/* Header */}
                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-[13px] font-bold tracking-[0.04em]">Filters</span>
                                    <button onClick={clearAll} className="text-[11px] text-violet-600 font-semibold bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity">
                                        Clear all
                                    </button>
                                </div>

                                {/* Difficulty */}
                                <div className="mb-5">
                                    <div className="text-[10px] font-bold text-gray-700 tracking-[0.12em] mb-2.5">DIFFICULTY</div>
                                    <div className="flex flex-col gap-1.5">
                                        {DIFFICULTIES.map(d => {
                                            const active = selDiffs.includes(d)
                                            const dc = diffColors[d.toLowerCase()]
                                            const counts = metadata.counts;
                                            return (
                                                <div key={d} className="kx-chip flex items-center justify-between px-3 py-2 rounded-[9px]"
                                                    onClick={() => toggleDiff(d)}
                                                    style={{
                                                        border: `1px solid ${active ? dc.border : "rgba(255,255,255,0.06)"}`,
                                                        background: active ? dc.bg : "rgba(255,255,255,0.02)",
                                                    }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3.5 h-3.5 rounded-[4px] shrink-0 flex items-center justify-center"
                                                            style={{
                                                                border: active ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                                                                background: active ? dc.text : "transparent",
                                                            }}>
                                                            {active && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                                                        </div>
                                                        <span className="text-[13px]" style={{ color: active ? dc.text : "#94a3b8", fontWeight: active ? 600 : 400 }}>{d}</span>
                                                    </div>
                                                    <span className="text-[11px] text-gray-700" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{counts[d.toLowerCase()] || 0}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="h-px bg-white/[0.05] my-4" />

                                {/* Topics */}
                                <div className="mb-5">
                                    <div className="text-[10px] font-bold text-gray-700 tracking-[0.12em] mb-2.5">POPULAR TOPICS</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TOPICS.map(t => {
                                            const active = selTopics.includes(t)
                                            return (
                                                <button key={t} className="kx-chip text-[11px] px-2.5 py-1 rounded-full cursor-pointer"
                                                    onClick={() => toggleTopic(t)}
                                                    style={{
                                                        border: `1px solid ${active ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                                                        background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.02)",
                                                        color: active ? "#a78bfa" : "#64748b",
                                                        fontFamily: "'JetBrains Mono',monospace",
                                                    }}>
                                                    {t}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="h-px bg-white/[0.05] my-4" />

                                {/* Premium */}
                                {/* <div className="rounded-xl p-4 border border-violet-600/30"
                style={{ background:"linear-gradient(135deg,rgba(109,40,217,0.35),rgba(139,92,246,0.15))" }}>
                <div className="text-sm font-bold mb-1.5">Unlock Solutions</div>
                <div className="text-[11px] text-violet-500 leading-relaxed mb-3.5">
                  Access 500+ premium editorial solutions and video explanations.
                </div>
                <button className="w-full bg-white text-indigo-950 rounded-lg py-2.5 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer border-none"
                  style={{ fontFamily:"'Syne',sans-serif" }}>
                  Go Premium
                </button>
              </div> */}

                            </div>
                        </aside>

                        {/* RIGHT PANEL */}
                        <div className="flex-1 min-w-0">

                            {/* Search + random */}
                            <div className="flex gap-2.5 mb-4">
                                <div className="flex-1 relative">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
                                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                    </svg>
                                    <input
                                        className="kx-input w-full pl-10 pr-4 py-2.5 rounded-xl text-[#e2e8f0] text-[13px]"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by name or keyword..."
                                        style={{
                                            background: "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            fontFamily: "'Syne',sans-serif",
                                            transition: "border-color 0.2s, box-shadow 0.2s",
                                        }}
                                    />
                                </div>
                                <button className="kx-random flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold whitespace-nowrap"
                                    onClick={pickRandom}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                        <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                                        <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                                    </svg>
                                    Pick Random
                                </button>
                                <button className="kx-card-hover w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 shrink-0 border border-white/[0.07] bg-white/[0.03] cursor-pointer">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                                    </svg>
                                </button>
                            </div>

                            {/* Table */}
                            <div className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">

                                {/* Head */}
                                <div className="grid px-5 py-2.5 bg-white/[0.025] border-b border-white/[0.05]"
                                    style={{ gridTemplateColumns: "52px 1fr 120px 190px 100px" }}>
                                    {["STATUS", "TITLE", "DIFFICULTY", "TOPICS", "ACCEPTANCE"].map(h => (
                                        <div key={h} className="text-[10px] font-bold text-gray-700 tracking-[0.1em]">{h}</div>
                                    ))}
                                </div>

                                {/* Body */}
                                {loading ? (
                                    <div className="py-2">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className="grid px-5 py-3.5 gap-3 items-center border-b border-white/[0.03]"
                                                style={{ gridTemplateColumns: "52px 1fr 120px 190px 100px" }}>
                                                <div className="kx-skel w-[26px] h-[26px] rounded-full" />
                                                <div className="kx-skel h-3.5" style={{ width: `${45 + ((i * 17) % 40)}%` }} />
                                                <div className="kx-skel h-[22px] w-[58px] rounded-[6px]" />
                                                <div className="flex gap-1.5">
                                                    <div className="kx-skel h-[18px] w-[52px]" />
                                                    <div className="kx-skel h-[18px] w-[62px]" />
                                                </div>
                                                <div className="kx-skel h-3 w-[38px]" />
                                            </div>
                                        ))}
                                    </div>
                                ) : problems.length === 0 ? (
                                    <div className="py-16 text-center text-gray-700">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2.5">
                                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                        </svg>
                                        <div className="text-sm">No problems match your filters</div>
                                        <button onClick={clearAll} className="mt-2.5 text-xs text-violet-600 bg-transparent border-none cursor-pointer hover:opacity-75"
                                            style={{ fontFamily: "'Syne',sans-serif" }}>
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    problems.map((p, idx) => {
                                        const dc = diffColors[p.difficulty] || diffColors.easy
                                        const isHovered = hoveredRow === p._id
                                        const isSolved = userStats?.solvedProblemsIds?.includes(p._id)
                                        return (
                                            <div key={p._id} className="kx-row kx-fadein grid px-5 py-3 items-center"
                                                onClick={() => navigate(`/problems/${p._id}`)}
                                                onMouseEnter={() => setHoveredRow(p._id)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                style={{
                                                    gridTemplateColumns: "52px 1fr 120px 190px 100px",
                                                    borderBottom: idx < problems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                                    animationDelay: `${idx * 0.03}s`,
                                                    backgroundColor: isSolved ? "rgba(34,197,94,0.03)" : "transparent"
                                                }}>

                                                {/* Status */}
                                                <div>
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150"
                                                        style={{
                                                            border: `1.5px solid ${isSolved ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                                                            background: isSolved ? "rgba(34,197,94,0.15)" : (isHovered ? "rgba(124,58,237,0.08)" : "transparent"),
                                                        }}>
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isSolved ? "#4ade80" : "#374151"} strokeWidth={isSolved ? "3" : "2.5"}>
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <div className="text-sm font-medium transition-colors duration-150"
                                                    style={{ color: isHovered ? "#c4b5fd" : "#d1d5db" }}>
                                                    {idx + 1 + (page - 1) * 15}. {p.title}
                                                </div>

                                                {/* Difficulty */}
                                                <div>
                                                    <span className="text-[10px] font-bold tracking-[0.07em] uppercase px-2.5 py-1 rounded-[6px]"
                                                        style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                                                        {p.difficulty}
                                                    </span>
                                                </div>

                                                {/* Topics */}
                                                <div className="flex flex-wrap gap-1">
                                                    {p.topics?.slice(0, 2).map(t => (
                                                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-[5px] text-slate-500 border border-white/[0.05] bg-white/[0.04]"
                                                            style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                    {p.topics?.length > 2 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-[5px] text-violet-600 border border-violet-600/15 bg-violet-600/10"
                                                            style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                                                            +{p.topics.length - 2}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Acceptance */}
                                                <div className="text-xs text-slate-600" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                                                    {p.acceptanceRate || 0}%
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Footer: count + pagination */}
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-xs text-gray-700">
                                    Showing{" "}
                                    <strong className="text-slate-500">{(page - 1) * 15 + 1}–{Math.min(page * 15, total)}</strong>
                                    {" "}of{" "}
                                    <strong className="text-slate-500">{total?.toLocaleString()}</strong>
                                </div>

                                <div className="flex gap-1 items-center">
                                    <button className="kx-pgbtn w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-white/[0.03] border border-white/[0.06]"
                                        disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                                    </button>

                                    {pageNums().map((n, i) => (
                                        n === "..." ? (
                                            <span key={`dot-${i}`} className="px-1 text-gray-700 text-[13px]">…</span>
                                        ) : (
                                            <button key={n} className="kx-pgbtn w-8 h-8 rounded-lg text-xs font-semibold"
                                                onClick={() => setPage(n)}
                                                style={{
                                                    background: page === n ? "linear-gradient(135deg,#6d28d9,#a855f7)" : "rgba(255,255,255,0.03)",
                                                    border: `1px solid ${page === n ? "transparent" : "rgba(255,255,255,0.06)"}`,
                                                    color: page === n ? "white" : "#64748b",
                                                    boxShadow: page === n ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
                                                    fontFamily: "'Syne',sans-serif",
                                                }}>
                                                {n}
                                            </button>
                                        )
                                    ))}

                                    <button className="kx-pgbtn w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-white/[0.03] border border-white/[0.06]"
                                        disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Bottom cards */}
                            {/* <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                { emoji:"🔥", label:"Most Popular this Week", sub:"Longest Palindromic Substring", action:"View",  color:"#f97316" },
                { emoji:"⚡", label:"Daily Challenge",        sub:"Binary Tree Inorder Traversal", action:"Solve", color:"#a78bfa" },
              ].map(card => (
                <div key={card.label} className="kx-card-hover flex items-center justify-between px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="text-[22px] leading-none">{card.emoji}</div>
                    <div>
                      <div className="text-[13px] font-semibold mb-0.5">{card.label}</div>
                      <div className="text-[11px] text-slate-600">{card.sub}</div>
                    </div>
                  </div>
                  <button className="text-xs font-bold bg-transparent border-none cursor-pointer hover:opacity-75 transition-opacity"
                    style={{ color:card.color, fontFamily:"'Syne',sans-serif" }}>
                    {card.action}
                  </button>
                </div>
              ))}
            </div> */}

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}