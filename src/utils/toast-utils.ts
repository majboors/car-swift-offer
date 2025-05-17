
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const showSuccessToast = (message: string) => {
  return toast({
    title: "Success",
    description: message,
    variant: "success",
    duration: 5000,
  });
};

export const showErrorToast = (message: string) => {
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
