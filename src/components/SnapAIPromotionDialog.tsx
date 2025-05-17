
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SnapAIPromotionDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we've shown this dialog before
    const hasShownPromotionDialog = localStorage.getItem('hasShownSnapAIPromotionDialog');
    
    // Only show after 10 seconds and if not previously shown in this session
    if (!hasShownPromotionDialog) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasShownSnapAIPromotionDialog', 'true');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Try SnapAI - Instant Car Recognition</DialogTitle>
          <DialogDescription>
            Take a photo of any car and our AI will tell you exactly what it is. Identify any car in seconds!
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <img 
            src="/lovable-uploads/001a79b1-6139-4ce7-8712-fe6057917e38.png" 
            alt="SnapAI Demo" 
            className="w-full h-auto rounded-lg"
          />
          <div className="flex flex-col space-y-2 justify-center">
            <h4 className="font-medium">Benefits:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Instant car identification</li>
              <li>Get car specs immediately</li>
              <li>Compare against similar models</li>
              <li>Free to use!</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Maybe Later
          </Button>
          
          {/* Fixed Button by using Link component correctly */}
          <Link to="/snap-ai" onClick={() => setIsOpen(false)}>
            <Button>
              Try SnapAI
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SnapAIPromotionDialog;
