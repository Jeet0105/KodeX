function FeatureCard({ icon, title, desc }) {
  return (
    <div>
      <div className="w-10 h-10 bg-purple-700/30 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="grid md:grid-cols-3 gap-10 px-8 max-w-6xl mx-auto py-16">
      <FeatureCard
        icon="⚡"
        title="Interactive Editor"
        desc="High-performance code execution with support for multiple languages and custom test cases."
      />
      <FeatureCard
        icon="📚"
        title="Curated Content"
        desc="Hand-picked problems categorized by difficulty and core algorithmic patterns."
      />
      <FeatureCard
        icon="📊"
        title="Visual Analytics"
        desc="Track your progress with detailed performance metrics and speed charts."
      />
    </section>
  );
}