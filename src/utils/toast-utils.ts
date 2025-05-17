
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
