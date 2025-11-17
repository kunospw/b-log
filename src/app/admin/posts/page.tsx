"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { getAllPosts, deletePost, type Post } from "@/lib/posts";
import { onAuthChange, logout } from "@/lib/auth";
import type { User } from "firebase/auth";

export default function AdminPosts() {
  const router = useRouter();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user: User | null) => {
      if (!user) {
        router.push("/admin");
        return;
      }
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    const success = await deletePost(postToDelete.id);
    if (success) {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      addToast({
        variant: "success",
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });
    } else {
      addToast({
        variant: "error",
        title: "Delete failed",
        description: "Failed to delete the post. Please try again.",
      });
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-mono text-3xl font-bold">(b)log</h1>
            <p className="text-gray-600">Admin Dashboard</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mb-6">
          <Link href="/admin/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No posts yet. Create your first post!
            </div>
          ) : (
            posts.map((post) => (
              <Card 
                key={post.id} 
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/admin/edit/${post.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(post);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setPostToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

