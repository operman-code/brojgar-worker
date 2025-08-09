import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { HardHat, Building, CheckCircle, Briefcase, Star } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleUserTypeSelection = (userType: 'worker' | 'business') => {
    setLocation(`/register/${userType}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Connect Local Workers with Small Businesses
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Find skilled workers for your business or discover job opportunities in your area
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleUserTypeSelection('worker')}
                className="bg-white text-primary px-8 py-4 h-auto text-lg font-semibold hover:bg-gray-100"
              >
                <HardHat className="mr-2" />
                Find Work
              </Button>
              <Button 
                onClick={() => handleUserTypeSelection('business')}
                className="bg-secondary text-white px-8 py-4 h-auto text-lg font-semibold hover:bg-emerald-600"
              >
                <Building className="mr-2" />
                Hire Workers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How Brojgar Worker Works
          </h3>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Workers */}
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <HardHat className="text-primary text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900">For Workers</h4>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Register with your skills and location
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Browse jobs in your area
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Pay ₹20 to unlock full job details
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Connect directly with employers
                </li>
              </ul>
            </div>
            
            {/* For Businesses */}
            <div className="text-center">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-secondary text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900">For Businesses</h4>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Post jobs for free
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Boost posts for ₹100 (30 workers)
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Filter by location and skills
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Manage applications easily
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
