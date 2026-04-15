import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { toast } from "react-toastify"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"
import { FiCheckCircle, FiInfo, FiFileText, FiSliders, FiList, FiCode, FiChevronRight, FiChevronLeft, FiAlertCircle } from "react-icons/fi"
import { zodResolver } from "@hookform/resolvers/zod"
import { problemSchema } from "../schemas/problemSchema.js"

import ProblemFoundation from "../components/ProblemFoundation"
import ConstraintsSection from "../components/ConstraintsSection"
import ExamplesSection from "../components/ExamplesSection"
import HintsSection from "../components/HintsSection"
import TestCasesSection from "../components/TestCasesSection"
import DriverCodeSection from "../components/DriverCodeSection"
import ProblemStatement from "../components/ProblemStatement"

const TABS = [
  { id: "basics", label: "Basic Info", icon: FiInfo, desc: "Title, difficulty, topics" },
  { id: "statement", label: "Statement", icon: FiFileText, desc: "Main description & editorial" },
  { id: "requirements", label: "Requirements", icon: FiSliders, desc: "Constraints and hints" },
  { id: "cases", label: "Test Cases", icon: FiList, desc: "Examples & hidden tests" },
  { id: "driver", label: "Driver Code", icon: FiCode, desc: "Env templates & wrapper" },
];

function CreateProblem() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("basics")

  const methods = useForm({
    resolver: zodResolver(problemSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      topics: "",
      constraints: [{ value: "" }],
      examples: [{ input: "", output: "", explanation: "" }],
      hints: [{ value: "" }],
      editorial: "",
      visibleTestcases: [{ input: "", output: "" }],
      hiddenTestcases: [{ input: "", output: "" }],
      driverCode: [
        { language: "cpp",        judge0LanguageId: 54, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 },
        { language: "java",       judge0LanguageId: 62, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 },
        { language: "python",     judge0LanguageId: 71, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 },
        { language: "javascript", judge0LanguageId: 63, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 }
      ]
    }
  })

  // Log validation errors for debugging missing required fields
  const { errors } = methods.formState;

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        topics: data.topics
          ? data.topics.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        constraints: data.constraints.map((c) => c.value).filter(Boolean),
        hints: data.hints?.map((h) => h.value).filter(Boolean) ?? []
      }

      const response = await api.post("/api/v1/problems", payload)
      toast.success(response.data.message || "Problem created successfully 🚀")
      navigate("/admin")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create problem")
    }
  }

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const handleNext = () => {
    if (currentTabIndex < TABS.length - 1) setActiveTab(TABS[currentTabIndex + 1].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handlePrev = () => {
    if (currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#080510] text-[#e2e8f0] pb-24" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Premium ambient glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#080510]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300">
              Problem Studio
            </h1>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-1">
              Admin / Create Problem
            </p>
          </div>
          <button
            onClick={methods.handleSubmit(onSubmit, () => {
              toast.error("Please fix all errors to proceed.");
              console.log(methods.formState.errors);
            })}
            disabled={methods.formState.isSubmitting}
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {methods.formState.isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <FiCheckCircle className="w-4 h-4" />
            )}
            Publish
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-10 relative z-10">
        <FormProvider {...methods}>
          <form className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="sticky top-28 space-y-2">
                {TABS.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  const isDone = currentTabIndex > idx;
                  const Icon = tab.icon;
                  // Extremely simple mock validation check: if there are ANY errors, show alert icon 
                  // on the tabs, ideally we would map specific fields but keeping it simple for UX
                  const hasError = Object.keys(errors).length > 0 && isActive;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={"w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all border outline-none " + 
                        (isActive 
                          ? "bg-violet-600/10 border-violet-500/30 shadow-[0_0_30px_rgba(124,58,237,0.1)]" 
                          : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.05]")
                      }
                    >
                      <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors " + 
                        (isActive ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]" : 
                         isDone ? "bg-white/[0.05] text-emerald-400" : "bg-white/[0.03] text-gray-500")
                      }>
                        {isDone && !isActive ? <FiCheckCircle size={18} /> : <Icon size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className={"text-[13px] font-bold " + (isActive ? "text-violet-200" : "text-gray-400")}>
                          {tab.label}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{tab.desc}</div>
                      </div>
                      {hasError && <FiAlertCircle className="text-red-400" size={16} />}
                    </button>
                  )
                })}

                <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-violet-600/5 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FiInfo className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300">Pro Tip</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Ensure your driver code accurately encapsulates the user's logic to prevent unintended runtime leaks during test execution.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/[0.015] border border-white/[0.04] rounded-3xl p-6 lg:p-10 shadow-2xl backdrop-blur-sm min-h-[600px] flex flex-col">
                
                {/* Dynamic Content Views */}
                <div className={activeTab === "basics" ? "block space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">Basic Information</h2>
                    <p className="text-xs text-gray-500">The core identity and metadata for this problem.</p>
                  </div>
                  <ProblemFoundation />
                </div>

                <div className={activeTab === "statement" ? "block space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">Problem Statement</h2>
                    <p className="text-xs text-gray-500">Draft an engaging and clear prompt using formatted Markdown.</p>
                  </div>
                  <ProblemStatement />
                </div>

                <div className={activeTab === "requirements" ? "block space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white mb-2">Constraints & Limits</h2>
                      <p className="text-xs text-gray-500">Define statistical bounds to instruct optimal time/space complexity logic.</p>
                    </div>
                    <ConstraintsSection />
                  </div>
                  
                  <div className="h-px w-full bg-white/[0.05]" />
                  
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white mb-2">Helpful Hints</h2>
                      <p className="text-xs text-gray-500">Offer incremental clues for struggling users (Optional).</p>
                    </div>
                    <HintsSection />
                  </div>
                </div>

                <div className={activeTab === "cases" ? "block space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white mb-2">Public Examples</h2>
                      <p className="text-xs text-gray-500">These will be directly displayed on the problem description page.</p>
                    </div>
                    <ExamplesSection />
                  </div>
                  
                  <div className="h-px w-full bg-white/[0.05]" />
                  
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white mb-2">Evaluation Test Cases</h2>
                      <p className="text-xs text-gray-500">Used strictly by the backend Judge0 compiler to verify logic accuracy.</p>
                    </div>
                    <TestCasesSection />
                  </div>
                </div>

                <div className={activeTab === "driver" ? "block space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">Compiler Driver Code</h2>
                    <p className="text-xs text-gray-500">Configure environments, starter templates, and dynamic solution wrappers per language.</p>
                  </div>
                  <DriverCodeSection />
                </div>

                {/* Bottom Navigation */}
                <div className="mt-auto pt-10 flex items-center justify-between">
                  {currentTabIndex > 0 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:text-white transition-all cursor-pointer"
                    >
                      <FiChevronLeft size={16} /> Previous
                    </button>
                  ) : (
                    <div /> // placeholder for spacing
                  )}

                  {currentTabIndex < TABS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 transition-all cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                    >
                      Next Step <FiChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={methods.handleSubmit(onSubmit, () => {
                        toast.error("Please fix all errors to proceed.");
                      })}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-white hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
                    >
                      <FiCheckCircle size={16} /> Finalize & Publish
                    </button>
                  )}
                </div>

              </div>
            </div>

          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default CreateProblem 