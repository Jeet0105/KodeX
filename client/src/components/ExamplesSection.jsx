import { useFormContext, useFieldArray } from "react-hook-form"
import { FiTrash2, FiPlus, FiList } from "react-icons/fi"

function ExamplesSection() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: "examples" })

  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl h-full flex flex-col hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <FiList className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">Examples</h2>
      </div>

      <div className="space-y-6 flex-grow mb-6">
        {fields.map((field, i) => (
          <div key={field.id} className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-4 group relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Example {i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                title="Remove example"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Input Format</label>
                <textarea
                  {...register(`examples.${i}.input`)}
                  placeholder="nums = [2,7,11,15], target = 9"
                  rows={2}
                  className="w-full p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-gray-300 placeholder:text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Output Format</label>
                <textarea
                  {...register(`examples.${i}.output`)}
                  placeholder="[0,1]"
                  rows={2}
                  className="w-full p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-gray-300 placeholder:text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Explanation (Optional)</label>
              <textarea
                {...register(`examples.${i}.explanation`)}
                placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                rows={2}
                className="w-full p-3 bg-black/40 border border-white/5 rounded-lg text-sm text-gray-300 placeholder:text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-y"
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-center p-8 border border-dashed border-white/10 rounded-xl bg-black/10">
            <p className="text-gray-500 text-sm">Add at least one example to help users understand.</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => append({ input: "", output: "", explanation: "" })}
        className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/20 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl transition-all duration-300 font-medium"
      >
        <FiPlus className="w-4 h-4" /> Add Example
      </button>
    </section>
  )
}

export default ExamplesSection