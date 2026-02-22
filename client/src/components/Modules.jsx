function ModuleCard({ title, problems, progress }) {
  return (
    <div className="bg-[#120A24] p-6 rounded-2xl border border-purple-900/40 hover:border-purple-600 transition">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-xs text-gray-400 mb-4">{problems} Problems</p>

      <div className="w-full bg-gray-800 h-2 rounded-full">
        <div
          className="bg-purple-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2">{progress}% Progress</p>
    </div>
  );
}

export default function Modules() {
  return (
    <section className="px-8 max-w-6xl mx-auto py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Master Every Concept</h2>
        <button className="text-purple-400 text-sm hover:underline">
          Browse All Modules →
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <ModuleCard title="Arrays & Strings" problems={120} progress={65} />
        <ModuleCard title="Trees & Graphs" problems={85} progress={40} />
        <ModuleCard title="Dynamic Programming" problems={70} progress={25} />
        <ModuleCard title="Advanced Data Structures" problems={50} progress={10} />
      </div>
    </section>
  );
}