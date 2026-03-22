import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import api from "../utils/api"
import Editor from "@monaco-editor/react"

const LANGUAGES = [
  { label: "C++",        value: "cpp",        monaco: "cpp"        },
  { label: "Java",       value: "java",       monaco: "java"       },
  { label: "Python",     value: "python",     monaco: "python"     },
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
]

const diffColors = {
  easy:   { text: "#4ade80", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.2)"  },
  medium: { text: "#facc15", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.2)"  },
  hard:   { text: "#f87171", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)"  },
}

export default function ProblemSolvePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.user)

  const [problem, setProblem]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState("description")
  const [language, setLanguage]         = useState("cpp")
  const [code, setCode]                 = useState({})
  const [running, setRunning]           = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [output, setOutput]             = useState(null)
  const [outputOpen, setOutputOpen]     = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  /* ── fetch problem ── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/v1/problems/${id}`)
        const p = res.data.problem
        setProblem(p)
        // initialise code state with starter code per language
        const initial = {}
        p.driverCode?.forEach(d => { initial[d.language] = d.starterCode })
        setCode(initial)
      } catch {
        navigate("/problems")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const currentDriver = problem?.driverCode?.find(d => d.language === language)
  const currentCode   = code[language] ?? ""

  //todo
  const handleRun = async () => {
    setRunning(true)
    setOutputOpen(true)
    setOutput({ status: "running" })
    try {
      const res = await api.post(`/api/v1/submissions/run`, {
        problemId: id,
        language,
        code: currentCode,
      })
      setOutput({ status: "run", data: res.data })
    } catch (err) {
      setOutput({ status: "error", message: err.response?.data?.message || "Run failed" })
    } finally {
      setRunning(false)
    }
  }

  //todo
  const handleSubmit = async () => {
    setSubmitting(true)
    setOutputOpen(true)
    setOutput({ status: "running" })
    try {
      const res = await api.post(`/api/v1/submissions/submit`, {
        problemId: id,
        language,
        code: currentCode,
      })
      setOutput({ status: "submit", data: res.data })
    } catch (err) {
      setOutput({ status: "error", message: err.response?.data?.message || "Submission failed" })
    } finally {
      setSubmitting(false)
    }
  }

  const resetCode = () => {
    if (!currentDriver) return
    setCode(prev => ({ ...prev, [language]: currentDriver.starterCode }))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080612] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/>
    </div>
  )

  if (!problem) return null

  const dc = diffColors[problem.difficulty] || diffColors.easy

  return (
    <div className="h-screen bg-[#080612] text-[#e2e8f0] flex flex-col overflow-hidden"
      style={{ fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .kx-tab { transition: all 0.15s ease; cursor: pointer; }
        .kx-tab:hover { color: white; }
        .kx-tab.active { color: white; border-bottom: 2px solid #7c3aed; }

        .kx-lang-opt { transition: background 0.1s; cursor: pointer; }
        .kx-lang-opt:hover { background: rgba(124,58,237,0.15); }

        .kx-run { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; cursor: pointer; }
        .kx-run:hover { background: rgba(255,255,255,0.1); }
        .kx-run:disabled { opacity: 0.4; cursor: not-allowed; }

        .kx-submit { background: linear-gradient(135deg, #6d28d9, #a855f7); transition: all 0.2s; cursor: pointer; border: none; }
        .kx-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.4); }
        .kx-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .kx-scroll::-webkit-scrollbar { width: 4px; }
        .kx-scroll::-webkit-scrollbar-track { background: transparent; }
        .kx-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.2); border-radius: 4px; }

        .code-tag { background: rgba(124,58,237,0.12); color: #a78bfa; border: 1px solid rgba(124,58,237,0.2); border-radius: 4px; padding: 1px 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }

        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-dot { animation: pulse-dot 1.2s infinite; }
      `}</style>

      {/* ── TOP NAV ── */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0"
        style={{ background: "rgba(8,6,18,0.95)", backdropFilter: "blur(12px)" }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate("/problems")}
            className="flex items-center gap-1.5 hover:text-white transition-colors text-gray-400">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <span className="font-bold text-white">KodeX</span>
          </button>
          <span className="text-gray-700">/</span>
          <button onClick={() => navigate("/problems")} className="text-gray-500 hover:text-white transition-colors">Problems</button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300 font-medium truncate max-w-[180px]">{problem.title}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-sm text-gray-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px" }}>∞</span>
          </div>
          <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
          </button>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} className="w-8 h-8 rounded-full ring-2 ring-violet-500/40" alt="avatar"/>
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN SPLIT ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-[480px] shrink-0 flex flex-col border-r border-white/[0.06]" style={{ background:"#0c0920" }}>

          {/* Tabs */}
          <div className="flex items-center gap-0 px-4 border-b border-white/[0.06] shrink-0" style={{ background:"rgba(8,6,18,0.6)" }}>
            {[
              { key:"description", label:"Description", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { key:"submissions", label:"Submissions", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
              { key:"discussion", label:"Discussion", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            ].map(tab => (
              <button key={tab.key}
                className={`kx-tab flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 ${activeTab===tab.key ? "active text-white border-violet-600" : "text-gray-500 border-transparent"}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto kx-scroll px-6 py-6">

            {activeTab === "description" && (
              <div className="space-y-6">

                {/* Title + badge */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold leading-tight">{problem.title}</h1>
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-lg mt-1"
                    style={{ background:dc.bg, color:dc.text, border:`1px solid ${dc.border}` }}>
                    {problem.difficulty}
                  </span>
                </div>

                {/* Description */}
                <div className="text-[14px] text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Examples */}
                {problem.examples?.map((ex, i) => (
                  <div key={i}>
                    <div className="text-[12px] font-bold text-gray-300 uppercase tracking-[0.1em] mb-3">
                      Example {i + 1}:
                    </div>
                    <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ background:"rgba(0,0,0,0.3)" }}>
                      <div className="px-4 py-3 space-y-1.5" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"13px" }}>
                        <div><span className="text-green-400/70">Input:</span> <span className="text-gray-300">{ex.input}</span></div>
                        <div><span className="text-blue-400/70">Output:</span> <span className="text-gray-300">{ex.output}</span></div>
                        {ex.explanation && (
                          <div className="text-gray-500 text-[12px] pt-1 border-t border-white/[0.04] mt-2">
                            <span className="text-gray-600">Explanation:</span> {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                {problem.constraints?.length > 0 && (
                  <div>
                    <div className="text-[12px] font-bold text-gray-300 uppercase tracking-[0.1em] mb-3">Constraints:</div>
                    <ul className="space-y-2">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-gray-400">
                          <span className="text-violet-500 mt-0.5 shrink-0">•</span>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Topics */}
                {problem.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {problem.topics.map(t => (
                      <span key={t} className="text-[12px] px-3 py-1 rounded-full text-violet-400 border border-violet-500/20 bg-violet-500/8"
                        style={{ background:"rgba(124,58,237,0.08)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hints */}
                {problem.hints?.length > 0 && (
                  <div>
                    <div className="text-[12px] font-bold text-gray-300 uppercase tracking-[0.1em] mb-3">Hints:</div>
                    <div className="space-y-2">
                      {problem.hints.map((h, i) => (
                        <details key={i} className="group">
                          <summary className="text-[13px] text-violet-400 cursor-pointer hover:text-violet-300 transition-colors list-none flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-open:rotate-90 transition-transform">
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                            Hint {i + 1}
                          </summary>
                          <div className="mt-2 ml-5 text-[13px] text-gray-400 leading-relaxed">{h}</div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {activeTab === "submissions" && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <div className="text-sm">No submissions yet</div>
              </div>
            )}

            {activeTab === "discussion" && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <div className="text-sm">No discussions yet</div>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background:"#070512" }}>

          {/* Editor toolbar */}
          <div className="h-11 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0"
            style={{ background:"rgba(8,6,18,0.8)" }}>
            <div className="flex items-center gap-3">

              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)" }}>
                  {LANGUAGES.find(l => l.value === language)?.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform ${langMenuOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {langMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 rounded-xl overflow-hidden z-50 border border-white/[0.08]"
                    style={{ background:"#120e24", boxShadow:"0 16px 40px rgba(0,0,0,0.6)" }}>
                    {LANGUAGES.map(l => (
                      <button key={l.value}
                        className={`kx-lang-opt w-full text-left px-4 py-2.5 text-[13px] ${language===l.value ? "text-violet-400 bg-violet-600/10" : "text-gray-400"}`}
                        onClick={() => { setLanguage(l.value); setLangMenuOpen(false) }}
                        style={{ fontFamily:"'Syne',sans-serif" }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Reset + autosave */}
            <div className="flex items-center gap-3">
              <button onClick={resetCode}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}
                title="Reset to starter code">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
                </svg>
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-green-500/70">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Auto-saved
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.value === language)?.monaco}
              value={currentCode}
              onChange={val => setCode(prev => ({ ...prev, [language]: val ?? "" }))}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbersMinChars: 3,
                renderLineHighlight: "gutter",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                bracketPairColorization: { enabled: true },
                tabSize: 4,
              }}
            />
          </div>

          {/* Console output panel */}
          {outputOpen && (
            <div className="border-t border-white/[0.06] shrink-0" style={{ background:"#0a0718", maxHeight:"260px" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-[0.1em] text-gray-500">CONSOLE OUTPUT</span>
                  {output?.status === "running" && (
                    <span className="flex items-center gap-1.5 text-[11px] text-yellow-400">
                      <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-yellow-400"/>Running...
                    </span>
                  )}
                  {output?.status === "run" && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      output.data?.allPassed ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                    }`}>
                      {output.data?.allPassed ? "● ACCEPTED" : "● WRONG ANSWER"}
                    </span>
                  )}
                  {output?.status === "submit" && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      output.data?.verdict === "Accepted" ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                    }`}>
                      ● {output.data?.verdict ?? "Judged"}
                    </span>
                  )}
                  {output?.status === "error" && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md text-red-400 bg-red-400/10">● ERROR</span>
                  )}
                </div>
                <button onClick={() => setOutputOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto kx-scroll px-4 py-3 space-y-3" style={{ maxHeight:"190px" }}>
                {output?.status === "running" && (
                  <div className="text-[13px] text-gray-600" style={{ fontFamily:"'JetBrains Mono',monospace" }}>
                    Executing code...
                  </div>
                )}
                {output?.status === "error" && (
                  <div className="text-[13px] text-red-400" style={{ fontFamily:"'JetBrains Mono',monospace" }}>
                    {output.message}
                  </div>
                )}
                {(output?.status === "run" || output?.status === "submit") && output?.data?.results?.map((r, i) => (
                  <div key={i} className="rounded-xl p-3 border"
                    style={{
                      background: r.passed ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)",
                      borderColor: r.passed ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-bold text-gray-400">Test Case {i + 1}</span>
                      <span className={`text-[11px] font-bold ${r.passed ? "text-green-400" : "text-red-400"}`}>
                        {r.passed ? "✓ Passed" : "✗ Failed"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px" }}>
                      <div>
                        <div className="text-gray-600 mb-1">Your Output</div>
                        <div className="text-gray-300 bg-black/30 rounded-lg px-3 py-2">{r.output ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Expected</div>
                        <div className="text-gray-300 bg-black/30 rounded-lg px-3 py-2">{r.expected ?? "—"}</div>
                      </div>
                    </div>
                    {(r.runtime || r.memory) && (
                      <div className="flex gap-4 mt-2 text-[11px] text-gray-600">
                        {r.runtime && <span>Runtime: <span className="text-gray-400">{r.runtime} ms</span></span>}
                        {r.memory  && <span>Memory: <span className="text-gray-400">{r.memory} MB</span></span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          <div className="h-14 flex items-center justify-between px-4 border-t border-white/[0.06] shrink-0"
            style={{ background:"rgba(8,6,18,0.9)" }}>
            <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/[0.04]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Shortcuts
            </button>

            <div className="flex items-center gap-2.5">
              <button className="kx-run flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-200"
                onClick={handleRun} disabled={running || submitting}>
                {running ? (
                  <div className="w-3.5 h-3.5 border border-gray-400/30 border-t-gray-300 rounded-full animate-spin"/>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
                Run Code
              </button>

              <button className="kx-submit flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white"
                onClick={handleSubmit} disabled={running || submitting}>
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}