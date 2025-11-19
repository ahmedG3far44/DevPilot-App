import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitFork,
  Star,
  Code2,
  Scale,
  HardDrive,
  ExternalLink,
  GitBranch,
  Lock,
  LucideExternalLink,
} from "lucide-react";
import type { RepositoryCardData } from "@/types/repository";
import { Link, useNavigate } from "react-router-dom";

interface RepoCardProps {
  repo: RepositoryCardData;
  onDeploy?: (repo: RepositoryCardData) => void;
  showDeployButton?: boolean;
}

export function RepoCard({ repo }: RepoCardProps) {
  const navigate = useNavigate();
  // Format size from KB to human-readable
  const formatSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    if (sizeInKB < 1024 * 1024) return `${(sizeInKB / 1024).toFixed(2)} MB`;
    return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-secondary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">{repo.name}</CardTitle>
              {repo.private && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              )}
            </div>
            {repo.full_name && (
              <CardDescription className="text-sm text-muted-foreground">
                {repo.full_name}
              </CardDescription>
            )}
          </div>
          {repo.html_url && (
            <Button variant="ghost" size="icon" asChild>
              <Link
                to={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {repo.description || "No description provided"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>{repo.language}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4" />
            <span>{formatSize(repo.size)}</span>
          </div>

          {repo.license && (
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>{repo.license.name}</span>
            </div>
          )}

          {repo.stargazers_count !== undefined && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              <span>{repo.stargazers_count}</span>
            </div>
          )}

          {repo.forks_count !== undefined && (
            <div className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4" />
              <span>{repo.forks_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <code className="text-xs flex-1 truncate">{repo.clone_url}</code>
          {/* <Link
            to={`/project/${repo.name.toLocaleLowerCase().trim()}`}
            className="h-6 px-2"
          >
            <LucideExternalLink size={20} />
          </Link> */}
        </div>

        <Button
          variant={"outline"}
          onClick={() =>
            navigate(`/deploy/${repo.name?.toLocaleLowerCase().trim()}`)
          }
          className="w-full py-2 px-4 rounedd-md border border-muted cursor-pointer hover:opacity-65 duration-300"
        >
          Deploy Repository
        </Button>
      </CardContent>
    </Card>
  );
}
