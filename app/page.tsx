'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified setup page
    router.push('/setup');
  }, [router]);

  return (
    <div className="min-h-screen bg-background-primary text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to AI Setup Support Forge...</p>
      </div>
    </div>
  );
}
