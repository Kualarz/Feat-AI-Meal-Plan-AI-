interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-6 py-2 rounded-pill font-body font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-safe:active:scale-95 transition-transform';

  const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm',
    secondary: 'bg-brand-orange-tint text-brand-orange hover:bg-brand-orange-tint/80',
    outline: 'border-2 border-border text-foreground hover:bg-muted font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
