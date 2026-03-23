import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import api from "../utils/api"
import {
  FiFileText,
  FiBarChart2,
  FiTag,
  FiAlignLeft,
  FiAlertTriangle,
  FiList,
  FiHelpCircle,
  FiCheckSquare,
  FiBookOpen,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiAward,
  FiZap,
} from "react-icons/fi"

/* ─────────────────────────────────────────────
   Helper: Difficulty badge
───────────────────────────────────────────── */
function DifficultyBadge({ difficulty }) {
  const cfg = {
    easy: {
      text: "Easy",
      bg: "bg-green-500/15",
      border: "border-green-500/30",
      color: "text-green-400",
      dot: "bg-green-400",
    },
    medium: {
      text: "Medium",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/30",
      color: "text-yellow-400",
      dot: "bg-yellow-400",
    },
    hard: {
      text: "Hard",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      color: "text-red-400",
      dot: "bg-red-400",
    },
  }[difficulty] ?? {
    text: difficulty,
    bg: "bg-gray-500/15",
    border: "border-gray-500/30",
    color: "text-gray-400",
    dot: "bg-gray-400",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.text}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Helper: Section card wrapper
───────────────────────────────────────────── */
function SectionCard({ icon, iconBg, iconColor, title, children, rightSlot }) {
  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconBg} rounded-lg ${iconColor}`}>{icon}</div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  )
}

/* ─────────────────────────────────────────────
   Helper: Collapsible section
───────────────────────────────────────────── */
function CollapsibleSection({
  icon,
  iconBg,
  iconColor,
  title,
  defaultOpen = false,
  badge,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-6 md:p-8 group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconBg} rounded-lg ${iconColor}`}>{icon}</div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {badge && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-400 font-medium">
              {badge}
            </span>
          )}
        </div>
        <span className="text-gray-400 group-hover:text-white transition-colors">
          {open ? (
            <FiChevronUp className="w-5 h-5" />
          ) : (
            <FiChevronDown className="w-5 h-5" />
          )}
        </span>
      </button>

      {open && (
        <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-white/5">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0617] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans animate-pulse">
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Header skeleton */}
        <div className="h-8 w-32 bg-white/10 rounded-xl" />
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
          <div className="h-10 w-2/3 bg-white/10 rounded-xl" />
          <div className="flex gap-3">
            <div className="h-7 w-20 bg-white/10 rounded-full" />
            <div className="h-7 w-24 bg-white/10 rounded-full" />
            <div className="h-7 w-16 bg-white/10 rounded-full" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-3"
          >
            <div className="h-6 w-40 bg-white/10 rounded-xl" />
            <div className="h-4 w-full bg-white/10 rounded-xl" />
            <div className="h-4 w-5/6 bg-white/10 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
function ViewProblem() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [problem, setProblem] = useState(location.state?.problem || null)
  const [loading, setLoading] = useState(!location.state?.problem)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!problem && id) {
      const fetchProblem = async () => {
        try {
          setLoading(true)
          const res = await api.get(`/api/v1/problems/${id}`)
          setProblem(res.data.problem)
        } catch (err) {
          console.error(err)
          setError(err.response?.data?.message || "Failed to load problem.")
        } finally {
          setLoading(false)
        }
      }
      fetchProblem()
    }
  }, [id, problem])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0617] flex items-center justify-center text-gray-100">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400">Oops!</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!problem) return null

  const pointsMap = { easy: 1, medium: 2, hard: 5 }
  const points = problem.points ?? pointsMap[problem.difficulty] ?? 0
  const topics = Array.isArray(problem.topics) ? problem.topics : []

  return (
    <div className="min-h-screen bg-[#0B0617] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">

        {/* ── Back Button ── */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ═══════════════════════════════════════
            HEADER CARD
        ═══════════════════════════════════════ */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 break-words">
                {problem.title}
              </h1>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <DifficultyBadge difficulty={problem.difficulty} />

                {/* Points pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <FiAward className="w-4 h-4" />
                  {points} {points === 1 ? "pt" : "pts"}
                </span>

                {/* Publish status */}
                {problem.isPublished !== undefined && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
                      problem.isPublished
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-gray-500/15 border-gray-500/30 text-gray-400"
                    }`}
                  >
                    <FiZap className="w-4 h-4" />
                    {problem.isPublished ? "Published" : "Draft"}
                  </span>
                )}
              </div>

              {/* Topics */}
              {topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <FiTag className="w-4 h-4 text-gray-500" />
                  {topics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium capitalize"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            PROBLEM DESCRIPTION
        ═══════════════════════════════════════ */}
        <SectionCard
          icon={<FiAlignLeft className="w-5 h-5" />}
          iconBg="bg-pink-500/20"
          iconColor="text-pink-400"
          title="Problem Description"
        >
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
              {problem.description}
            </p>
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════
            EXAMPLES
        ═══════════════════════════════════════ */}
        {problem.examples?.length > 0 && (
          <SectionCard
            icon={<FiList className="w-5 h-5" />}
            iconBg="bg-indigo-500/20"
            iconColor="text-indigo-400"
            title="Examples"
          >
            <div className="space-y-5">
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="bg-black/20 border border-white/5 rounded-xl overflow-hidden"
                >
                  {/* Example header */}
                  <div className="px-4 py-2 bg-indigo-500/10 border-b border-white/5">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Example {i + 1}
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Input / Output grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Input
                        </span>
                        <pre className="p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
                          {ex.input}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Output
                        </span>
                        <pre className="p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
                          {ex.output}
                        </pre>
                      </div>
                    </div>

                    {/* Explanation */}
                    {ex.explanation && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Explanation
                        </span>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {ex.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ═══════════════════════════════════════
            CONSTRAINTS + HINTS (side by side)
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Constraints */}
          {problem.constraints?.length > 0 && (
            <SectionCard
              icon={<FiAlertTriangle className="w-5 h-5" />}
              iconBg="bg-yellow-500/20"
              iconColor="text-yellow-400"
              title="Constraints"
            >
              <ul className="space-y-2">
                {problem.constraints.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-xl"
                  >
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    <code className="font-mono text-sm text-yellow-100 break-all">
                      {c}
                    </code>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* Hints — reveal on click */}
          {problem.hints?.length > 0 && (
            <HintsCard hints={problem.hints} />
          )}
        </div>

        {/* ═══════════════════════════════════════
            VISIBLE TESTCASES (collapsible)
        ═══════════════════════════════════════ */}
        {problem.visibleTestcases?.length > 0 && (
          <CollapsibleSection
            icon={<FiCheckSquare className="w-5 h-5" />}
            iconBg="bg-emerald-500/20"
            iconColor="text-emerald-400"
            title="Sample Testcases"
            badge={`${problem.visibleTestcases.length}`}
            defaultOpen={true}
          >
            <div className="space-y-4">
              {problem.visibleTestcases.map((tc, i) => (
                <div
                  key={i}
                  className="bg-black/20 border border-white/5 rounded-xl overflow-hidden relative"
                >
                  {/* Testcase label */}
                  <div className="px-4 py-2 bg-emerald-500/10 border-b border-white/5">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Testcase {i + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Input
                      </span>
                      <pre className="p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
                        {tc.input}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Expected Output
                      </span>
                      <pre className="p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-emerald-200 overflow-x-auto whitespace-pre-wrap">
                        {tc.output}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* ═══════════════════════════════════════
            EDITORIAL (collapsible, hidden by default)
        ═══════════════════════════════════════ */}
        {problem.editorial && (
          <CollapsibleSection
            icon={<FiBookOpen className="w-5 h-5" />}
            iconBg="bg-purple-500/20"
            iconColor="text-purple-400"
            title="Editorial / Solution Approach"
            defaultOpen={false}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                {problem.editorial}
              </p>
            </div>
          </CollapsibleSection>
        )}

      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   HintsCard — reveal each hint individually
───────────────────────────────────────────── */
function HintsCard({ hints }) {
  const [revealed, setRevealed] = useState([])

  const toggle = (i) =>
    setRevealed((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )

  return (
    <SectionCard
      icon={<FiHelpCircle className="w-5 h-5" />}
      iconBg="bg-blue-500/20"
      iconColor="text-blue-400"
      title="Hints"
    >
      <div className="space-y-3">
        {hints.map((hint, i) => (
          <div
            key={i}
            className="border border-white/5 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 transition-colors group"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-blue-400">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                Hint {i + 1}
              </span>
              <span className="text-gray-500 group-hover:text-blue-400 transition-colors">
                {revealed.includes(i) ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </span>
            </button>

            {revealed.includes(i) && (
              <div className="px-4 pb-4 pt-3 bg-blue-500/5 border-t border-white/5">
                <p className="text-sm text-blue-100 leading-relaxed">{hint}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default ViewProblem