interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm ${className}`}>
      {children}
    </div>
  );
}
