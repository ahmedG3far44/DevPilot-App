import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./card";

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen flex items-start justify-center gap-2 mt-40">
      <Card className="text-center px-4 py-8">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto " />
        <h2 className="text-xl font-bold text-primary">
          Failed to Load Project
        </h2>
        <p className="text-muted-foreground text-sm mb-2">
          {message || "Project not found"}
        </p>
        <Link
          to={"/"}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-65 duration-300  hover:bg-red-800"
        >
          Back to Home
        </Link>
      </Card>
    </div>
  );
};

export default ErrorMessage;
