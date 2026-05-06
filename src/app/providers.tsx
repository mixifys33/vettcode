'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState } from 'react';
import { CurrencyProvider } from '../utils/currency';
import { Toaster } from 'sonner';
import { ComparisonProvider } from '../hooks/useProductComparison';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 20,
          },
        },
      })
  );
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <ComparisonProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ComparisonProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default Providers;

