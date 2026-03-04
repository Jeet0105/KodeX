import { useFormContext } from "react-hook-form"
import { FiCode, FiTerminal } from "react-icons/fi"

const languages = ["cpp", "java", "python", "javascript"]

const langColors = {
  cpp: "text-blue-500",
  java: "text-orange-500",
  python: "text-yellow-400",
  javascript: "text-yellow-300"
}

function DriverCodeSection() {
  const { register } = useFormContext()

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl space-y-6 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
          <FiTerminal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Driver Code</h2>
          <p className="text-gray-400 text-sm mt-1">Configure starter code and hidden wrapper logic for each language.</p>
        </div>
      </div>

      <div className="space-y-6">
        {languages.map((lang, index) => (
          <div key={lang} className="bg-black/20 border border-white/5 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FiCode className={langColors[lang] || "text-gray-400"} />
              <h3 className={`font-bold uppercase tracking-wider ${langColors[lang] || "text-gray-200"}`}>{lang}</h3>
            </div>

            <input
              type="hidden"
              value={lang}
              {...register(`driverCode.${index}.language`)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium ml-1">Starter Code (User sees this)</label>
                <textarea
                  {...register(`driverCode.${index}.starterCode`)}
                  placeholder={`// Starter code for ${lang}...`}
                  rows={6}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-300 placeholder:text-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium ml-1">Solution Wrapper (Hidden execution logic)</label>
                <textarea
                  {...register(`driverCode.${index}.solutionWrapper`)}
                  placeholder={`// Hidden wrapper for ${lang}...`}
                  rows={6}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-300 placeholder:text-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all resize-y"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs text-gray-400 font-medium ml-1 block mb-2">Main Function Name</label>
              <input
                type="text"
                {...register(`driverCode.${index}.functionName`)}
                placeholder="e.g. twoSum"
                className="w-full lg:w-1/2 p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-200 placeholder:text-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DriverCodeSection