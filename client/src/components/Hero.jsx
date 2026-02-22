export default function Hero() {
  return (
    <section className="text-center py-24 px-6 max-w-4xl mx-auto">
      <span className="text-xs tracking-widest text-purple-400 bg-purple-900/30 px-4 py-1 rounded-full">
        NEW ADVANCED DSA ALGORITHMS MODULE
      </span>

      <h1 className="mt-8 text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        Master Data <br />
        Structures <br />
        & Algorithms
      </h1>

      <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
        The most intuitive platform to ace your technical interviews.
        Real-time judge, curated learning paths, and deep analytics.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-medium shadow-lg shadow-purple-900/40 cursor-pointer">
          Start Practicing →
        </button>

        <button className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-xl font-medium text-gray-300 cursor-pointer">
          Explore Topics
        </button>
      </div>
    </section>
  );
}