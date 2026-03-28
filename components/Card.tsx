interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-card text-card-foreground rounded-large-card p-6 border border-border/80 shadow-sm transition-all font-body ${className}`}>
      {children}
    </div>
  );
}
