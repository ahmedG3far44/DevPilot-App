import { useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { RepoCard } from "@/components/repo/RepoCard";

import Spinner from "@/components/ui/spinner";
import ErrorMessage from "@/components/ui/error";

const UserPage = () => {
  const { error, repos, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredRepos = repos
    ? repos?.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (loading) return <Spinner size={"xl"} />;

  if (error)
    return (
      <ErrorMessage
        message={
          error ||
          "something went wrong please reload  this page, or navigate to another page!!"
        }
      />
    );

  return (
    <>
      <div className="my-10">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 border border-accent focus:border-transparent"
        />
        {searchQuery && (
          <p className="mt-2 text-sm ">
            Found {filteredRepos?.length}{" "}
            {filteredRepos?.length === 1 ? "repository" : "repositories"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filteredRepos?.length > 0 ? (
          filteredRepos?.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              showDeployButton={true}
              onDeploy={() => {}}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 ">
            No repositories found matching "{searchQuery}"
          </div>
        )}
      </div>
    </>
  );
};

export default UserPage;
