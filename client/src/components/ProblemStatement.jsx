import { useFormContext } from "react-hook-form"
import { FiAlignLeft } from "react-icons/fi"

function ProblemStatement() {
  const { register } = useFormContext()

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl space-y-6 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
          <FiAlignLeft className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-white">Problem Details</h2>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
          <textarea
            {...register("description", { required: true })}
            rows={8}
            placeholder="Write the full problem description here... Feel free to use markdown-like formatting."
            className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-medium text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-all resize-y"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">Editorial / Notes (Optional)</label>
          <textarea
            {...register("editorial")}
            rows={4}
            placeholder="Approach, intuition, or author notes..."
            className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-medium text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-all resize-y"
          />
        </div>
      </div>
    </div>
  )
}

export default ProblemStatement