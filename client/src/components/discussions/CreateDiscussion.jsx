import { useState } from "react";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import api from "../../utils/api";

export default function CreateDiscussion({ problemId, onBack, onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = { title, content };
      if (problemId) payload.problemId = problemId;

      await api.post("/api/v1/discussions", payload);
      onCreated();
    } catch (err) {
      console.error("Create discussion failed", err);
      setError(err.response?.data?.message || "Failed to create discussion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white mb-4 transition w-fit"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="flex-1 overflow-y-auto kx-scroll pr-2 pb-4">
        <h3 className="text-[16px] font-bold text-white mb-4">Start a New Discussion</h3>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., O(N) DP approach explanation"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600 outline-none focus:border-violet-500/50 transition"
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description / Query</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your approach, issue, or question in detail..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-white placeholder-gray-600 outline-none focus:border-violet-500/50 transition resize-none min-h-[160px]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl transition"
            >
              {submitting ? "Posting..." : "Post Discussion"} <FiSend className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
