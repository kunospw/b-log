import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const POSTS_COLLECTION = "posts";

// Convert Firestore timestamp to ISO string
function timestampToISO(timestamp: any): string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
}

// Convert Firestore document to Post
function docToPost(docData: any): Post {
  return {
    id: docData.id,
    title: docData.title || "",
    content: docData.content || "",
    excerpt: docData.excerpt || "",
    imageUrl: docData.imageUrl,
    tags: docData.tags || [],
    createdAt: timestampToISO(docData.createdAt),
    updatedAt: timestampToISO(docData.updatedAt),
  };
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push(docToPost({ id: doc.id, ...doc.data() }));
    });
    
    return posts;
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, id);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      return docToPost({ id: postSnap.id, ...postSnap.data() });
    }
    
    return null;
  } catch (error) {
    console.error("Error getting post:", error);
    return null;
  }
}

export async function createPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post> {
  try {
    const now = Timestamp.now();
    const postsRef = collection(db, POSTS_COLLECTION);
    
    const docRef = await addDoc(postsRef, {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl || null,
      tags: post.tags || [],
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
      tags: post.tags || [],
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function updatePost(id: string, updates: Partial<Omit<Post, "id" | "createdAt">>): Promise<Post | null> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    await updateDoc(postRef, updateData);
    
    // Fetch updated post
    return await getPostById(id);
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, id);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
}

export async function searchPosts(queryText: string): Promise<Post[]> {
  try {
    const allPosts = await getAllPosts();
    const lowerQuery = queryText.toLowerCase();
    
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}

export async function filterPostsByTag(tag: string): Promise<Post[]> {
  try {
    const allPosts = await getAllPosts();
    return allPosts.filter((post) =>
      post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  } catch (error) {
    console.error("Error filtering posts by tag:", error);
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const allPosts = await getAllPosts();
    const tagSet = new Set<string>();
    allPosts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  } catch (error) {
    console.error("Error getting tags:", error);
    return [];
  }
}
