"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { createPost } from "@/lib/posts";
import { onAuthChange } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { generatePostContent } from "@/lib/gemini";
import type { User } from "firebase/auth";

export default function NewPost() {
  const router = useRouter();
  const { addToast } = useToast();
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
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      if (!user) {
        router.push("/admin");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) {
      setError("Please enter a prompt to generate content");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generated = await generatePostContent(aiPrompt);
      
      setTitle(generated.title);
      setContent(generated.content);
      setExcerpt(generated.excerpt);
      setTags(generated.tags.join(", "));
      
      addToast({
        variant: "success",
        title: "Content generated",
        description: "AI has generated your post content. You can edit it before submitting.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      setError(error instanceof Error ? error.message : "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
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
    const generatedExcerpt = excerpt.trim() || content.slice(0, 150) + "...";
    
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

      await createPost({
        title: title.trim(),
        content: content.trim(),
        excerpt: generatedExcerpt,
        imageUrl: finalImageUrl,
        tags: tagsArray,
      });
      
      addToast({
        variant: "success",
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      
      router.push("/admin/posts");
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

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
          <h1 className="mb-8 text-2xl font-bold">Create New Post</h1>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">AI Content Generator</h3>
            </div>
            <p className="mb-3 text-sm text-blue-800">
              Describe what you want to write about, and AI will generate a complete blog post for you.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Write a blog post about getting started with Next.js"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateContent();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating || !aiPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

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
                  setImagePreview("");
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
                placeholder="A short description of the post (auto-generated if left empty)"
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
                {isUploading ? "Uploading image..." : isSubmitting ? "Creating..." : "Create Post"}
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

