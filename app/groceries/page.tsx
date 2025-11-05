import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Link from 'next/link';

export default function GroceriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Shopping List</h2>
            <Link href="/planner">
              <Button variant="outline">Back to Planner</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Shopping List Feature</h3>
            <p className="text-muted-foreground">
              This page will show your aggregated grocery list from your meal plans.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              The backend is ready, client component coming soon!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
