'use client';

import { useSession } from 'next-auth/react';
import CommonLoader from './CommonLoader';
export default function SessionLoader() {
    const { status } = useSession();
    if (status === 'loading') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(5px)'
            }}>
                <CommonLoader size="40" color="#1890FF" text="Loading..." />
            </div>
        );
    }

    return null;
}
