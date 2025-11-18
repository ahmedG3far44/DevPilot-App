import { useState } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { RepoCard } from "@/components/repo/RepoCard";

import ProtectedRoute from "@/components/ProtectedRoute";

const UserPage = () => {
  const { error, repos } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error)
    return (
      <div className="text-red-500 p-2 rounded-md shadow-sm bg-red-200">
        {error}
      </div>
    );

  return (
    <>
      <Header />

      <div className="my-10">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredRepos.length}{" "}
            {filteredRepos.length === 1 ? "repository" : "repositories"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredRepos.length > 0 ? (
          filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              showDeployButton={true}
              onDeploy={() => {}}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No repositories found matching "{searchQuery}"
          </div>
        )}
      </div>
    </>
  );
};

export default UserPage;
