
interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => {
  return (
    <div className="bg-destructive/15 p-4 rounded-md mb-4 text-destructive">
      <p className="font-medium">Error: {message}</p>
      <p className="text-sm mt-1">Please try refreshing or check your authentication status</p>
    </div>
  );
};
