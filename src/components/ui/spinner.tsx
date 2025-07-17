import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner = ({ size = "md", className }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
        sizeClasses[size],
        className,
      )}
    />
  );
};

export const LoadingScreen = ({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-background flex items-center justify-center",
        className,
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
