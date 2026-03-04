import { useFormContext, useFieldArray } from "react-hook-form"
import { FiMinusCircle, FiPlus, FiHelpCircle } from "react-icons/fi"

function HintsSection() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: "hints" })

  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl h-full flex flex-col hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <FiHelpCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">Hints</h2>
      </div>

      <div className="space-y-4 flex-grow mb-6">
        {fields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-3 group">
            <span className="text-xs font-bold text-blue-400 opacity-50 w-5">#{i + 1}</span>
            <input
              {...register(`hints.${i}`)}
              placeholder="e.g. Try using a hash map to store seen values"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-sm text-blue-50 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
              title="Remove hint"
            >
              <FiMinusCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-gray-500 italic text-sm text-center py-4">No hints added.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => append("")}
        className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/20 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl transition-all duration-300 font-medium"
      >
        <FiPlus className="w-4 h-4" /> Add Hint
      </button>
    </section>
  )
}

export default HintsSection