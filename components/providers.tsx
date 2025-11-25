'use client';

import { SessionProvider } from 'next-auth/react';

import SessionLoader from './SessionLoader';

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <SessionProvider>
            <SessionLoader />
            {children}
        </SessionProvider>
    );
}
