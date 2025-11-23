'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            // Clear any existing timeout
            clearTimeout(timeoutId);

            // Debounce scroll event for better performance
            timeoutId = setTimeout(() => {
                const scrolled = window.pageYOffset || document.documentElement.scrollTop;
                setIsVisible(scrolled > 500);
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Check initial state
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#1890FF',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
                e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1890FF';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
        </button>
    );
}
