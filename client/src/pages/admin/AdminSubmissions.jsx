import { useEffect, useState, useCallback } from "react"
import api from "../../utils/api"
import { toast } from "react-toastify"
import { FiSearch, FiChevronDown, FiChevronUp, FiCode } from "react-icons/fi"

const VERDICT_STYLES = {
  AC:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  WA:  "bg-red-500/15 text-red-400 border-red-500/20",
  TLE: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  MLE: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  CE:  "bg-gray-500/15 text-gray-400 border-gray-500/20",
}

export default function AdminSubmissions() {
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
      const params = { page, limit: 20 }
      if (debouncedSearch) params.search = debouncedSearch
      if (verdictFilter !== "all") params.verdict = verdictFilter
      if (languageFilter !== "all") params.language = languageFilter

      const res = await api.get("/api/v1/admin/submissions", { params })
      setSubmissions(res.data.submissions)
      setTotalPages(res.data.totalPages)
      setTotalSubmissions(res.data.totalSubmissions)
    } catch (err) {
      toast.error("Failed to load submissions")
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

  /* ── Expand row to see code ── */
  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedCode("")
      return
    }

    setExpandedId(id)
    setCodeLoading(true)

    try {
      const res = await api.get(`/api/v1/admin/submissions/${id}`)
      setExpandedCode(res.data.submission?.code || "// No code available")
    } catch {
      setExpandedCode("// Failed to load code")
    } finally {
      setCodeLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Submissions</h1>
        <p className="text-gray-400 mt-1">
          {totalSubmissions} total submission{totalSubmissions !== 1 ? "s" : ""}
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
            placeholder="Search by username or problem..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#140A2A] border border-white/[0.08] focus:border-violet-500/50 outline-none text-sm text-white placeholder-gray-500 transition-colors"
          />
        </div>

        {/* Verdict filter */}
        <select
          value={verdictFilter}
          onChange={(e) => { setVerdictFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl bg-[#140A2A] border border-white/[0.08] text-sm text-gray-300 outline-none cursor-pointer focus:border-violet-500/50 transition-colors"
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
          className="px-4 py-2.5 rounded-xl bg-[#140A2A] border border-white/[0.08] text-sm text-gray-300 outline-none cursor-pointer focus:border-violet-500/50 transition-colors"
        >
          <option value="all">All Languages</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
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
                  <th className="text-left px-6 py-4 font-medium w-8" />
                  <th className="text-left px-4 py-4 font-medium">User</th>
                  <th className="text-left px-4 py-4 font-medium">Problem</th>
                  <th className="text-left px-4 py-4 font-medium">Language</th>
                  <th className="text-left px-4 py-4 font-medium">Verdict</th>
                  <th className="text-left px-4 py-4 font-medium">Score</th>
                  <th className="text-left px-4 py-4 font-medium">Runtime</th>
                  <th className="text-left px-4 py-4 font-medium">Memory</th>
                  <th className="text-right px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <>
                      <tr
                        key={sub._id}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => toggleExpand(sub._id)}
                      >
                        {/* Expand icon */}
                        <td className="px-6 py-4 text-gray-500">
                          {expandedId === sub._id ? (
                            <FiChevronUp size={14} />
                          ) : (
                            <FiChevronDown size={14} />
                          )}
                        </td>

                        {/* User */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {sub.user?.avatarUrl ? (
                              <img src={sub.user.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-violet-600/50 flex items-center justify-center text-[10px] font-bold text-white">
                                {sub.user?.username?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                            <span className="text-gray-300 font-medium">
                              {sub.user?.username || "Unknown"}
                            </span>
                          </div>
                        </td>

                        {/* Problem */}
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-gray-300">{sub.problem?.title || "Deleted"}</p>
                            {sub.problem?.difficulty && (
                              <span
                                className={`text-[10px] font-semibold uppercase ${
                                  sub.problem.difficulty === "easy"
                                    ? "text-emerald-400"
                                    : sub.problem.difficulty === "medium"
                                    ? "text-amber-400"
                                    : "text-red-400"
                                }`}
                              >
                                {sub.problem.difficulty}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Language */}
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-300 text-xs capitalize">
                            {sub.language}
                          </span>
                        </td>

                        {/* Verdict */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                              VERDICT_STYLES[sub.verdict] || VERDICT_STYLES.CE
                            }`}
                          >
                            {sub.verdict}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-4 text-gray-300 font-medium">
                          {sub.passedCount ?? 0}/{sub.totalCount ?? 0}
                        </td>

                        {/* Runtime */}
                        <td className="px-4 py-4 text-gray-400 text-xs">
                          {sub.totalRuntime != null ? `${sub.totalRuntime}s` : "-"}
                        </td>

                        {/* Memory */}
                        <td className="px-4 py-4 text-gray-400 text-xs">
                          {sub.totalMemory != null
                            ? `${(sub.totalMemory / 1024).toFixed(1)} MB`
                            : "-"}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-right text-gray-500 text-xs">
                          {new Date(sub.createdAt).toLocaleString()}
                        </td>
                      </tr>

                      {/* ── Expanded code row ── */}
                      {expandedId === sub._id && (
                        <tr key={`${sub._id}-code`}>
                          <td colSpan="9" className="px-6 py-4 bg-[#0B0617]/80">
                            <div className="flex items-center gap-2 mb-3">
                              <FiCode size={14} className="text-violet-400" />
                              <span className="text-sm font-medium text-violet-300">
                                Submitted Code
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                ({sub.language})
                              </span>
                            </div>
                            {codeLoading ? (
                              <div className="flex items-center gap-2 py-4">
                                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                                <span className="text-gray-400 text-sm">Loading code...</span>
                              </div>
                            ) : (
                              <pre className="bg-[#1A1235] rounded-xl p-4 overflow-x-auto text-sm text-gray-300 leading-relaxed border border-white/[0.06] max-h-[400px] overflow-y-auto">
                                <code>{expandedCode}</code>
                              </pre>
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
    </div>
  )
}
