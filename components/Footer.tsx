export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Feast AI. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/setup" className="hover:text-primary transition">Preferences</a>
          <a href="/recipes" className="hover:text-primary transition">Recipes</a>
        </div>
      </div>
    </footer>
  );
}
