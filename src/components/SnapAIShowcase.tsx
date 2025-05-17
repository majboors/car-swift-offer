import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SnapAIShowcaseProps {
  onCapture?: (imgSrc: string) => void;
}

const SnapAIShowcase = ({ onCapture }: SnapAIShowcaseProps = {}) => {
  const navigate = useNavigate();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const activateCamera = async () => {
    if (!onCapture) {
      // If no onCapture prop, just navigate to snap-ai page
      navigate("/snap-ai");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && onCapture) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      context?.drawImage(
        videoRef.current, 
        0, 
        0, 
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );
      
      const imgData = canvasRef.current.toDataURL('image/png');
      onCapture(imgData);
      
      // Stop the camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    }
  };
  
  // If being used as camera component
  if (onCapture) {
    return (
      <div className="w-full">
        {isCameraActive ? (
          <div className="relative rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button onClick={captureImage} variant="secondary">Take Photo</Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="bg-slate-100 p-8 rounded-lg flex flex-col items-center border border-dashed border-slate-300">
            <Camera className="h-12 w-12 text-slate-400 mb-4" />
            <p className="mb-4 text-slate-600 text-center">Point your camera at your car to identify it</p>
            <Button onClick={activateCamera}>Activate Camera</Button>
          </div>
        )}
      </div>
    );
  }
  
  // Otherwise render the promotional showcase
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
