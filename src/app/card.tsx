// Simple replacement without shadcn/ui dependency
const Card = ({ children, className, ...props }) => {
    return (
      <div className={`bg-white rounded-lg border shadow-sm ${className}`} {...props}>
        {children}
      </div>
    );
  };
  
  const CardContent = ({ children, className, ...props }) => {
    return (
      <div className={`p-6 pt-0 ${className}`} {...props}>
        {children}
      </div>
    );
  };