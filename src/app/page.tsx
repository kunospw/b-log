"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { getAllPosts, searchPosts, filterPostsByTag, getAllTags, type Post } from "@/lib/posts";

const POSTS_PER_PAGE = 9;

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      const query = searchParams.get("q") || "";
      const tagFilter = searchParams.get("tag") || "";

      let results: Post[] = [];

      if (tagFilter) {
        results = await filterPostsByTag(tagFilter);
        if (query.trim()) {
          results = results.filter(
            (post) =>
              post.title.toLowerCase().includes(query.toLowerCase()) ||
              post.content.toLowerCase().includes(query.toLowerCase()) ||
              post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
              post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
          );
        }
      } else if (query.trim()) {
        results = await searchPosts(query);
      } else {
        results = await getAllPosts();
      }

      setPosts(results);
      setIsLoading(false);
    };

    const loadTags = async () => {
      const tags = await getAllTags();
      setAllTags(tags);
    };

    loadPosts();
    loadTags();
  }, [searchParams]);

  const searchQuery = searchParams.get("q") || "";
  const activeTag = searchParams.get("tag") || "";

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === tag) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    params.delete("page"); // Reset to page 1 when changing tags
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-6 py-16">
        {allTags.length > 0 && (
          <Card className="mb-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filter by tags</CardTitle>
                {activeTag && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTagClick(activeTag)}
                    className="h-auto py-1 text-xs"
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <Badge variant={activeTag === tag ? "active" : "outline"}>
                      {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-12">
            <section>
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-full overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-6">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="mb-2 h-6 w-full" />
                      <Skeleton className="mb-2 h-6 w-3/4" />
                      <Skeleton className="mb-3 h-4 w-full" />
                      <Skeleton className="mb-3 h-4 w-5/6" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        ) : posts.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-gray-500">
              {searchQuery || activeTag
                ? "No posts found matching your criteria."
                : "No posts yet."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {!searchQuery && !activeTag && (
              <section>
                <CardHeader className="px-0 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Latest Posts</CardTitle>
                    <Badge variant="outline" className="text-sm font-normal">
                      {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                    </Badge>
                  </div>
                </CardHeader>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedPosts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
                        {post.imageUrl && (
                          <div className="aspect-video w-full overflow-hidden bg-gray-100">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          {post.tags.length > 0 && (
                            <div className="mt-2 mb-4 flex flex-wrap gap-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <button
                                  key={tag}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTagClick(tag);
                                  }}
                                  className="transition-transform hover:scale-105 active:scale-95"
                                >
                                  <Badge variant="secondary" className="text-xs font-medium cursor-pointer">
                                    {tag}
                                  </Badge>
                                </button>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          <CardTitle className="mb-2 text-lg font-bold leading-tight line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <p className="mb-3 line-clamp-2 text-sm text-gray-600 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <CardDescription className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/"
                    searchParams={searchParams}
                  />
                )}
              </section>
            )}

            {(searchQuery || activeTag) && (
              <section>
                <CardHeader className="px-0 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {activeTag ? `Posts tagged "${activeTag}"` : "Search Results"}
                    </CardTitle>
                    <Badge variant="outline" className="text-sm font-normal">
                      {posts.length} {posts.length === 1 ? 'result' : 'results'}
                    </Badge>
                  </div>
                </CardHeader>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedPosts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
                        {post.imageUrl && (
                          <div className="aspect-video w-full overflow-hidden bg-gray-100">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          {post.tags.length > 0 && (
                            <div className="mt-2 mb-4 flex flex-wrap gap-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <button
                                  key={tag}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTagClick(tag);
                                  }}
                                  className="transition-transform hover:scale-105 active:scale-95"
                                >
                                  <Badge variant="secondary" className="text-xs font-medium cursor-pointer">
                                    {tag}
                                  </Badge>
                                </button>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          <CardTitle className="mb-2 text-lg font-bold leading-tight line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <p className="mb-3 line-clamp-2 text-sm text-gray-600 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <CardDescription className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/"
                    searchParams={searchParams}
                  />
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
