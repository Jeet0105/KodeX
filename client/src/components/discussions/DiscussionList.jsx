import { useState, useEffect } from "react";
import { FiMessageSquare, FiThumbsUp, FiUser, FiClock, FiPlus } from "react-icons/fi";
import api from "../../utils/api";

export default function DiscussionList({ problemId, onSelectDiscussion, onCreateNew }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      try {
        const query = problemId ? `?problemId=${problemId}` : "";
        const res = await api.get(`/api/v1/discussions${query}`);
        setData(res.data.discussions || []);
      } catch (err) {
        console.error("Failed to load discussions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [problemId]);

  if (loading) {
    return <div className="text-sm text-gray-500 text-center py-6">Loading discussions...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-gray-200">Discussions</h3>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition"
        >
          <FiPlus /> New Post
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-600 gap-3 border border-white/[0.06] rounded-xl bg-black/20">
          <FiMessageSquare className="w-8 h-8" />
          <div className="text-sm">No discussions yet. Be the first to start one!</div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto kx-scroll pr-1 pb-4">
          {data.map((disc) => (
            <div
              key={disc._id}
              onClick={() => onSelectDiscussion(disc._id)}
              className="p-4 rounded-xl border border-white/[0.06] bg-black/20 hover:bg-black/30 transition cursor-pointer flex flex-col gap-2"
            >
              <div className="text-[13px] font-semibold text-gray-200 line-clamp-1">
                {disc.title}
              </div>
              <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                {disc.content}
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-600 mt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FiUser /> {disc.author?.username || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1 text-green-500/70">
                    <FiThumbsUp /> {disc.upvotes?.length || 0}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400/80">
                    <FiMessageSquare /> {disc.commentCount || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock /> {new Date(disc.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
