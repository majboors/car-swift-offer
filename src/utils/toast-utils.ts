
import { toast } from "@/hooks/use-toast";

export const showSuccessToast = (message: string) => {
  return toast({
    title: "Success",
    description: message,
    variant: "success",
    duration: 5000,
  });
};

export const showErrorToast = (message: string) => {
  // Log the error to console for debugging
  console.error(`Toast Error: ${message}`);
  
  return toast({
    title: "Error",
    description: message,
    variant: "destructive",
    duration: 7000,
  });
};

export const showListingCreationSuccess = (listingId: string) => {
  return toast({
    title: "Listing Created Successfully",
    description: "Your car has been listed successfully.",
    variant: "success",
    duration: 5000,
    action: {
      label: "View Listing",
      onClick: () => {
        window.location.href = `/listing/${listingId}`;
      },
    },
  });
};

export const showSnapAISuccess = (carDetails: { make: string; model: string; year: string | number }) => {
  return toast({
    title: "Car Identified Successfully",
    description: `We've identified your car as a ${carDetails.year} ${carDetails.make} ${carDetails.model}`,
    variant: "success",
    duration: 5000,
  });
};

export const showNetworkError = () => {
  return toast({
    title: "Network Connection Issue",
    description: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
    variant: "destructive",
    duration: 10000,
  });
};

// Specific toast for notification errors to avoid overwhelming the user
export const showNotificationError = () => {
  return toast({
    title: "Notification Error",
    description: "Unable to fetch your notifications. We'll try again automatically.",
    variant: "destructive",
    duration: 5000,
  });
};
