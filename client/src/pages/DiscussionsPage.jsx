import { useState } from "react";
import DiscussionList from "../components/discussions/DiscussionList";
import DiscussionDetail from "../components/discussions/DiscussionDetail";
import CreateDiscussion from "../components/discussions/CreateDiscussion";

export default function DiscussionsPage() {
  const [discViewMode, setDiscViewMode] = useState("list"); // 'list', 'detail', 'create'
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);

  return (
    <div className="min-h-screen bg-[#080612] flex flex-col font-inter">
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col">
        <h1 className="text-3xl font-bold text-white mb-6 tracking-tight font-syne">
          Community Discussions
        </h1>
        
        <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col overflow-hidden">
          {discViewMode === "list" && (
            <DiscussionList 
              problemId={null} // null to fetch all
              onSelectDiscussion={(discId) => {
                setActiveDiscussionId(discId);
                setDiscViewMode("detail");
              }}
              onCreateNew={() => setDiscViewMode("create")}
            />
          )}
          {discViewMode === "detail" && (
            <DiscussionDetail 
              discussionId={activeDiscussionId} 
              onBack={() => setDiscViewMode("list")} 
            />
          )}
          {discViewMode === "create" && (
            <CreateDiscussion 
              problemId={null} 
              onBack={() => setDiscViewMode("list")}
              onCreated={() => setDiscViewMode("list")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
