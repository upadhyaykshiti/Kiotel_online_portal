import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from './SocketProvider';
import toast from 'react-hot-toast';

export default function Newsfeed() {
    const { userUniqueID, userFname, userRole, socket } = useAppContext(); 
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [commentInputs, setCommentInputs] = useState({});
    
    // File Upload States
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentData, setAttachmentData] = useState(null);
    const fileInputRef = useRef(null);
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";
    const isAdmin = userRole === 1 || userRole === 'Admin';

    useEffect(() => {
        const fetchPosts = async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const res = await axios.get(`${API_BASE_URL}/api/posts?page=${page}&limit=10`, { withCredentials: true });
                if (res.data.length < 10) setHasMore(false);

                if (page === 1) setPosts(res.data);
                else {
                    setPosts(prev => {
                        const newPosts = res.data.filter(p => !prev.some(existing => existing.id === p.id));
                        return [...prev, ...newPosts];
                    });
                }
            } catch (err) {
                console.error("Failed to load posts", err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };
        fetchPosts();
    }, [API_BASE_URL, page]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            if (!loadingMore && hasMore) setPage(prevPage => prevPage + 1);
        }
    };

    // REAL-TIME LISTENERS
    useEffect(() => {
        if (!socket) return;
        const handleNewPost = (post) => setPosts(prev => [post, ...prev]);
        const handleLike = ({ postId, liker }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: [...p.likes, liker] } : p));
        const handleUnlike = ({ postId, account_no }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes.filter(l => String(l.account_no) !== String(account_no)) } : p));
        const handleNewComment = ({ postId, comment }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
        const handlePostDeleted = ({ postId }) => setPosts(prev => prev.filter(p => p.id !== postId));
        const handleCommentDeleted = ({ postId, commentId }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p));

        socket.on("new_post", handleNewPost);
        socket.on("post_liked", handleLike);
        socket.on("post_unliked", handleUnlike);
        socket.on("new_comment", handleNewComment);
        socket.on("post_deleted", handlePostDeleted);
        socket.on("comment_deleted", handleCommentDeleted);

        return () => {
            socket.off("new_post", handleNewPost);
            socket.off("post_liked", handleLike);
            socket.off("post_unliked", handleUnlike);
            socket.off("new_comment", handleNewComment);
            socket.off("post_deleted", handlePostDeleted);
            socket.off("comment_deleted", handleCommentDeleted);
        };
    }, [socket]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return toast.error("File is too large (Max 10MB)");

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/chat/api/upload-media`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            setAttachmentData({ url: res.data.url, type: res.data.type, name: file.name });
            toast.success("File attached!");
        } catch (err) {
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() && !attachmentData) return;
        
        try {
            await axios.post(`${API_BASE_URL}/api/posts`, { 
                account_no: userUniqueID, 
                content: newPostContent || "Shared an attachment",
                attachment_url: attachmentData?.url,
                attachment_type: attachmentData?.type
            }, { withCredentials: true });
            
            setNewPostContent("");
            setAttachmentData(null);
        } catch (err) { toast.error("Failed to post"); }
    };

    const toggleLike = async (postId) => {
        try { await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, { account_no: userUniqueID }, { withCredentials: true }); } 
        catch (err) { toast.error("Failed to like post"); }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        const content = commentInputs[postId];
        if (!content || !content.trim()) return;
        try {
            await axios.post(`${API_BASE_URL}/api/posts/${postId}/comments`, { account_no: userUniqueID, content }, { withCredentials: true });
            setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        } catch (err) { toast.error("Failed to comment"); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, { data: { account_no: userUniqueID, role: userRole }, withCredentials: true });
            toast.success("Post deleted");
        } catch (err) { toast.error("Failed to delete post"); }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`, { data: { account_no: userUniqueID, role: userRole }, withCredentials: true });
            toast.success("Comment deleted");
        } catch (err) { toast.error("Failed to delete comment"); }
    };

    const renderLikesSummary = (likes) => {
        if (!likes || likes.length === 0) return <span>0 Likes</span>;
        
        const hasLiked = likes.some(l => String(l.account_no) === String(userUniqueID));
        const otherLikers = likes.filter(l => String(l.account_no) !== String(userUniqueID));

        let summaryText = "";
        if (hasLiked) {
            if (otherLikers.length === 0) summaryText = "Liked by You";
            else if (otherLikers.length === 1) summaryText = `Liked by You and ${otherLikers[0].fname} ${otherLikers[0].lname}`;
            else summaryText = `Liked by You, ${otherLikers[0].fname}, and ${otherLikers.length - 1} others`;
        } else {
            if (otherLikers.length === 1) summaryText = `Liked by ${otherLikers[0].fname} ${otherLikers[0].lname}`;
            else if (otherLikers.length === 2) summaryText = `Liked by ${otherLikers[0].fname} and ${otherLikers[1].fname}`;
            else summaryText = `Liked by ${otherLikers[0].fname}, ${otherLikers[1].fname}, and ${otherLikers.length - 2} others`;
        }

        return (
            <div className="relative group cursor-pointer inline-block">
                <span className="hover:text-blue-600 transition-colors font-medium">{summaryText}</span>
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg p-2 shadow-xl z-20 max-h-40 overflow-y-auto custom-scrollbar">
                    <div className="font-bold border-b border-gray-700 pb-1 mb-1">Liked by:</div>
                    {likes.map(l => (
                        <div key={l.account_no} className="py-1 truncate hover:text-blue-300 flex items-center gap-2">
                            {l.profile_pic ? (
                                <img src={l.profile_pic} alt="" className="w-4 h-4 rounded-full object-cover" />
                            ) : (
                                <span className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px]">{l.fname.charAt(0)}</span>
                            )}
                            {l.fname} {l.lname} {String(l.account_no) === String(userUniqueID) && <span className="text-gray-400 italic">(You)</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <div className="text-center p-4 text-gray-500">Loading feed...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white sticky top-0 z-10 shadow-sm">
                <form onSubmit={handlePostSubmit} className="flex flex-col gap-2">
                    {attachmentData && (
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-2 rounded-lg text-sm">
                            <span className="text-blue-700 font-medium truncate flex items-center gap-2">
                                📎 {attachmentData.name}
                            </span>
                            <button type="button" onClick={() => setAttachmentData(null)} className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
                        </div>
                    )}
                    <textarea 
                        className="w-full border rounded-md p-2 text-sm resize-none focus:outline-blue-500 bg-slate-50" 
                        rows="2" placeholder={`What's on your mind, ${userFname}?`}
                        value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*, application/pdf, image/gif" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-gray-500 hover:text-blue-600 p-1.5 transition-colors transform hover:rotate-12 rounded-full hover:bg-gray-100 flex items-center gap-1 text-sm font-medium">
                                📎 {isUploading ? "Uploading..." : "Attach File"}
                            </button>
                        </div>
                        <button type="submit" disabled={(!newPostContent.trim() && !attachmentData) || isUploading} className="bg-blue-600 text-white px-5 py-1.5 rounded-md text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                            Post
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-100" onScroll={handleScroll}>
                {posts.map((post) => {
                    const hasLiked = post.likes.some(l => String(l.account_no) === String(userUniqueID));
                    const canDeletePost = isAdmin || post.account_no === String(userUniqueID);
                    
                    return (
                        <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {/* POST PROFILE PIC */}
                                    {post.profile_pic ? (
                                        <img src={post.profile_pic} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-50">
                                            {post.fname?.charAt(0)}{post.lname?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[15px] font-bold text-gray-900 leading-tight">{post.fname} {post.lname}</p>
                                        <p className="text-[11px] text-gray-500">{new Date(post.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                {canDeletePost && (
                                    <button onClick={() => handleDeletePost(post.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                                )}
                            </div>
                            
                            {post.content !== "Shared an attachment" && (
                                <p className="text-[15px] text-gray-800 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                            )}

                            {post.attachment_url && (
                                <div className="mb-4 mt-2 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                    {post.attachment_type?.includes('image') ? (
                                        <img src={post.attachment_url} alt="attachment" className="max-w-full h-auto rounded max-h-96 object-contain w-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => window.open(post.attachment_url, '_blank')} />
                                    ) : post.attachment_type?.includes('pdf') ? (
                                        <a href={post.attachment_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-6 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                            <span className="text-2xl">📄</span> View PDF Document
                                        </a>
                                    ) : (
                                        <a href={post.attachment_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-6 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                                            <span className="text-2xl">📁</span> Download File
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3 mb-3">
                                {renderLikesSummary(post.likes)}
                                <span className="font-medium hover:text-gray-700 cursor-pointer">{post.comments.length} Comments</span>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <button onClick={() => toggleLike(post.id)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${hasLiked ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-transparent'}`}>
                                    {hasLiked ? '❤️ Liked' : '🤍 Like'}
                                </button>
                            </div>

                            <div className="bg-gray-50/80 rounded-xl p-4 space-y-3 border border-gray-100">
                                {post.comments.map(c => {
                                    const canDeleteComment = isAdmin || c.account_no === String(userUniqueID);
                                    return (
                                        <div key={c.id} className="text-[13px] flex gap-2 items-start group">
                                            {/* COMMENT PROFILE PIC */}
                                            {c.profile_pic ? (
                                                <img src={c.profile_pic} alt="" className="w-7 h-7 rounded-full object-cover shadow-sm border border-gray-200 flex-shrink-0" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                                    {c.fname.charAt(0)}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm border border-gray-100 relative">
                                                <span className="font-bold text-gray-900 mr-1.5">{c.fname} {c.lname}</span>
                                                <span className="text-gray-700">{c.content}</span>
                                                {canDeleteComment && (
                                                    <button onClick={() => handleDeleteComment(post.id, c.id)} className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm border border-gray-200 text-[10px] text-red-500 hover:text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                    <input type="text" placeholder="Write a comment..." className="flex-1 text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" value={commentInputs[post.id] || ""} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} />
                                    <button type="submit" disabled={!commentInputs[post.id]?.trim()} className="text-sm bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">Send</button>
                                </form>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}