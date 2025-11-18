export interface IUser {
  _id:string;
  githubId:string;
  name:string;
  username:string;
  avatar_url:string;
  bio:string
  repos_url:string;
  location:string;
  isAdmin:boolean;
  blocked:boolean;
  createdAt?:Date;
  updatedAt?:Date;
}


export interface RepositoryLicense {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
    node_id: string;
  }
  
  /**
   * GitHub Repository Owner
   */
  export interface RepositoryOwner {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    type: 'User' | 'Organization';
  }
  
  /**
   * Main GitHub Repository Interface
   * Based on GitHub REST API v3 response
   */
  export interface Repository {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: RepositoryOwner;
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    clone_url: string;
    git_url: string;
    ssh_url: string;
    svn_url: string;
    homepage: string | null;
    size: number; // Size in KB
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions: boolean;
    forks_count: number;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: RepositoryLicense | null;
    topics: string[];
    visibility: 'public' | 'private' | 'internal';
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
  }
  
  /**
   * Simplified Repository for UI display
   */
  export interface RepositoryCardData {
    id: number;
    name: string;
    clone_url: string;
    size: number;
    description: string | null;
    language: string | null;
    license: {
      name: string;
    } | null;
    // Additional useful fields
    full_name?: string;
    html_url?: string;
    private?: boolean;
    stargazers_count?: number;
    forks_count?: number;
    updated_at?: string;
    owner?: {
      login: string;
      avatar_url: string;
    };
  }