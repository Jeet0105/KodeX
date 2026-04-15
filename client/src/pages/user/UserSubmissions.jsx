import { useEffect, useState, useCallback } from "react"
import api from "../../utils/api"
import { toast } from "react-toastify"
import { FiSearch, FiChevronDown, FiChevronUp, FiCode, FiClock, FiActivity, FiLayers } from "react-icons/fi"

const VERDICT_STYLES = {
  AC:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  WA:  "bg-red-500/15 text-red-400 border-red-500/20",
  TLE: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  MLE: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  CE:  "bg-gray-500/15 text-gray-400 border-gray-500/20",
}

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-red-400",
}

export default function UserSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [verdictFilter, setVerdictFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")

  /* Expanded row for code view */
  const [expandedId, setExpandedId] = useState(null)
  const [expandedCode, setExpandedCode] = useState("")
  const [codeLoading, setCodeLoading] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 15 }
      if (debouncedSearch) params.search = debouncedSearch
      if (verdictFilter !== "all") params.verdict = verdictFilter
      if (languageFilter !== "all") params.language = languageFilter

      const res = await api.get("/api/v1/submissions/my-submissions", { params })
      setSubmissions(res.data.submissions)
      setTotalPages(res.data.totalPages)
      setTotalSubmissions(res.data.totalSubmissions)
    } catch (err) {
      toast.error("Failed to load your submissions")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, verdictFilter, languageFilter])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(delay)
  }, [search])

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedCode("")
      return
    }

    setExpandedId(id)
    setCodeLoading(true)

    try {
      const res = await api.get(`/api/v1/submissions/${id}`)
      setExpandedCode(res.data.submission?.code || "// No code available")
    } catch {
        // Fallback: Backend might not have a general user 'get single submission' yet
        setExpandedCode("// Failed to load code (Access Restricted or Route Missing)")
    } finally {
      setCodeLoading(false)
    }
  }

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-inter">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Submission History</h1>
          <p className="text-gray-400 mt-1 font-medium">
            Review your past solutions and performance
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-bold flex items-center gap-2">
            <FiActivity size={16} />
            {totalSubmissions} Total Submissions
        </div>
      </div>

      {/* ═══ FILTERS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-400 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by problem title..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 outline-none text-sm text-white placeholder-gray-600 transition-all focus:bg-white/[0.05]"
          />
        </div>

        {/* Verdict filter */}
        <select
          value={verdictFilter}
          onChange={(e) => { setVerdictFilter(e.target.value); setPage(1) }}
          className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 outline-none cursor-pointer focus:border-violet-500/50 transition-all hover:bg-white/[0.05]"
        >
          <option value="all">All Verdicts</option>
          <option value="AC">Accepted</option>
          <option value="WA">Wrong Answer</option>
          <option value="TLE">Time Limit</option>
          <option value="MLE">Memory Limit</option>
          <option value="CE">Compile Error</option>
        </select>

        {/* Language filter */}
        <select
          value={languageFilter}
          onChange={(e) => { setLanguageFilter(e.target.value); setPage(1) }}
          className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 outline-none cursor-pointer focus:border-violet-500/50 transition-all hover:bg-white/[0.05]"
        >
          <option value="all">All Languages</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl relative group hover:border-white/[0.1] transition-all">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">Loading archive...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04] text-gray-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-5 font-black w-12" />
                  <th className="px-4 py-5 font-black text-left">Problem</th>
                  <th className="px-4 py-5 font-black text-left">Verdict</th>
                  <th className="px-4 py-5 font-black text-left">Language</th>
                  <th className="px-4 py-5 font-black text-left">Score</th>
                  <th className="px-4 py-5 font-black text-left">Runtime</th>
                  <th className="px-6 py-5 font-black text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <FiLayers size={40} className="text-gray-700" />
                            <p className="text-gray-500 font-bold text-lg italic">No submissions match your filters</p>
                        </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <>
                      <tr
                        key={sub._id}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group/row"
                        onClick={() => toggleExpand(sub._id)}
                      >
                        <td className="px-6 py-5 text-gray-600 group-hover/row:text-violet-400 transition-colors">
                          {expandedId === sub._id ? (
                            <FiChevronUp size={16} />
                          ) : (
                            <FiChevronDown size={16} />
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <div>
                            <p className="text-white font-bold group-hover/row:text-violet-400 transition-colors">{sub.problem?.title || "Deleted"}</p>
                            {sub.problem?.difficulty && (
                              <span className={`text-[10px] font-black uppercase tracking-tighter ${DIFFICULTY_COLORS[sub.problem.difficulty]}`}>
                                {sub.problem.difficulty}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              VERDICT_STYLES[sub.verdict] || VERDICT_STYLES.CE
                            }`}
                          >
                            {sub.verdict}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <span className="text-xs font-bold text-gray-400 capitalize bg-white/[0.04] px-2 py-1 rounded-lg">
                            {sub.language}
                          </span>
                        </td>

                        <td className="px-4 py-5 text-gray-300 font-bold">
                          {sub.passedCount ?? 0} <span className="text-gray-600">/</span> {sub.totalCount ?? 0}
                        </td>

                        <td className="px-4 py-5 text-gray-400 font-mono text-xs">
                          {sub.totalRuntime != null ? `${sub.totalRuntime}s` : "-"}
                        </td>

                        <td className="px-6 py-5 text-right text-gray-500 text-xs font-medium">
                          {new Date(sub.createdAt).toLocaleDateString()}
                          <div className="text-[10px] opacity-60"> {new Date(sub.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                      </tr>

                      {expandedId === sub._id && (
                        <tr key={`${sub._id}-code`}>
                          <td colSpan={7} className="px-8 py-6 bg-black/40">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20">
                                        <FiCode size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-white uppercase tracking-wider underline decoration-violet-500/50 decoration-2 underline-offset-4">
                                        Source Code
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>Read Only</span>
                                    </div>
                                    <div className="bg-white/[0.05] px-2 py-1 rounded-md">{sub.language}</div>
                                </div>
                            </div>

                            {codeLoading ? (
                              <div className="flex items-center gap-3 py-8 ml-2">
                                <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                                <span className="text-gray-500 font-bold animate-pulse uppercase text-xs tracking-widest">Decrypting...</span>
                              </div>
                            ) : (
                              <div className="relative group/code">
                                <pre className="bg-[#050209] rounded-2xl p-6 overflow-x-auto text-sm text-gray-400 leading-relaxed border border-white/[0.05] max-h-[500px] overflow-y-auto custom-scrollbar font-mono shadow-inner">
                                    <code>{expandedCode}</code>
                                </pre>
                                <div className="absolute top-4 right-4 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(expandedCode);
                                            toast.success("Code copied to clipboard");
                                        }}
                                        className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white transition-all backdrop-blur-md border border-white/[0.05]"
                                    >
                                        <FiLayers size={14} />
                                    </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ PAGINATION ═══ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${
              page === 1
                ? "opacity-20 cursor-not-allowed text-gray-500 bg-white/[0.02]"
                : "text-gray-400 hover:text-white bg-white/[0.03] hover:bg-violet-600/20 border border-white/[0.06] hover:border-violet-500/30 cursor-pointer active:scale-95"
            }`}
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
              <span className="text-violet-400 font-black text-sm">{page}</span>
              <span className="text-gray-600 font-bold">/</span>
              <span className="text-gray-500 font-bold text-sm">{totalPages}</span>
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${
              page === totalPages
                ? "opacity-20 cursor-not-allowed text-gray-500 bg-white/[0.02]"
                : "text-gray-400 hover:text-white bg-white/[0.03] hover:bg-violet-600/20 border border-white/[0.06] hover:border-violet-500/30 cursor-pointer active:scale-95"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Floating total indicator */}
      <div className="text-center font-black text-[10px] text-gray-700 tracking-[0.4em] uppercase py-4">
          END OF RECORDS
      </div>

    </div>
  )
}
