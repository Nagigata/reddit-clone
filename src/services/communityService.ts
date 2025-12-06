const COMMUNITY_API_BASE_URL = process.env.NEXT_PUBLIC_COMMUNITY_API_BASE_URL;

export interface CommunityType {
  id: number;
  name?: string;
  type?: string;
  description?: string;
}

export interface CommunityDto {
  id?: number;
  community_id: number;
  name: string;
  type_id?: number;
  type?: string; 
  created_by?: number;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  members?: number;
  status?: string;
  communityType?: {
    type_id: number;
    type: string;
    description?: string;
  };
}

export interface MemberDto {
  id: number;
  community_id: number;
  user_id: number;
  role: string;
  status: string;
  joined_at?: string;
  created_at?: string;
}

export interface CreateCommunityPayload {
  name: string;
  created_by: number;
  type_id: number;
  avatar?: string;
}

export interface UpdateCommunityPayload {
  name?: string;
  type_id?: number;
  avatar?: string;
  created_by?: number;
}

class CommunityService {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${COMMUNITY_API_BASE_URL}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    if (!(options?.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
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

  // ===== Communities =====
  async getCommunities(params?: {
    limit?: number;
    offset?: number;
    q?: string;
  }): Promise<CommunityDto[]> {
    const search = new URLSearchParams();
    if (params?.limit !== undefined) search.append("limit", String(params.limit));
    if (params?.offset !== undefined) search.append("offset", String(params.offset));
    if (params?.q) search.append("q", params.q);

    const qs = search.toString();
    const endpoint = qs ? `/community?${qs}` : `/community`;
    return this.request<CommunityDto[]>(endpoint, { method: "GET" });
  }

  async getCommunityById(id: number | string): Promise<CommunityDto> {
    return this.request<CommunityDto>(`/community/${id}`, { method: "GET" });
  }

  async createCommunity(payload: CreateCommunityPayload): Promise<CommunityDto> {
    return this.request<CommunityDto>("/community", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateCommunity(
    id: number | string,
    payload: UpdateCommunityPayload
  ): Promise<CommunityDto> {
    return this.request<CommunityDto>(`/community/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteCommunity(id: number | string): Promise<void> {
    await this.request<void>(`/community/${id}`, { method: "DELETE" });
  }

  async uploadCommunityAvatar(
    id: number | string,
    file: File
  ): Promise<CommunityDto> {
    const formData = new FormData();
    formData.append("avatar", file);
    return this.request<CommunityDto>(`/community/${id}/upload-avatar`, {
      method: "POST",
      body: formData,
    });
  }

  async searchCommunities(q: string): Promise<CommunityDto[]> {
    return this.request<CommunityDto[]>(`/community/search?q=${encodeURIComponent(q)}`, {
      method: "GET",
    });
  }

  async getTopCommunities(): Promise<CommunityDto[]> {
    return this.request<CommunityDto[]>("/community/top-community", {
      method: "GET",
    });
  }

  async getJoinedCommunities(userId: number | string): Promise<CommunityDto[]> {
    return this.request<CommunityDto[]>(
      `/community/joined-community/${userId}`,
      { method: "GET" }
    );
  }

  async getCommunitiesByCreated(createdBy: number): Promise<CommunityDto[]> {
    return this.request<CommunityDto[]>("/community/by-created", {
      method: "GET",
      body: JSON.stringify({ created_by: createdBy }),
    });
  }

  // ===== Members =====
  async joinCommunity(payload: {
    community_id: number;
    user_id: number;
    role?: string;
    status?: string;
  }): Promise<MemberDto> {
    console.log("🚀 ~ CommunityService ~ joinCommunity ~ payload.status:", payload.status)
    const body = {
      ...payload,
      role: payload.role ?? "member",
      status: (payload.status ?? "APPROVED").toUpperCase(),
    };

    return this.request<MemberDto>("/community-member/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getCommunityMembers(
    communityId: number | string
  ): Promise<MemberDto[]> {
    const data = await this.request<{ members?: MemberDto[] }>(
      `/community-member/${communityId}`,
      {
        method: "GET",
      }
    );
    return data?.members ?? [];
  }

  async getPendingMembers(
    communityId: number | string
  ): Promise<MemberDto[]> {
    const data = await this.request<{ members?: MemberDto[] }>(
      `/community-member/pending/${communityId}`,
      {
        method: "GET",
      }
    );
    return data?.members ?? [];
  }

  async approveMember(
    communityId: number | string,
    userId: number | string
  ): Promise<MemberDto> {
    return this.request<MemberDto>(
      `/community-member/${communityId}/approve-member/${userId}`,
      { method: "PATCH" }
    );
  }

  async rejectMember(
    communityId: number | string,
    userId: number | string
  ): Promise<void> {
    await this.request<void>(
      `/community-member/${communityId}/reject-member/${userId}`,
      { method: "DELETE" }
    );
  }

  // ===== Types =====
  async getCommunityTypes(): Promise<CommunityType[]> {
    return this.request<CommunityType[]>("/community-type", { method: "GET" });
  }
}

export const communityService = new CommunityService();


