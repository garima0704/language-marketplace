"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommentUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  parent_id: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles: CommentUser | CommentUser[] | null;
  likeCount: number;
  isLiked: boolean;
}

interface VideoCommentsProps {
  videoId: string;
  isAuthenticated: boolean;
}

function getProfile(
  profiles: Comment["profiles"]
): CommentUser | null {
  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
}

function getInitials(name?: string | null) {
  if (!name) return "NC";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(months / 12);

  return `${years}y ago`;
}

export default function VideoComments({
  videoId,
  isAuthenticated,
}: VideoCommentsProps) {
  const supabase = createClient();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(
    null
  );

  const [likingComments, setLikingComments] =
    useState<Set<string>>(new Set());

  /*
   * Which comment is currently being replied to.
   */
  const [replyingTo, setReplyingTo] =
    useState<string | null>(null);

  /*
   * Reply text for each comment.
   */
  const [replyText, setReplyText] = useState("");

  /*
   * IDs of comments whose replies are currently
   * expanded.
   */
  const [expandedReplies, setExpandedReplies] =
    useState<Set<string>>(new Set());

  /*
   * --------------------------------------------------
   * Current user
   * --------------------------------------------------
   */

  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated) {
        setCurrentUserId(null);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);
    };

    loadUser();
  }, [isAuthenticated]);

  /*
   * --------------------------------------------------
   * Load comments + likes
   * --------------------------------------------------
   */

  const loadComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: commentsData,
        error: commentsError,
      } = await supabase
        .from("comments")
        .select(`
          id,
          video_id,
          user_id,
          parent_id,
          comment,
          created_at,
          updated_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("video_id", videoId)
        .order("created_at", {
          ascending: false,
        });

      if (commentsError) {
        console.error(
          "Failed to load comments:",
          commentsError
        );

        setError("Unable to load comments.");
        setComments([]);
        return;
      }

      const rawComments =
        (commentsData as Omit<
          Comment,
          "likeCount" | "isLiked"
        >[]) ?? [];

      if (rawComments.length === 0) {
        setComments([]);
        return;
      }

      const commentIds = rawComments.map(
        (comment) => comment.id
      );

      const {
        data: likesData,
        error: likesError,
      } = await supabase
        .from("comment_likes")
        .select("comment_id, user_id")
        .in("comment_id", commentIds);

      if (likesError) {
        console.error(
          "Failed to load comment likes:",
          likesError
        );

        setComments(
          rawComments.map((comment) => ({
            ...comment,
            likeCount: 0,
            isLiked: false,
          }))
        );

        return;
      }

      const likes = likesData ?? [];

      const likeCounts = new Map<string, number>();

      likes.forEach((like) => {
        likeCounts.set(
          like.comment_id,
          (likeCounts.get(like.comment_id) ?? 0) + 1
        );
      });

      const likedCommentIds = new Set<string>();

      if (currentUserId) {
        likes.forEach((like) => {
          if (like.user_id === currentUserId) {
            likedCommentIds.add(like.comment_id);
          }
        });
      }

      const enrichedComments: Comment[] =
        rawComments.map((comment) => ({
          ...comment,
          likeCount:
            likeCounts.get(comment.id) ?? 0,
          isLiked: likedCommentIds.has(
            comment.id
          ),
        }));

      setComments(enrichedComments);
    } catch (error) {
      console.error(
        "Unexpected error loading comments:",
        error
      );

      setError("Unable to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [videoId, currentUserId]);

  /*
   * --------------------------------------------------
   * Add top-level comment
   * --------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!isAuthenticated) return;

    const text = commentText.trim();

    if (!text || posting) return;

    setPosting(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please log in to comment.");
        return;
      }

      const {
        data,
        error: insertError,
      } = await supabase
        .from("comments")
        .insert({
          video_id: videoId,
          user_id: user.id,
          comment: text,
          parent_id: null,
        })
        .select(`
          id,
          video_id,
          user_id,
          parent_id,
          comment,
          created_at,
          updated_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (insertError) {
        console.error(
          "Failed to add comment:",
          insertError
        );

        setError("Unable to post your comment.");
        return;
      }

      const newComment: Comment = {
        ...(data as Omit<
          Comment,
          "likeCount" | "isLiked"
        >),
        likeCount: 0,
        isLiked: false,
      };

      setComments((current) => [
        newComment,
        ...current,
      ]);

      setCommentText("");
    } finally {
      setPosting(false);
    }
  };

  /*
   * --------------------------------------------------
   * Add reply
   * --------------------------------------------------
   */

  const handleReplySubmit = async (
    parentId: string
  ) => {
    if (!isAuthenticated || !currentUserId) {
      return;
    }

    const text = replyText.trim();

    if (!text || posting) {
      return;
    }

    setPosting(true);
    setError(null);

    try {
      const {
        data,
        error: insertError,
      } = await supabase
        .from("comments")
        .insert({
          video_id: videoId,
          user_id: currentUserId,
          parent_id: parentId,
          comment: text,
        })
        .select(`
          id,
          video_id,
          user_id,
          parent_id,
          comment,
          created_at,
          updated_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (insertError) {
        console.error(
          "Failed to add reply:",
          insertError
        );

        setError("Unable to post your reply.");
        return;
      }

      const newReply: Comment = {
        ...(data as Omit<
          Comment,
          "likeCount" | "isLiked"
        >),
        likeCount: 0,
        isLiked: false,
      };

      setComments((current) => [
        ...current,
        newReply,
      ]);

      /*
       * Automatically open replies after replying.
       */
      setExpandedReplies((current) => {
        const next = new Set(current);
        next.add(parentId);
        return next;
      });

      setReplyText("");
      setReplyingTo(null);
    } finally {
      setPosting(false);
    }
  };

  /*
   * --------------------------------------------------
   * Like / unlike
   * --------------------------------------------------
   */

  const handleLike = async (commentId: string) => {
  // Logged out users can see likes but cannot like.
  if (!isAuthenticated || !currentUserId) {
    window.location.href = `/login?redirect=/videos/${videoId}`;
    return;
  }

  if (likingComments.has(commentId)) {
    return;
  }

  const comment = comments.find(
    (item) => item.id === commentId
  );

  if (!comment) return;

  const wasLiked = comment.isLiked;

  setError(null);

  setLikingComments((current) => {
    const next = new Set(current);
    next.add(commentId);
    return next;
  });

  // --------------------------------------------
  // Optimistic UI
  // --------------------------------------------

  setComments((current) =>
    current.map((item) => {
      if (item.id !== commentId) {
        return item;
      }

      return {
        ...item,
        isLiked: !wasLiked,
        likeCount: wasLiked
          ? Math.max(0, item.likeCount - 1)
          : item.likeCount + 1,
      };
    })
  );

  try {
    if (wasLiked) {
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", currentUserId);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: commentId,
          user_id: currentUserId,
        });

      if (error) {
        throw error;
      }
    }
  } catch (error: any) {
    console.error(
      "Failed to update comment like:",
      error
    );

    // --------------------------------------------
    // Rollback optimistic UI
    // --------------------------------------------

    setComments((current) =>
      current.map((item) => {
        if (item.id !== commentId) {
          return item;
        }

        return {
          ...item,
          isLiked: wasLiked,
          likeCount: wasLiked
            ? item.likeCount + 1
            : Math.max(0, item.likeCount - 1),
        };
      })
    );

    if (error?.code === "23505") {
      setError(
        "You have already liked this comment."
      );
    } else {
      setError(
        "Unable to update your comment like."
      );
    }
  } finally {
    setLikingComments((current) => {
      const next = new Set(current);
      next.delete(commentId);
      return next;
    });
  }
};

  /*
   * --------------------------------------------------
   * Delete comment/reply
   * --------------------------------------------------
   */

  const handleDelete = async (
    commentId: string
  ) => {
    const confirmed = window.confirm(
      "Delete this comment?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error(
        "Failed to delete comment:",
        error
      );

      setError("Unable to delete comment.");
      return;
    }
    
    await loadComments();
  };

  /*
   * --------------------------------------------------
   * Toggle replies
   * --------------------------------------------------
   */

  const toggleReplies = (
    commentId: string
  ) => {
    setExpandedReplies((current) => {
      const next = new Set(current);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

      return next;
    });
  };

  /*
   * --------------------------------------------------
   * Comments
   * --------------------------------------------------
   */

  const topLevelComments = comments.filter(
    (comment) => !comment.parent_id
  );

  /*
   * --------------------------------------------------
   * Render comment
   * --------------------------------------------------
   */

  const renderComment = (
    comment: Comment,
    isReply = false
  ) => {
    const profile = getProfile(
      comment.profiles
    );

    const name =
      profile?.display_name ||
      profile?.username ||
      "User";

    const isOwner =
      currentUserId === comment.user_id;

    const isLiking =
      likingComments.has(comment.id);

    const replies = comments.filter(
      (item) => item.parent_id === comment.id
    );

    const hasReplies = replies.length > 0;

    const areRepliesExpanded =
      expandedReplies.has(comment.id);

    return (
      <div
        key={comment.id}
        className={
          isReply
            ? "ml-12 flex gap-3"
            : "flex gap-3"
        }
      >
        <Avatar
          className={
            isReply
              ? "h-8 w-8 shrink-0"
              : "h-10 w-10 shrink-0"
          }
        >
          <AvatarImage
            src={profile?.avatar_url ?? ""}
            alt={name}
          />

          <AvatarFallback className="bg-muted-bg text-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          {/* User + time */}

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {name}
            </span>

            <span className="text-xs text-muted">
              {formatTimeAgo(
                comment.created_at
              )}
            </span>
          </div>

          {/* Text */}

          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-secondary">
            {comment.comment}
          </p>

          {/* Actions */}

          <div className="mt-2 flex items-center gap-4">
            {/* Like */}

            <button
              type="button"
              onClick={() => handleLike(comment.id)}
              disabled={isLiking}
              aria-label={
                comment.isLiked
                  ? "Unlike comment"
                  : "Like comment"
              }
              title={
                isAuthenticated
                  ? comment.isLiked
                    ? "Unlike"
                    : "Like"
                  : "Log in to like"
              }
              className={`inline-flex items-center gap-1.5 text-xs font-medium transition ${
                comment.isLiked
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              } ${
                isLiking
                  ? "cursor-wait opacity-60"
                  : ""
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-transform ${
                  comment.isLiked
                    ? "fill-current"
                    : ""
                } ${
                  isLiking
                    ? "scale-90"
                    : "hover:scale-110"
                }`}
              />

              <span>
                {comment.likeCount}
              </span>
            </button>

            {/* Reply */}

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyText("");

                  /*
                   * Show existing replies when
                   * opening reply mode.
                   */
                  if (hasReplies) {
                    setExpandedReplies(
                      (current) => {
                        const next = new Set(
                          current
                        );
                        next.add(comment.id);
                        return next;
                      }
                    );
                  }
                }}
                className="text-xs font-medium text-muted transition hover:text-foreground"
              >
                Reply
              </button>
            )}

            {/* Delete */}

            {isOwner && (
              <button
                type="button"
                onClick={() =>
                  handleDelete(comment.id)
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />

                Delete
              </button>
            )}
          </div>

          {/* Reply form */}

          {replyingTo === comment.id &&
            isAuthenticated && (
              <div className="mt-4 flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-xs text-white">
                    You
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <textarea
                    value={replyText}
                    onChange={(event) =>
                      setReplyText(
                        event.target.value
                      )
                    }
                    placeholder={`Reply to ${name}...`}
                    rows={2}
                    maxLength={2000}
                    autoFocus
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
                  />

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={
                        posting ||
                        !replyText.trim()
                      }
                      onClick={() =>
                        handleReplySubmit(
                          comment.id
                        )
                      }
                      className="rounded-lg"
                    >
                      <Send className="mr-1 h-4 w-4" />

                      {posting
                        ? "Posting..."
                        : "Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Replies */}

          {hasReplies && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  toggleReplies(comment.id)
                }
                className="text-xs font-semibold text-muted transition hover:text-foreground"
              >
                {areRepliesExpanded
                  ? "Hide replies"
                  : `View ${replies.length} ${
                      replies.length === 1
                        ? "reply"
                        : "replies"
                    }`}
              </button>

              {areRepliesExpanded && (
                <div className="mt-4 space-y-5">
                  {replies.map((reply) =>
                    renderComment(
                      reply,
                      true
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  /*
   * --------------------------------------------------
   * Main render
   * --------------------------------------------------
   */

  return (
    <section className="mt-10">
      {/* Header */}

      <div className="border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted" />

          <h2 className="text-xl font-semibold text-foreground">
            Comments
          </h2>

          <span className="text-sm text-muted">
            {topLevelComments.length}
          </span>
        </div>
      </div>

      {/* Comment form */}

      <div className="py-6">
        {isAuthenticated ? (
          <form
            onSubmit={handleSubmit}
            className="flex gap-3"
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary text-white">
                You
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                placeholder="Add a comment..."
                rows={3}
                maxLength={2000}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {commentText.length}/2000
                </span>

                <Button
                  type="submit"
                  disabled={
                    posting ||
                    !commentText.trim()
                  }
                  className="rounded-lg"
                >
                  <Send className="mr-2 h-4 w-4" />

                  {posting
                    ? "Posting..."
                    : "Comment"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-border bg-muted-bg px-5 py-4">
            <p className="text-sm text-muted">
              Log in to join the conversation.
            </p>
          </div>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      )}

      {/* Comments */}

      {loading ? (
        <div className="py-8 text-center text-sm text-muted">
          Loading comments...
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted" />

          <p className="mt-3 font-medium text-foreground">
            No comments yet
          </p>

          <p className="mt-1 text-sm text-muted">
            Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {topLevelComments.map((comment) =>
            renderComment(comment)
          )}
        </div>
      )}
    </section>
  );
}