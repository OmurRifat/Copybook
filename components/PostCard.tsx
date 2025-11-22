'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Modal from './Modal';

function PostCard({ post }: { post: any }) {
    const { data: session } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);

    // Like state
    const [liked, setLiked] = useState(false);
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
                setComments([newComment, ...comments]);
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
                                {new Date(post.createdAt).toLocaleDateString()} . <Link href="#0">{post.isPublic ? 'Public' : 'Private'}</Link>
                            </p>
                        </div>
                    </div>
                    <div className="_feed_inner_timeline_post_box_dropdown">
                        <div className="_feed_timeline_post_dropdown">
                            <button
                                type="button"
                                className="_feed_timeline_post_dropdown_link"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                                    <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                                    <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                                </svg>
                            </button>
                        </div>
                        {showDropdown && (
                            <div className="_feed_timeline_dropdown _timeline_dropdown show">
                                <ul className="_feed_timeline_dropdown_list">
                                    <li className="_feed_timeline_dropdown_item">
                                        <Link href="#0" className="_feed_timeline_dropdown_link">
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                    <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z" />
                                                </svg>
                                            </span>
                                            Save Post
                                        </Link>
                                    </li>
                                    <li className="_feed_timeline_dropdown_item">
                                        <Link href="#0" className="_feed_timeline_dropdown_link">
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                    <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75" />
                                                    <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z" />
                                                </svg>
                                            </span>
                                            Edit Post
                                        </Link>
                                    </li>
                                    <li className="_feed_timeline_dropdown_item">
                                        <Link href="#0" className="_feed_timeline_dropdown_link">
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                    <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5" />
                                                </svg>
                                            </span>
                                            Delete Post
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
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
                    <img src="/images/react_img1.png" alt="Image" className="_react_img1" />
                    <img src="/images/react_img2.png" alt="Image" className="_react_img" />
                    <img src="/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                    <button
                        onClick={openLikesModal}
                        className="btn-link"
                        style={{ border: 'none', background: 'none', padding: 0, marginLeft: '5px', fontWeight: 600, color: '#65676b' }}
                    >
                        {likeCount > 0 ? `${likeCount} Likes` : ''}
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
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                                <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                                <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
                                <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
                                <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z" />
                            </svg>
                            Like
                        </span>
                    </span>
                </button>
                <button
                    className="_feed_inner_timeline_reaction_comment _feed_reaction"
                    onClick={toggleComments}
                >
                    <span className="_feed_inner_timeline_reaction_link">
                        <span>
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
                        <span>
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
                                <div className="_feed_inner_comment_box_content">
                                    <div className="_feed_inner_comment_box_content_image">
                                        <img src="/images/comment_img.png" alt="" className="_comment_img" />
                                    </div>
                                    <div className="_feed_inner_comment_box_content_txt">
                                        <textarea
                                            className="form-control _comment_textarea"
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                            <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="_timline_comment_main">
                        {isLoadingComments ? (
                            <div className="text-center p-3">Loading comments...</div>
                        ) : (
                            <>
                                {comments.map((comment) => (
                                    <div key={comment.id} className="_feed_inner_comment_box_content _mar_b16" style={{
                                        alignItems: 'flex-start',
                                        marginBottom: '16px',
                                        marginLeft: comment.parentId ? '40px' : '0'
                                    }}>
                                        <div className="_feed_inner_comment_box_content_image">
                                            <img src={comment.user?.image || "/images/user.png"} alt="" className="_comment_img" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div className="_feed_inner_comment_box_content_txt" style={{ backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                                                <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{comment.user?.firstName} {comment.user?.lastName}</h6>
                                                <p style={{ margin: 0, fontSize: '14px' }}>{comment.content}</p>
                                            </div>
                                            <div style={{ marginLeft: '12px', marginTop: '4px' }}>
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

            <Modal
                isOpen={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                title="People who liked this"
            >
                {isLoadingLikers ? (
                    <div className="text-center p-3">Loading...</div>
                ) : (
                    <div className="_likes_list">
                        {likers.length === 0 ? (
                            <p className="text-center text-muted">No likes yet</p>
                        ) : (
                            likers.map((like) => (
                                <div key={like.id} className="d-flex align-items-center mb-3">
                                    <img
                                        src={like.user?.image || "/images/user.png"}
                                        alt=""
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                    />
                                    <div>
                                        <h6 style={{ margin: 0, fontSize: '14px' }}>{like.user?.firstName} {like.user?.lastName}</h6>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default memo(PostCard);
