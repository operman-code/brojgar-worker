import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 
                className="text-2xl font-bold text-primary cursor-pointer"
                onClick={() => setLocation('/')}
              >
                Brojgar Worker
              </h1>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <a href="#" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">
                Home
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                How it Works
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                About
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700 hover:text-primary font-medium">
              Login
            </Button>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-primary text-white hover:bg-blue-700 font-medium"
            >
              Get Started
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="text-gray-700" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
