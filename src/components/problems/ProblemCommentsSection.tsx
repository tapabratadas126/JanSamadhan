"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Reply, User as UserIcon, CornerDownRight } from "lucide-react";

interface CommentUser {
  id: string;
  name: string;
  role: string;
  orgName?: string | null;
}

interface CommentItem {
  id: string;
  problemId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  user: CommentUser;
}

interface ProblemCommentsSectionProps {
  problemId: string;
  approvalStatus: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export default function ProblemCommentsSection({
  problemId,
  approvalStatus,
  currentUserId,
  currentUserRole,
}: ProblemCommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Strictly gate: if approvalStatus is not APPROVED, hide completely!
  if (approvalStatus !== "APPROVED") {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchComments();
  }, [problemId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/problems/${problemId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error("Failed to fetch comments", e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostComment(parentId: string | null = null, content: string) {
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/problems/${problemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
        setSubmitting(false);
        return;
      }

      const created = await res.json();
      setComments((prev) => [...prev, created]);
      if (parentId) {
        setReplyToId(null);
        setReplyContent("");
      } else {
        setNewComment("");
      }
    } catch (e) {
      setError("Network error. Could not post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const getRoleBadge = (user: CommentUser) => {
    const role = user.role.toUpperCase();
    if (role === "UNIVERSITY") {
      return (
        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">
          🎓 {user.orgName || "University"}
        </span>
      );
    }
    if (role === "INDUSTRY") {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
          🏭 {user.orgName || "Industry Partner"}
        </span>
      );
    }
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-purple-100">
          🛡️ Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-teal-100">
        🧑 Citizen
      </span>
    );
  };

  // Organize comments into top-level and replies map
  const topLevelComments = comments.filter((c) => !c.parentId);
  const repliesByParentId: Record<string, CommentItem[]> = {};
  comments.forEach((c) => {
    if (c.parentId) {
      if (!repliesByParentId[c.parentId]) repliesByParentId[c.parentId] = [];
      repliesByParentId[c.parentId].push(c);
    }
  });

  const canPost = currentUserRole && currentUserRole !== "ADMIN";

  return (
    <div className="card p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={22} className="text-[#6366F1]" />
          <span>Discussion Forum ({comments.length})</span>
        </h2>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Public Discussion Active
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Primary Comment Box for Eligible Roles */}
      {canPost ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePostComment(null, newComment);
          }}
          className="space-y-3 bg-[#FAFAF9] p-4 rounded-2xl border border-gray-200/80"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Join the discussion</span>
            <span className="text-gray-400">Markdown supported</span>
          </div>
          <textarea
            className="input min-h-[90px] text-sm resize-y"
            placeholder="Share thoughts, ask questions, or provide feedback on this problem..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>{submitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>
      ) : currentUserRole === "ADMIN" ? (
        <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl text-xs text-purple-900 font-medium text-center">
          Moderator View: Admin accounts can view public discussions but cannot post comments.
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs text-gray-600 text-center font-medium">
          Log in as a Citizen, University, or Industry partner to join this discussion.
        </div>
      )}

      {/* Reddit-style Comment List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-400">Loading comments...</div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          No comments yet. Be the first to start the discussion!
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {topLevelComments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-3"
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    <UserIcon size={14} />
                  </div>
                  <span className="font-bold text-gray-900">{comment.user.name}</span>
                  {getRoleBadge(comment.user)}
                </div>
                <span className="text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>

              {/* Comment Content */}
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line pl-9">
                {comment.content}
              </p>

              {/* Action Bar */}
              {canPost && (
                <div className="pl-9 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyToId(replyToId === comment.id ? null : comment.id);
                      setReplyContent("");
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    <Reply size={13} />
                    <span>Reply</span>
                  </button>
                </div>
              )}

              {/* Nested Reply Form */}
              {replyToId === comment.id && (
                <div className="ml-9 mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <textarea
                    className="input min-h-[70px] text-xs"
                    placeholder={`Replying to ${comment.user.name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyToId(null)}
                      className="btn-outline text-[11px] py-1 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !replyContent.trim()}
                      onClick={() => handlePostComment(comment.id, replyContent)}
                      className="btn-primary text-[11px] py-1 px-3"
                    >
                      {submitting ? "Sending..." : "Submit Reply"}
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {repliesByParentId[comment.id]?.length > 0 && (
                <div className="ml-6 sm:ml-9 mt-3 border-l-2 border-indigo-100 pl-4 space-y-3">
                  {repliesByParentId[comment.id].map((reply) => (
                    <div key={reply.id} className="space-y-1.5 text-xs pt-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <CornerDownRight size={13} className="text-indigo-400" />
                          <span className="font-bold text-gray-900">{reply.user.name}</span>
                          {getRoleBadge(reply.user)}
                        </div>
                        <span className="text-gray-400 text-[11px]">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed pl-5 whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
