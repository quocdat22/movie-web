"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CommentWithProfile {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  movie_id: number;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | {
    full_name: string | null;
    avatar_url: string | null;
  }[];
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

const CommentForm = ({
  user, authLoading, handleCommentSubmit, newComment, setNewComment, isSubmitting,
}: {
  user: User | null; authLoading: boolean; handleCommentSubmit: (e: React.FormEvent) => Promise<void>; newComment: string; setNewComment: (value: string) => void; isSubmitting: boolean;
}) => (
  <div className="flex items-start space-x-4 mb-8">
    <Avatar>
      <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt={user?.email || "Guest"} />
      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "G"}</AvatarFallback>
    </Avatar>
    <div className="w-full">
      {authLoading ? (
        <div className="h-24 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
      ) : user ? (
        <form onSubmit={handleCommentSubmit}>
          <div className="grid w-full gap-2">
            <Label htmlFor="comment" className="sr-only">Viết bình luận</Label>
            <textarea id="comment" placeholder="Viết bình luận của bạn..." className="w-full min-h-[80px] p-2 border rounded-md focus:ring-1 focus:ring-ring bg-transparent" value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={isSubmitting} />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Gửi bình luận
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 border rounded-md bg-zinc-50 dark:bg-zinc-800/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">Bạn cần đăng nhập để gửi bình luận.</p>
          <AuthModal>
            <Button>Đăng nhập / Đăng ký</Button>
          </AuthModal>
        </div>
      )}
    </div>
  </div>
);

const CommentItem = ({
  comment, user, editingCommentId, editingText, setEditingText,
  handleStartEdit, handleUpdateComment, handleCancelEdit, isUpdating,
  handleDelete,
}: {
  comment: CommentWithProfile; user: User | null; editingCommentId: number | null; editingText: string;
  setEditingText: (text: string) => void; handleStartEdit: (comment: CommentWithProfile) => void;
  handleUpdateComment: () => Promise<void>; handleCancelEdit: () => void; isUpdating: boolean;
  handleDelete: (commentId: number) => void;
}) => {
  const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
  const authorName = profile?.full_name || "Người dùng ẩn danh";
  const authorAvatar = profile?.avatar_url || "https://github.com/shadcn.png";
  const isOwner = user?.id === comment.user_id;
  const isEditing = editingCommentId === comment.id;

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={authorAvatar} alt={authorName} />
        <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <div className="flex items-center space-x-2">
          <p className="font-semibold">{authorName}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</p>
        </div>
        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="w-full min-h-[80px] p-2 border rounded-md focus:ring-1 focus:ring-ring bg-transparent"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Hủy</Button>
              <Button size="sm" onClick={handleUpdateComment} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
      {isOwner && !isEditing && (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(comment.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )}
    </div>
  );
};

const CommentList = ({
  loadingComments, comments, user, editingCommentId, editingText, setEditingText,
  handleStartEdit, handleUpdateComment, handleCancelEdit, isUpdating,
  handleDelete,
}: {
  loadingComments: boolean; comments: CommentWithProfile[]; user: User | null; editingCommentId: number | null;
  editingText: string; setEditingText: (text: string) => void; handleStartEdit: (comment: CommentWithProfile) => void;
  handleUpdateComment: () => Promise<void>; handleCancelEdit: () => void; isUpdating: boolean;
  handleDelete: (commentId: number) => void;
}) => {
  if (loadingComments) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return <div className="text-center text-muted-foreground py-8">Chưa có bình luận nào. Hãy là người đầu tiên!</div>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          user={user}
          editingCommentId={editingCommentId}
          editingText={editingText}
          setEditingText={setEditingText}
          handleStartEdit={handleStartEdit}
          handleUpdateComment={handleUpdateComment}
          handleCancelEdit={handleCancelEdit}
          isUpdating={isUpdating}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export function MovieCommentSection({ movieId }: { movieId: number }) {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    const { data, error } = await supabase.from("comments").select("*, profiles(full_name, avatar_url)").eq("movie_id", movieId).order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
      throw error;
    } else if (data) {
      setComments(data as CommentWithProfile[]);
    }
    setLoadingComments(false);
  }, [movieId, supabase]);

  useEffect(() => {
    fetchComments().catch(error => {
        toast.error("Tải bình luận thất bại", {
            description: error.message
        });
    });
  }, [fetchComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setIsSubmitting(true);
    const { data: insertedComment, error } = await supabase.from("comments").insert({ content: newComment, user_id: user.id, movie_id: movieId }).select("*, profiles(full_name, avatar_url)").single();
    if (error) {
      console.error("Error posting comment:", error);
      toast.error("Gửi bình luận thất bại", { description: error.message });
    } else if (insertedComment) {
      toast.success("Bình luận đã được gửi!");
      setComments([insertedComment as CommentWithProfile, ...comments]);
      setNewComment("");
    }
    setIsSubmitting(false);
  };

  const handleStartEdit = (comment: CommentWithProfile) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editingText.trim()) return;
    setIsUpdating(true);
    const { error } = await supabase.from("comments").update({ content: editingText }).eq("id", editingCommentId);
    if (error) {
      console.error("Error updating comment:", error);
      toast.error("Cập nhật bình luận thất bại", { description: error.message });
    } else {
      toast.success("Bình luận đã được cập nhật!");
      setComments(comments.map(c => c.id === editingCommentId ? { ...c, content: editingText } : c));
      handleCancelEdit();
    }
    setIsUpdating(false);
  };
  
  const handleRequestDelete = (commentId: number) => {
    setCommentToDelete(commentId);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentToDelete);

    if (error) {
      console.error("Error deleting comment:", error);
      toast.error("Xóa bình luận thất bại", { description: error.message });
    } else {
      toast.success("Bình luận đã được xóa.");
      setComments(comments.filter(c => c.id !== commentToDelete));
    }

    setCommentToDelete(null);
    setIsDeleting(false);
  };


  return (
    <>
      <div className="w-full max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">Bình luận ({comments.length})</h2>
        <CommentForm user={user} authLoading={authLoading} handleCommentSubmit={handleCommentSubmit} newComment={newComment} setNewComment={setNewComment} isSubmitting={isSubmitting} />
        <Separator className="my-8" />
        <CommentList
          loadingComments={loadingComments}
          comments={comments}
          user={user}
          editingCommentId={editingCommentId}
          editingText={editingText}
          setEditingText={setEditingText}
          handleStartEdit={handleStartEdit}
          handleUpdateComment={handleUpdateComment}
          handleCancelEdit={handleCancelEdit}
          isUpdating={isUpdating}
          handleDelete={handleRequestDelete}
        />
      </div>

      <Dialog open={!!commentToDelete} onOpenChange={(isOpen) => !isOpen && setCommentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
            <DialogDescription>
              Hành động này không thể được hoàn tác. Bình luận của bạn sẽ bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCommentToDelete(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa bình luận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MovieCommentSection;