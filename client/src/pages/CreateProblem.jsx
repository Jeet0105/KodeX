import { useForm, FormProvider } from "react-hook-form"
import { toast } from "react-toastify"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"
import { FiCheckCircle } from "react-icons/fi"
import { zodResolver } from "@hookform/resolvers/zod"
import { problemSchema } from "../schemas/problemSchema.js"

import ProblemFoundation from "../components/ProblemFoundation"
import ConstraintsSection from "../components/ConstraintsSection"
import ExamplesSection from "../components/ExamplesSection"
import HintsSection from "../components/HintsSection"
import TestCasesSection from "../components/TestCasesSection"
import DriverCodeSection from "../components/DriverCodeSection"
import ProblemStatement from "../components/ProblemStatement"

function CreateProblem() {
  const navigate = useNavigate()

  const methods = useForm({
    // resolver: zodResolver(problemSchema),
    // mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      topics: "",
      constraints: [""],
      examples: [{ input: "", output: "", explanation: "" }],
      hints: [""],
      editorial: "",
      visibleTestcases: [{ input: "", output: "" }],
      hiddenTestcases: [{ input: "", output: "" }],
      driverCode: [
        { language: "cpp", judge0LanguageId: 54, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 },
        { language: "java", judge0LanguageId: 62, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 },
        { language: "python", judge0LanguageId: 71, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 },
        { language: "javascript", judge0LanguageId: 63, starterCode: "", solutionWrapper: "", functionName: "", timeLimit: 2, memoryLimit: 128000 }
      ]
    }
  })

  const onSubmit = async (data) => {
    try {
      // Transform topics string → array
      const payload = {
        ...data,
        topics: data.topics
          ? data.topics
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)
          : []
      }

      // Debug: See exactly what is being sent
      console.log("Final Payload:", payload)

      // API call
      const response = await api.post("/api/v1/problems", payload)

      // Debug: Backend response
      console.log("Server Response:", response.data)

      toast.success("Problem created successfully 🚀")

      // Optional: redirect after success
      // navigate("/admin/problems")

    } catch (err) {
      console.log("Full Error Object:", err)

      if (err.response) {
        console.log("Backend Error Data:", err.response.data)
        console.log("Status Code:", err.response.status)
      }

      toast.error(
        err.response?.data?.message || "Failed to create problem"
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0617] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-10 text-center md:text-left space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
            Create DSA Problem
          </h1>
          <p className="text-gray-400 text-lg">Design and publish a new challenge for the platform.</p>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(
              onSubmit,
              (errors) => {
                console.log("Validation Errors:", errors)
              }
            )}
            className="space-y-8"
          >
            <ProblemFoundation />
            <ProblemStatement />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <ConstraintsSection />
                <HintsSection />
              </div>
              <ExamplesSection />
            </div>

            <TestCasesSection />
            <DriverCodeSection />

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                // onClick={onSubmit}
                //disabled={!methods.formState.isValid || methods.formState.isSubmitting}
                className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
              >
                {methods.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </div>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Publish Problem</span>
                  </>
                )}
                {/* Button Glow Effect */}
                <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 ring-offset-2 ring-offset-[#0B0617] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default CreateProblem