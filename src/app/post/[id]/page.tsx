"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostById, type Post } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { summarizePost } from "@/lib/gemini";

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string>("");

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      const foundPost = await getPostById(id);
      setPost(foundPost);
      setIsLoading(false);
    };

    loadPost();
  }, [id]);

  const handleSummarize = async () => {
    if (!post?.content) return;

    setIsSummarizing(true);
    setSummaryError("");
    setSummary(null);

    try {
      const generatedSummary = await summarizePost(post.content);
      setSummary(generatedSummary);
      addToast({
        variant: "success",
        title: "Summary generated",
        description: "AI has generated a summary of this post.",
      });
    } catch (error) {
      console.error("Error summarizing post:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate summary. Please try again.";
      setSummaryError(errorMessage);
      addToast({
        variant: "error",
        title: "Summary failed",
        description: errorMessage,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center">
            <p className="text-gray-600">Loading post...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold">Post not found</h1>
            <Link href="/">
              <Button variant="outline">Back to posts</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to posts
          </Button>
        </Link>

        <article className="bg-white rounded-lg border border-gray-200 p-8">
          <header className="mb-8">
            <h1 className="mb-4 text-3xl font-bold leading-tight">{post.title}</h1>
            {post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <time className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </header>

          {post.imageUrl && (
            <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Content</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={isSummarizing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isSummarizing ? "Summarizing..." : "AI Summarize"}
            </Button>
          </div>

          {summaryError && (
            <Alert variant="destructive" className="mb-6">
              {summaryError}
            </Alert>
          )}

          {summary && (
            <Card className="mb-8 mt-6 border-blue-200 bg-blue-50 shadow-sm">
              <CardContent className="p-6 pt-8">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-blue-900">AI Summary</h3>
                </div>
                <p className="text-sm leading-relaxed text-blue-800">{summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

