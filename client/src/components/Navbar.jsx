import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

export default function Navbar() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const handleSignIn = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  }
  return (
    <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-purple-600 rounded-md" /> {/* Logo Placeholder */}
        <span className="font-semibold text-lg">Kode<span className="text-purple-600 font-bold text-xl">X</span></span>
      </div>

      <nav className="hidden md:flex gap-8 text-sm text-gray-300">
        <a href="#" className="hover:text-white">Problems</a>
        <a href="#" className="hover:text-white">Topics</a>
        <a href="#" className="hover:text-white">Dashboard</a>
      </nav>

      <div className="flex items-center gap-4">
        <button onClick={handleSignIn} className="text-gray-300 hover:text-white text-sm cursor-pointer">
          {user ? 
           <img src={user?.avatarUrl} alt="User Avatar" className="w-6 h-6 rounded-full" />
           : "Sign In"}
        </button>
        <button onClick={handleSignIn} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
          Get Started
        </button>
      </div>
    </header>
  );
}