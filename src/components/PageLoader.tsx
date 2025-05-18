
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Shield } from "lucide-react";

interface PageLoaderProps {
  onLoaded: () => void;
}

const PageLoader: React.FC<PageLoaderProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  
  // Critical images to preload
  const criticalImages = [
    "/output.png", // Hero background
    "/hero-image.png", // Instant Offer background
    "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png", // Car images
    "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png",
    "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png",
    "/lovable-uploads/718f76b2-f919-4358-94d5-81148a0d1815.png",
    "/lovable-uploads/07920f46-b9e4-4757-9140-0e1f710cc9c8.png",
  ];
  
  useEffect(() => {
    // Set total images count
    setTotalImages(criticalImages.length);
    
    // Preload images
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newCount = prev + 1;
          // Calculate progress percentage
          const newProgress = Math.round((newCount / criticalImages.length) * 100);
          setProgress(newProgress);
          
          // If all images are loaded, wait a moment then call onLoaded
          if (newCount >= criticalImages.length) {
            // Add a slight delay to show 100% progress
            setTimeout(() => {
              onLoaded();
            }, 500);
          }
          return newCount;
        });
      };
      
      // Handle image load errors
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        setImagesLoaded(prev => {
          const newCount = prev + 1;
          const newProgress = Math.round((newCount / criticalImages.length) * 100);
          setProgress(newProgress);
          
          if (newCount >= criticalImages.length) {
            setTimeout(() => {
              onLoaded();
            }, 500);
          }
          return newCount;
        });
      };
    });
    
    // Fallback to ensure the site loads even if images fail
    const fallbackTimer = setTimeout(() => {
      if (progress < 100) {
        console.log("Fallback loader timeout triggered");
        setProgress(100);
        onLoaded();
      }
    }, 8000); // 8 second fallback
    
    return () => clearTimeout(fallbackTimer);
  }, [onLoaded]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="flex items-center justify-center mb-8">
        <Shield className="w-16 h-16 mr-4 text-[#007ac8]" />
        <h1 className="text-4xl md:text-5xl font-bold">Snap My Car AI</h1>
      </div>
      
      <div className="w-64 mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      
      <p className="text-sm text-gray-600">
        Loading {imagesLoaded} of {totalImages} assets ({progress}%)
      </p>
    </div>
  );
};

export default PageLoader;
