import { useState, useEffect } from "react";
import { FiArrowLeft, FiUser, FiClock, FiThumbsUp, FiThumbsDown, FiSend } from "react-icons/fi";
import api from "../../utils/api";

export default function DiscussionDetail({ discussionId, onBack }) {
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [discRes, commentsRes] = await Promise.all([
          api.get(`/api/v1/discussions/${discussionId}`),
          api.get(`/api/v1/discussions/${discussionId}/comments`),
        ]);
        setDiscussion(discRes.data.discussion);
        setComments(commentsRes.data.comments || []);
      } catch (err) {
        console.error("Failed to load discussion details", err);
      } finally {
        setLoading(false);
      }
    };
    if (discussionId) fetchDetail();
  }, [discussionId]);

  const handleVoteDiscussion = async (action) => {
    try {
      const res = await api.post(`/api/v1/discussions/${discussionId}/vote`, { action });
      setDiscussion(res.data.discussion);
      // Note: To keep UI fully in sync with author populated, we might need a re-fetch or manual merge
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  const handleVoteComment = async (commentId, action) => {
    try {
      const res = await api.post(`/api/v1/discussions/${discussionId}/comments/${commentId}/vote`, { action });
      setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, ...res.data.comment, author: c.author } : c)));
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/v1/discussions/${discussionId}/comments`, { content: newComment });
      setComments([...comments, res.data.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500 text-center py-6">Loading discussion...</div>;
  }

  if (!discussion) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white mb-4 transition w-fit"
      >
        <FiArrowLeft /> Back to Discussions
      </button>

      <div className="overflow-y-auto kx-scroll pr-2 flex-1 pb-4 flex flex-col space-y-5 relative">
        {/* Discussion Post */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            {discussion.author?.avatarUrl ? (
              <img src={discussion.author.avatarUrl} alt="author" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                {discussion.author?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <div className="text-[13px] text-gray-200 font-semibold">{discussion.author?.username}</div>
              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                <FiClock /> {new Date(discussion.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <h2 className="text-[16px] font-bold text-white mb-2 leading-tight">{discussion.title}</h2>
          <div className="text-[13px] text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
            {discussion.content}
          </div>

          {/* Voting Actions */}
          <div className="flex items-center gap-4 text-[12px]">
            <button
              onClick={() => handleVoteDiscussion('upvote')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition"
            >
              <FiThumbsUp /> {discussion.upvotes?.length || 0}
            </button>
            <button
              onClick={() => handleVoteDiscussion('downvote')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition"
            >
              <FiThumbsDown /> {discussion.downvotes?.length || 0}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col">
          <div className="text-[13px] font-bold text-gray-300 tracking-wide uppercase mb-3">
            Replies ({comments.length})
          </div>

          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <div key={comment._id} className="border-l-2 border-white/[0.08] pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-gray-300">
                    {comment.author?.username}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[12px] text-gray-400 whitespace-pre-wrap mb-2">
                  {comment.content}
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <button onClick={() => handleVoteComment(comment._id, 'upvote')} className="flex items-center gap-1 text-gray-500 hover:text-green-400 transition">
                    <FiThumbsUp /> {comment.upvotes?.length || 0}
                  </button>
                  <button onClick={() => handleVoteComment(comment._id, 'downvote')} className="flex items-center gap-1 text-gray-500 hover:text-red-400 transition">
                    <FiThumbsDown /> {comment.downvotes?.length || 0}
                  </button>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-xs text-gray-600 italic">No replies yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={submitComment} className="mt-auto pt-3 border-t border-white/[0.06] shrink-0 pb-1 relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a reply..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 pl-4 pr-12 text-[13px] text-white placeholder-gray-600 resize-none outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition scrollbar-hide flex items-center"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submitComment(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="absolute right-3 bottom-[18px] p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition"
        >
          <FiSend className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
