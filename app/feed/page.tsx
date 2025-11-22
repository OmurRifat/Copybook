'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import ScrollToTop from '@/components/ScrollToTop';

export default function FeedPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Fetch initial posts
    useEffect(() => {
        if (status === 'authenticated') {
            fetchPosts(true);
        }
    }, [status]);

    const fetchPosts = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const url = new URL('/api/posts', window.location.origin);
            url.searchParams.set('limit', '10');
            if (!isInitial && nextCursor) {
                url.searchParams.set('cursor', nextCursor);
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();

            if (isInitial) {
                setPosts(data.posts || []);
            } else {
                setPosts(prev => [...prev, ...(data.posts || [])]);
            }

            setHasMore(data.hasMore || false);
            setNextCursor(data.nextCursor || null);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [nextCursor]);

    // Set up Intersection Observer for infinite scroll
    useEffect(() => {
        if (!hasMore || loadingMore) return;

        const options = {
            root: null, // Will observe within viewport
            rootMargin: '200px', // Trigger 200px before reaching sentinel
            threshold: 0.1
        };

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                fetchPosts(false);
            }
        }, options);

        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, fetchPosts]);

    // Handle new post creation
    const handleNewPost = () => {
        fetchPosts(true); // Refresh feed
    };

    if (status === 'loading' || loading) {
        return (
            <div className="_layout _layout_main_wrapper">
                <div className="_main_layout">
                    <Header />
                    <div className="container _custom_container">
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="_layout _layout_main_wrapper">
            {/* Switching Btn Start */}
            <div className="_layout_mode_swithing_btn">
                <button type="button" className="_layout_swithing_btn_link">
                    <div className="_layout_swithing_btn">
                        <div className="_layout_swithing_btn_round"></div>
                    </div>
                    <div className="_layout_change_btn_ic1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
                            <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z" />
                        </svg>
                    </div>
                    <div className="_layout_change_btn_ic2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
                            <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05" />
                        </svg>
                    </div>
                </button>
            </div>
            {/* Switching Btn End */}

            <div className="_main_layout">
                {/* Header */}
                <Header />

                {/* Main Layout Structure */}
                <div className="container _custom_container">
                    <div className="_layout_inner_wrap">
                        <div className="row">
                            {/* Left Sidebar */}
                            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                                <LeftSidebar />
                            </div>

                            {/* Middle Feed */}
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <div className="_layout_middle_wrap">
                                    <div className="_layout_middle_inner">
                                        {/* Stories Section - Desktop */}
                                        <div className="_feed_inner_ppl_card _mar_b16">
                                            <div className="_feed_inner_story_arrow">
                                                <button type="button" className="_feed_inner_story_arrow_btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                                                        <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                                                    <div className="_feed_inner_profile_story _b_radious6">
                                                        <div className="_feed_inner_profile_story_image">
                                                            <img src="/images/card_ppl1.png" alt="Image" className="_profile_story_img" />
                                                            <div className="_feed_inner_story_txt">
                                                                <div className="_feed_inner_story_btn">
                                                                    <button className="_feed_inner_story_btn_link">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                                                                            <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <p className="_feed_inner_story_para">Your Story</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {[2, 3, 4].map((i) => (
                                                    <div key={i} className={`col-xl-3 col-lg-3 col-md-4 col-sm-4 ${i === 4 ? '_custom_none' : i === 3 ? '_custom_mobile_none' : 'col'}`}>
                                                        <div className="_feed_inner_public_story _b_radious6">
                                                            <div className="_feed_inner_public_story_image">
                                                                <img src={`/images/card_ppl${i}.png`} alt="Image" className="_public_story_img" />
                                                                <div className="_feed_inner_pulic_story_txt">
                                                                    <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
                                                                </div>
                                                                <div className="_feed_inner_public_mini">
                                                                    <img src="/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Create Post */}
                                        <CreatePost key={posts.length} />

                                        {/* Posts */}
                                        {posts.map((post: any) => (
                                            <PostCard key={post.id} post={post} />
                                        ))}

                                        {/* Loading More Indicator */}
                                        {loadingMore && (
                                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '4px solid #f3f3f3',
                                                    borderTop: '4px solid #1890FF',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                            </div>
                                        )}

                                        {/* No More Posts Message */}
                                        {!hasMore && posts.length > 0 && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '30px',
                                                color: '#999',
                                                fontSize: '14px'
                                            }}>
                                                🎉 You're all caught up!
                                            </div>
                                        )}

                                        {/* Empty State */}
                                        {!loading && posts.length === 0 && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '50px',
                                                color: '#999'
                                            }}>
                                                <p>No posts yet. Be the first to share something!</p>
                                            </div>
                                        )}

                                        {/* Sentinel Element for Infinite Scroll */}
                                        <div ref={sentinelRef} style={{ height: '1px' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                                <RightSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTop />

            {/* Add spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
