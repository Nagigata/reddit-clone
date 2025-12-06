const POST_API_BASE_URL = process.env.NEXT_PUBLIC_POST_API_BASE_URL;

export interface PostMedia {
  id?: number;
  post_id?: number;
  media_url: string;
  media_type: string;
}

export interface PostPayload {
  title: string;
  content?: string;
  subreddit_id?: number;
  media_type?: string;
  file?: any;
}

export interface PostItem {
  id: number;
  title: string;
  content: string | null;
  author_id: number;
  subreddit_id: number | null;
  slug: string;
  media?: PostMedia[];
  vote_count?: number;
  upvotes?: number;
  downvotes?: number;
  nr_of_comments?: string | number;
  my_vote?: number; 
  created_at?: string;
  author?: {
    id: number;
    email: string;
    full_name: string;
    avatar: string | null;
  };
  community?: {
    community_id: number;
    name: string;
    avatar: string | null;
    type: string;
    members_count: number;
  };
}

export interface PaginatedPostsResponse {
  posts: PostItem[];
  hasMore: boolean;
}

export interface SavedPost {
  id: number;
  user_id: number;
  post_id: number;
  created_at?: string;
}

export interface CommentPayload {
  post_id: number;
  content: string;
  parent_comment_id?: number;
}

export interface CommentItem {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  parent_comment_id?: number | null;
  created_at?: string;
  vote_count?: number;
  my_vote?: number; 
  author?: {
    id: number;
    email: string;
    full_name: string;
    avatar: string | null;
  };
}

export interface VotePayload {
  post_id?: number;
  comment_id?: number;
  vote_type: string | number;
}

export interface VoteItem {
  id: number;
  user_id: number;
  post_id?: number | null;
  comment_id?: number | null;
  vote_type: string | number;
}

class PostService {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${POST_API_BASE_URL}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (!(options?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const json = JSON.parse(text);
        message = json.message || json.error || message;
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    return response.json();
  }

  // Posts 
  async getPosts(
    limit: number = 10,
    offset: number = 0,
    subreddit_id?: number
  ): Promise<PaginatedPostsResponse> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    if (subreddit_id !== undefined) {
      params.append('subreddit_id', String(subreddit_id));
    }

    return this.request<PaginatedPostsResponse>(`/posts?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getPostById(id: number): Promise<PostItem> {
    return this.request<PostItem>(`/posts/${id}`, {
      method: 'GET',
    });
  }

  async createPost(payload: PostPayload): Promise<PostItem> {
    // Use FormData for multipart/form-data when file is present
    if (payload.file) {
      const formData = new FormData();
      formData.append('title', payload.title);
      
      if (payload.content) {
        formData.append('content', payload.content);
      }
      
      if (payload.subreddit_id !== undefined) {
        formData.append('subreddit_id', String(payload.subreddit_id));
      }
      
      if (payload.media_type) {
        formData.append('media_type', payload.media_type);
      }
      
      formData.append('file', payload.file);

      return this.request<PostItem>('/posts', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Use JSON for text-only posts
      return this.request<PostItem>('/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  async updatePost(id: number, payload: Partial<PostPayload>): Promise<PostItem> {
    return this.request<PostItem>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deletePost(id: number): Promise<void> {
    await this.request<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Saved posts
  async savePost(post_id: number): Promise<SavedPost> {
    return this.request<SavedPost>('/posts/save', {
      method: 'POST',
      body: JSON.stringify({ post_id }),
    });
  }

  async unsavePost(post_id: number): Promise<void> {
    await this.request<void>('/posts/saved', {
      method: 'DELETE',
      body: JSON.stringify({ post_id }),
    });
  }

  async getSavedPosts(): Promise<SavedPost[]> {
    return this.request<SavedPost[]>('/posts/saved', {
      method: 'GET',
    });
  }

  async getMySavedPost(post_id: number): Promise<SavedPost | null> {
    const params = new URLSearchParams({
      post_id: String(post_id),
    });
    return this.request<SavedPost | null>(`/posts/saved/mine?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Comments 
  async getComments(post_id: number = 0): Promise<CommentItem[]> {
    const params = new URLSearchParams({
      post_id: String(post_id),
    });
    return this.request<CommentItem[]>(`/comments/fetch?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getCommentReplies(comment_id: number): Promise<CommentItem[]> {
    const params = new URLSearchParams({
      comment_id: String(comment_id),
    });
    return this.request<CommentItem[]>(`/comments/fetch-replies?${params.toString()}`, {
      method: 'GET',
    });
  }

  async createComment(payload: CommentPayload): Promise<CommentItem> {
    return this.request<CommentItem>('/comments/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteComment(comment_id: number): Promise<void> {
    await this.request<void>('/comments/delete', {
      method: 'DELETE',
      body: JSON.stringify({ comment_id }),
    });
  }

  // Votes 
  async upsertVote(payload: VotePayload): Promise<VoteItem> {
    return this.request<VoteItem>('/votes/upsert', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyVote(params: { post_id?: number; comment_id?: number }): Promise<VoteItem | null> {
    const search = new URLSearchParams();
    if (params.post_id !== undefined) {
      search.append('post_id', String(params.post_id));
    }
    if (params.comment_id !== undefined) {
      search.append('comment_id', String(params.comment_id));
    }

    return this.request<VoteItem | null>(`/votes/my-vote?${search.toString()}`, {
      method: 'GET',
    });
  }
}

export const postService = new PostService();


