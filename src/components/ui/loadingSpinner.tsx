import { cn } from "@/lib/utils"

export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
  }
  
  export const LoadingSpinner = ({
    size = 24,
    className,
    ...props
  }: ISVGProps) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", className)}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    );
  };

  export interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
  }
  
  export const LoadingOverlay = ({
    isVisible,
    message = "Gerando sua resposta..."
  }: LoadingOverlayProps) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
          <LoadingSpinner size={48} className="text-green-500" />
          <p className="text-zinc-100 text-lg font-medium">{message}</p>
        </div>
      </div>
    );
  };