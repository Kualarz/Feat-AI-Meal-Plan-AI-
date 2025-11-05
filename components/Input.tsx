interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
