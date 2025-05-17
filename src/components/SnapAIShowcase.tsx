
import React from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SnapAIShowcase = () => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-gradient-to-r from-slate-50 to-slate-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Instant Car Selling with SnapAI</h2>
            </div>
            <p className="text-lg text-gray-700">
              Selling your car has never been easier. Just take a photo, and our AI does the rest!
              No more lengthy forms to fill out or details to remember.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-700">
                <div className="rounded-full bg-primary/10 p-1">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>AI automatically identifies your car's make, model, and year</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="rounded-full bg-primary/10 p-1">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Save time with auto-filled listing details</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="rounded-full bg-primary/10 p-1">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Get your car in front of buyers in minutes, not days</span>
              </li>
            </ul>
            <Button 
              onClick={() => navigate("/snap-ai")}
              className="gap-2 mt-4"
              size="lg"
            >
              Try SnapAI Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10"></div>
            <img 
              src="/output.png" 
              alt="Car SnapAI Demo" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium z-20">
              SnapAI Technology
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SnapAIShowcase;
