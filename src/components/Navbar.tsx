import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-8 md:px-16 lg:px-20 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-red-600 text-3xl font-black tracking-tight">STREAMIX</h1>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="text-white hover:text-gray-300 transition-colors font-medium">
              Home
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              TV Shows
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Movies
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              New & Popular
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              My List
            </a>
          </div>

          <button className="md:hidden flex items-center gap-1 text-white text-sm">
            Browse
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-white hover:text-gray-300 transition-colors" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="text-white hover:text-gray-300 transition-colors" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <button className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <User size={18} />
            </div>
            <ChevronDown size={16} className="hidden md:block" />
          </button>
        </div>
      </div>
    </nav>
  );
}
