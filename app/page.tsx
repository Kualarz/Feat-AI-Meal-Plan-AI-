import Link from 'next/link';
import { Button } from '@/components/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Plan SEA-friendly meals with AI
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Get personalized 7-day meal plans featuring authentic Cambodian, Thai, and Vietnamese cuisine.
            Powered by AI, tailored to your dietary needs and budget.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/setup">
              <Button variant="primary">Get Started</Button>
            </Link>
            <Link href="/recipes">
              <Button variant="outline">Browse Recipes</Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <div className="text-4xl mb-4">🍜</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              SEA-Authentic Recipes
            </h3>
            <p className="text-slate-600">
              Cambodian, Thai, and Vietnamese home-cooking with locally available ingredients
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              AI-Powered Planning
            </h3>
            <p className="text-slate-600">
              Personalized meal plans that respect your dietary preferences, allergens, and budget
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Smart Grocery Lists
            </h3>
            <p className="text-slate-600">
              Automatically grouped shopping lists organized by market sections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
