import { Music, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-8 px-4 md:px-6 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-creator-orange rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">RiseUp</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering creators and connecting music lovers worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/browse" className="text-gray-400 hover:text-white transition-colors">Browse Music</a></li>
              <li><a href="/shop" className="text-gray-400 hover:text-white transition-colors">Creator Shop</a></li>
              <li><a href="/library" className="text-gray-400 hover:text-white transition-colors">Your Library</a></li>
            </ul>
          </div>

          {/* For Creators */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">For Creators</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/creator-dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Upload Music</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Analytics</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} RiseUp Creators. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500" /> for creators
          </p>
        </div>
      </div>
    </footer>
  );
}