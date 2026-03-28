interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-input font-body focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
