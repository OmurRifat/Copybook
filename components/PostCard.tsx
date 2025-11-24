'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Modal from './Modal';
import CommonLoader from './CommonLoader';
import UserListModal from './UserListModal';

function PostCard({
    post
}: {
    post: any
}) {
    const { data: session } = useSession();

    // Like state - initialize from API data
    const [liked, setLiked] = useState(post.isLikedByCurrentUser || false);
    const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
    const [isLiking, setIsLiking] = useState(false);

    // Who Liked state
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likers, setLikers] = useState<any[]>([]);
    const [isLoadingLikers, setIsLoadingLikers] = useState(false);

    // Comments state
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // Comment likes state
    const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
    const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [commentLikers, setCommentLikers] = useState<any[]>([]);
    const [isLoadingCommentLikers, setIsLoadingCommentLikers] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;

        setIsLiking(true);
        const previousLiked = liked;
        const previousCount = likeCount;

        // Optimistic update
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        try {
            const response = await fetch(`/api/posts/${post.id}/like`, {
                method: liked ? 'DELETE' : 'POST',
            });

            if (!response.ok) {
                setLiked(previousLiked);
                setLikeCount(previousCount);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    };

    const fetchLikers = async () => {
        if (likers.length > 0) return;

        setIsLoadingLikers(true);
        try {
            const response = await fetch(`/api/posts/${post.id}/likes`);
            if (response.ok) {
                const data = await response.json();
                setLikers(data);
            }
        } catch (error) {
            console.error('Error fetching likers:', error);
        } finally {
            setIsLoadingLikers(false);
        }
    };

    const openLikesModal = () => {
        fetchLikers();
        setShowLikesModal(true);
    };

    const fetchComments = async () => {
        if (comments.length > 0) return;

        setIsLoadingComments(true);
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
                // Initialize comment likes state from API data
                const likesState: Record<string, { liked: boolean; count: number }> = {};
                data.forEach((comment: any) => {
                    likesState[comment.id] = {
                        liked: comment.isLikedByCurrentUser || false,
                        count: comment._count?.likes || 0
                    };
                });
                setCommentLikes(likesState);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const toggleComments = () => {
        if (!showComments) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setIsSubmittingComment(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: commentContent,
                    postId: post.id,
                    parentId: replyingTo
                })
            });

            if (response.ok) {
                const newComment = await response.json();
                setComments([...comments, newComment]);
                setCommentContent('');
                setCommentCount(commentCount + 1);
                setReplyingTo(null);
            }
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentLike = async (commentId: string) => {
        const currentState = commentLikes[commentId] || { liked: false, count: 0 };
        const previousLiked = currentState.liked;
        const previousCount = currentState.count;

        // Optimistic update
        setCommentLikes(prev => ({
            ...prev,
            [commentId]: {
                liked: !previousLiked,
                count: previousLiked ? previousCount - 1 : previousCount + 1
            }
        }));

        try {
            const response = await fetch(`/api/comments/${commentId}/like`, {
                method: previousLiked ? 'DELETE' : 'POST',
            });

            if (!response.ok) {
                // Revert on error
                setCommentLikes(prev => ({
                    ...prev,
                    [commentId]: { liked: previousLiked, count: previousCount }
                }));
            }
        } catch (error) {
            console.error('Error toggling comment like:', error);
            // Revert on error
            setCommentLikes(prev => ({
                ...prev,
                [commentId]: { liked: previousLiked, count: previousCount }
            }));
        }
    };

    const fetchCommentLikers = async (commentId: string) => {
        setIsLoadingCommentLikers(true);
        try {
            const response = await fetch(`/api/comments/${commentId}/likes`);
            if (response.ok) {
                const data = await response.json();
                setCommentLikers(data);
            }
        } catch (error) {
            console.error('Error fetching comment likers:', error);
        } finally {
            setIsLoadingCommentLikers(false);
        }
    };

    const openCommentLikesModal = (commentId: string) => {
        setSelectedCommentId(commentId);
        fetchCommentLikers(commentId);
        setShowCommentLikesModal(true);
    };

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <img src={post.user?.image || "/images/user.png"} alt="" className="_post_img" />
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">
                                {post.user?.firstName} {post.user?.lastName}
                            </h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {new Date(post.createdAt).toLocaleDateString()} . <span>{post.isPublic ? 'Public' : 'Private'}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
                {post.imageUrl && (
                    <div className="_feed_inner_timeline_image">
                        <img src={post.imageUrl} alt="" className="_time_img" />
                    </div>
                )}
            </div>

            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
                <div className="_feed_inner_timeline_total_reacts_image">
                    <button
                        onClick={openLikesModal}
                        className="btn-link"
                        style={{ border: 'none', background: 'none', padding: 0, marginLeft: '5px', fontWeight: 600, color: '#65676b' }}
                    >
                        {likeCount > 0 ? (<div className="d-flex align-items-center gap-2">
                            <img src="/images/like.png" style={{ width: '16px', height: '16px' }} alt="Like" className="_react_img1" />
                            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                        </div>) : ''}
                    </button>
                </div>
                <div className="_feed_inner_timeline_total_reacts_txt">
                    <p className="_feed_inner_timeline_total_reacts_para1">
                        <button onClick={toggleComments} className="btn-link" style={{ border: 'none', background: 'none', padding: 0 }}>
                            <span>{commentCount}</span> Comment
                        </button>
                    </p>
                    <p className="_feed_inner_timeline_total_reacts_para2"><span>0</span> Share</p>
                </div>
            </div>

            <div className="_feed_inner_timeline_reaction">
                <button
                    className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${liked ? '_feed_reaction_active' : ''}`}
                    onClick={handleLike}
                    disabled={isLiking}
                >
                    <span className="_feed_inner_timeline_reaction_link">
                        <span className='d-flex align-items-center gap-2'>
                            <img src="/images/like.png" style={{ width: '20px', height: '20px' }} alt="Like" className="_react_img1" />
                            Like
                        </span>
                    </span>
                </button>
                <button
                    className="_feed_inner_timeline_reaction_comment _feed_reaction"
                    onClick={toggleComments}
                >
                    <span className="_feed_inner_timeline_reaction_link">
                        <span className='d-flex align-items-center gap-2'>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
                            </svg>
                            Comment
                        </span>
                    </span>
                </button>
                <button className="_feed_inner_timeline_reaction_share _feed_reaction">
                    <span className="_feed_inner_timeline_reaction_link">
                        <span className='d-flex align-items-center gap-2'>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
                            </svg>
                            Share
                        </span>
                    </span>
                </button>
            </div>

            {showComments && (
                <>
                    <div className="_feed_inner_timeline_cooment_area">
                        <div className="_feed_inner_comment_box">
                            <form className="_feed_inner_comment_box_form" onSubmit={handleCommentSubmit}>
                                <div className="_feed_inner_comment_box_content d-flex align-items-start">
                                    <div className="_feed_inner_comment_box_content_image">
                                        <img src="/images/User.png" style={{ width: '30px', height: '30px' }} alt="" className="_comment_img" />
                                    </div>
                                    <div className="_feed_inner_comment_box_content_txt">
                                        <textarea
                                            className="form-control _comment_textarea"
                                            style={{ paddingTop: '4px' }}
                                            placeholder={replyingTo ? "Write a reply..." : "Write a comment"}
                                            id="floatingTextarea2"
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            disabled={isSubmittingComment}
                                        ></textarea>
                                        {replyingTo && (
                                            <button
                                                type="button"
                                                onClick={() => setReplyingTo(null)}
                                                style={{ fontSize: '12px', color: '#666', background: 'none', border: 'none', padding: '4px 0' }}
                                            >
                                                Cancel Reply
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="_feed_inner_comment_box_icon">
                                    <button
                                        className="_feed_inner_comment_box_icon_btn"
                                        type="submit"
                                        disabled={isSubmittingComment}
                                    >
                                        <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                                            <path fill="#050404ff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="_timline_comment_main">
                        {isLoadingComments ? (
                            <div className="text-center p-3"><CommonLoader size="20" color='#1890FF' text="Loading comments..." /></div>
                        ) : (
                            <>
                                {comments.map((comment) => (
                                    <div key={comment.id} className="_feed_inner_comment_box_content _mar_b16" style={{
                                        alignItems: 'flex-start',
                                        marginBottom: '16px',
                                        marginLeft: comment.parentId ? '40px' : '0'
                                    }}>
                                        <div className="_feed_inner_comment_box_content_image">
                                            <img src="/images/user.png" alt="" className="_comment_img" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div className="_feed_inner_comment_box_content_txt" style={{ backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                                                <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{comment.user?.firstName} {comment.user?.lastName}</h6>
                                                <p style={{ margin: 0, fontSize: '14px', overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>{comment.content}</p>
                                            </div>
                                            <div style={{ marginLeft: '12px', marginTop: '4px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => handleCommentLike(comment.id)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        color: commentLikes[comment.id]?.liked ? '#1890FF' : '#65676b',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Like
                                                </button>
                                                {commentLikes[comment.id]?.count > 0 && (
                                                    <button
                                                        onClick={() => openCommentLikesModal(comment.id)}
                                                        style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 600, color: '#65676b', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <div className="d-flex align-items-center gap-1">
                                                            <img src="/images/like.png" style={{ width: '16px', height: '16px' }} alt="Like" className="_react_img1" />
                                                            <span>{commentLikes[comment.id].count}</span>
                                                        </div>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setReplyingTo(comment.id)}
                                                    style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 600, color: '#65676b', cursor: 'pointer' }}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </>
            )}

            <UserListModal
                isOpen={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                title="People who liked this"
                users={likers}
                isLoading={isLoadingLikers}
            />

            <UserListModal
                isOpen={showCommentLikesModal}
                onClose={() => setShowCommentLikesModal(false)}
                title="People who liked this comment"
                users={commentLikers}
                isLoading={isLoadingCommentLikers}
            />
        </div>
    );
}

export default memo(PostCard);
