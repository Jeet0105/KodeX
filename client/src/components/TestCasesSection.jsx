import { useFieldArray, useFormContext } from "react-hook-form"
import { FiCheckSquare, FiTrash2, FiPlus, FiEyeOff } from "react-icons/fi"

function TestCasesSection() {
  const { control, register } = useFormContext()

  // Visible Testcases
  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: "visibleTestcases"
  })

  // Hidden Testcases
  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: "hiddenTestcases"
  })

  return (
    <div className="space-y-10">

      {/* ================= VISIBLE TESTCASES ================= */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl space-y-6 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <FiCheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Visible Testcases
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              These are shown when users click "Run Code".
            </p>
          </div>
        </div>

        <TestcaseList
          fields={visibleFields}
          append={appendVisible}
          remove={removeVisible}
          register={register}
          type="visibleTestcases"
          accent="emerald"
        />
      </div>

      {/* ================= HIDDEN TESTCASES ================= */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl space-y-6 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
            <FiEyeOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Hidden Testcases
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Used during submission for final evaluation. Not visible to users.
            </p>
          </div>
        </div>

        <TestcaseList
          fields={hiddenFields}
          append={appendHidden}
          remove={removeHidden}
          register={register}
          type="hiddenTestcases"
          accent="rose"
        />
      </div>
    </div>
  )
}

/* ================= REUSABLE COMPONENT ================= */

function TestcaseList({
  fields,
  append,
  remove,
  register,
  type,
  accent
}) {
  return (
    <div className="space-y-6">

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-black/20 border border-white/5 p-5 rounded-xl relative group"
        >
          <div className={`absolute -top-3 left-4 bg-[#0B0617] px-2 text-xs font-bold text-${accent}-500 border border-white/5 rounded-md`}>
            Testcase {index + 1}
          </div>

          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Remove testcase"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium ml-1">
                Input
              </label>
              <textarea
                {...register(`${type}.${index}.input`)}
                placeholder="Enter raw input exactly as judge will receive"
                rows={3}
                className={`w-full p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-200 placeholder:text-gray-700 focus:border-${accent}-500 focus:ring-1 focus:ring-${accent}-500 focus:outline-none transition-all resize-y`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium ml-1">
                Expected Output
              </label>
              <textarea
                {...register(`${type}.${index}.output`)}
                placeholder="Enter exact expected output"
                rows={3}
                className={`w-full p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-200 placeholder:text-gray-700 focus:border-${accent}-500 focus:ring-1 focus:ring-${accent}-500 focus:outline-none transition-all resize-y`}
              />
            </div>
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="text-center p-8 border border-dashed border-white/10 rounded-xl bg-black/10">
          <p className="text-gray-500 text-sm">
            No testcases added yet.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => append({ input: "", output: "" })}
        className={`w-full py-4 flex items-center justify-center gap-2 border border-dashed border-white/20 text-gray-400 hover:text-${accent}-400 hover:border-${accent}-500/50 hover:bg-${accent}-500/5 rounded-xl transition-all duration-300 font-medium`}
      >
        <FiPlus className="w-5 h-5" /> Add Testcase
      </button>
    </div>
  )
}

export default TestCasesSection