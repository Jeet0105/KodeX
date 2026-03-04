import { useFormContext } from "react-hook-form"
import { FiFileText, FiTag, FiBarChart2 } from "react-icons/fi"

function ProblemFoundation() {
  const { register } = useFormContext()

  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl space-y-6 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
          <FiFileText className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-white">Basic Information</h2>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">Problem Title</label>
          <input
            {...register("title", { required: true })}
            placeholder="e.g. Two Sum"
            className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-medium text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" /> Difficulty
            </label>
            <div className="relative">
              <select
                {...register("difficulty")}
                className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-medium text-white appearance-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="easy" className="bg-[#0F0820] text-green-400">Easy</option>
                <option value="medium" className="bg-[#0F0820] text-yellow-400">Medium</option>
                <option value="hard" className="bg-[#0F0820] text-red-400">Hard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <FiTag className="w-4 h-4" /> Topics
            </label>
            <input
              {...register("topics")}
              placeholder="e.g. array, hashmap, two pointers"
              className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-medium text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemFoundation