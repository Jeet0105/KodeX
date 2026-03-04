import { useFormContext, useFieldArray } from "react-hook-form"
import { FiMinusCircle, FiPlus, FiAlertTriangle } from "react-icons/fi"

function ConstraintsSection() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: "constraints" })

  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl h-full flex flex-col hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
          <FiAlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">Constraints</h2>
      </div>

      <div className="space-y-4 flex-grow mb-6">
        {fields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-3 group">
            <input
              {...register(`constraints.${i}`)}
              placeholder="e.g. 1 <= nums.length <= 10^4"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-yellow-100 placeholder:text-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
              title="Remove constraint"
            >
              <FiMinusCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-gray-500 italic text-sm text-center py-4">No constraints added.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => append("")}
        className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/20 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-500/5 rounded-xl transition-all duration-300 font-medium"
      >
        <FiPlus className="w-4 h-4" /> Add Constraint
      </button>
    </section>
  )
}

export default ConstraintsSection