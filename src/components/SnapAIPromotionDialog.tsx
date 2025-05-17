
import React, { useState, useEffect } from "react";
import { Camera, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SnapAIPromotionDialog = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show the dialog when component mounts, with a slight delay for better UX
    const timer = setTimeout(() => {
      setOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToSnapAI = () => {
    setOpen(false);
    navigate("/snap-ai");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Camera className="h-6 w-6 text-primary" /> Instant Car Selling with AI
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Sell your car in minutes with just a photo! Our AI technology identifies your car's
            details automatically, making selling faster and easier than ever.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="rounded-md bg-muted p-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 rounded-full bg-primary p-1">
                  <svg
                    className="h-3 w-3 text-primary-foreground"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Snap a photo of your car</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 rounded-full bg-primary p-1">
                  <svg
                    className="h-3 w-3 text-primary-foreground"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>AI instantly identifies make, model, and year</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 rounded-full bg-primary p-1">
                  <svg
                    className="h-3 w-3 text-primary-foreground"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Get offers within hours</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={handleNavigateToSnapAI}
            >
              Try SnapAI Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SnapAIPromotionDialog;
