"use client";

import { use, useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { getPostById, updatePost } from "@/lib/posts";
import { onAuthChange } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import type { Post } from "@/lib/posts";
import type { User } from "firebase/auth";

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user: User | null) => {
      if (!user) {
        router.push("/admin");
        return;
      }

      const foundPost = await getPostById(id);
      if (!foundPost) {
        router.push("/admin/posts");
        return;
      }

      setPost(foundPost);
      setTitle(foundPost.title);
      setImageUrl(foundPost.imageUrl || "");
      setImagePreview(foundPost.imageUrl || "");
      setContent(foundPost.content);
      setExcerpt(foundPost.excerpt);
      setTags(foundPost.tags.join(", "));
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(""); // Clear URL input if file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    const updatedExcerpt = excerpt.trim() || content.slice(0, 150) + "...";

    try {
      let finalImageUrl = imageUrl.trim() || undefined;

      // Upload image file if selected
      if (imageFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await uploadImage(imageFile);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          setError("Failed to upload image. Please try again.");
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await updatePost(id, {
        title: title.trim(),
        content: content.trim(),
        excerpt: updatedExcerpt,
        imageUrl: finalImageUrl,
        tags: tagsArray,
      });
      
      addToast({
        variant: "success",
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      
      router.push("/admin/posts");
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post. Please try again.");
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/admin/posts">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to posts
          </Button>
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="mb-8 text-2xl font-bold">Edit Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}
            
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Title *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">
                Image (optional)
              </label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-md rounded-lg border border-gray-200"
                  />
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">Or enter an image URL:</p>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFile(null);
                  if (!e.target.value) {
                    setImagePreview(post?.imageUrl || "");
                  } else {
                    setImagePreview(e.target.value);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="mt-2"
              />
            </div>

            <div>
              <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-700">
                Tags (optional)
              </label>
              <Input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, nextjs, tutorial (comma-separated)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>

            <div>
              <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-gray-700">
                Excerpt (optional)
              </label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short description of the post"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                Content *
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your post content here... You can use Markdown for formatting."
                rows={12}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isUploading ? "Uploading image..." : isSubmitting ? "Updating..." : "Update Post"}
              </Button>
              <Link href="/admin/posts">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

