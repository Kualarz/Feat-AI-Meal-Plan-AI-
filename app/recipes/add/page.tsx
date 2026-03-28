'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddRecipeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/recipes?add=true');
  }, [router]);
  return null;
}
