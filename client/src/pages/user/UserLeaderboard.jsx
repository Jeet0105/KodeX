import { useState, useEffect } from "react";
import { FiAward, FiTrendingUp, FiZap } from "react-icons/fi";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function UserLeaderboard() {
  const { user } = useSelector((state) => state.user);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/api/v1/users/leaderboard?limit=50");
        setLeaderboard(res.data.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      case 2:
        return "bg-gray-300/10 text-gray-300 border-gray-300/50 shadow-[0_0_15px_rgba(209,213,219,0.2)]";
      case 3:
        return "bg-orange-700/10 text-orange-600 border-orange-700/50 shadow-[0_0_15px_rgba(194,65,12,0.2)]";
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
            <FiAward size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
            Global Leaderboard
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Compete with peers, earn XP, and secure your spot at the top.
        </p>
      </div>

      {/* Podium (Top 3) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-4 items-end">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 bg-[#140A2A]/80 backdrop-blur-md rounded-2xl p-6 border border-gray-300/30 flex flex-col items-center gap-4 relative transform hover:-translate-y-2 transition-all">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-900 font-bold text-sm shadow-lg shadow-gray-300/50">2</div>
            <img src={leaderboard[1].avatarUrl || `https://ui-avatars.com/api/?name=${leaderboard[1].username}&background=random`} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-gray-300/50 object-cover" />
            <div className="text-center">
              <h3 className="font-bold text-white capitalize">{leaderboard[1].username}</h3>
              <p className="text-xs text-violet-400 font-medium">Level {leaderboard[1].level}</p>
            </div>
            <div className="w-full bg-white/5 rounded-xl p-3 flex justify-between items-center text-sm">
               <span className="text-gray-400">Points</span>
               <span className="font-bold text-gray-300">{leaderboard[1].totalPoints}</span>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="order-1 md:order-2 bg-gradient-to-t from-[#1A0F2E] to-[#140A2A] backdrop-blur-md rounded-2xl p-8 border-2 border-amber-500/50 flex flex-col items-center gap-4 relative transform md:-translate-y-8 hover:-translate-y-10 transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-amber-900 font-bold text-lg shadow-lg shadow-amber-500/50">1</div>
            <img src={leaderboard[0].avatarUrl || `https://ui-avatars.com/api/?name=${leaderboard[0].username}&background=random`} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-amber-500 object-cover shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white capitalize">{leaderboard[0].username}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                 <FiZap size={14} className="text-amber-500" />
                 <p className="text-sm text-amber-500 font-bold">Level {leaderboard[0].level}</p>
              </div>
            </div>
            <div className="w-full bg-amber-500/10 rounded-xl p-4 flex justify-between items-center mt-2">
               <span className="text-amber-500/80 font-medium tracking-wide text-sm">TOTAL XP</span>
               <span className="font-black text-amber-500 text-xl">{leaderboard[0].totalPoints}</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="order-3 md:order-3 bg-[#140A2A]/80 backdrop-blur-md rounded-2xl p-6 border border-orange-700/30 flex flex-col items-center gap-4 relative transform hover:-translate-y-2 transition-all">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-orange-100 font-bold text-sm shadow-lg shadow-orange-600/50">3</div>
            <img src={leaderboard[2].avatarUrl || `https://ui-avatars.com/api/?name=${leaderboard[2].username}&background=random`} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-orange-700/50 object-cover" />
            <div className="text-center">
              <h3 className="font-bold text-white capitalize">{leaderboard[2].username}</h3>
              <p className="text-xs text-violet-400 font-medium">Level {leaderboard[2].level}</p>
            </div>
            <div className="w-full bg-white/5 rounded-xl p-3 flex justify-between items-center text-sm">
               <span className="text-gray-400">Points</span>
               <span className="font-bold text-orange-500">{leaderboard[2].totalPoints}</span>
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="bg-[#140A2A]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/[0.06] font-medium text-gray-500 text-sm tracking-wider uppercase bg-white/[0.02]">
           <div className="col-span-2 md:col-span-1 text-center">Rank</div>
           <div className="col-span-6 md:col-span-5">Coder</div>
           <div className="col-span-4 md:col-span-3 text-center">Level</div>
           <div className="col-span-hidden md:col-span-3 text-right hidden md:block">Total Points</div>
        </div>
        
        <div className="divide-y divide-white/[0.04]">
          {leaderboard.map((u, index) => (
             <div 
                key={u._id} 
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-white/[0.02] ${u._id === user?._id ? "bg-violet-900/20" : ""}`}
             >
                <div className="col-span-2 md:col-span-1 flex justify-center">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${getRankStyle(index + 1)}`}>
                     {index + 1}
                   </div>
                </div>
                
                <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                   <img 
                     src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                     alt="avatar" 
                     className="w-10 h-10 rounded-full object-cover border border-white/10"
                   />
                   <div className="flex flex-col">
                      <span className="font-semibold text-gray-200 capitalize">{u.username}</span>
                      {u._id === user?._id && <span className="text-[10px] text-violet-400 tracking-wider">YOU</span>}
                   </div>
                </div>
                
                <div className="col-span-4 md:col-span-3 flex justify-center items-center gap-1.5 text-gray-400">
                    <FiTrendingUp className="text-violet-500/70" size={14} />
                    <span className="font-mono text-sm">{u.level}</span>
                </div>

                <div className="col-span-hidden md:col-span-3 text-right hidden md:flex justify-end items-center text-white font-mono font-bold">
                   <span className="bg-white/5 py-1 px-3 rounded-lg border border-white/5">{u.totalPoints} <span className="text-gray-500 font-medium text-xs ml-1">XP</span></span>
                </div>
             </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No leader data found. Start solving challenges!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
