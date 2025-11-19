import { LucideLoader2 } from "lucide-react";

const Spinner = ({
  size,
}: {
  size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}) => {
  function getSize(size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl") {
    switch (size) {
      case "sm":
        return 10;
      case "md":
        return 15;
      case "lg":
        return 25;
      case "xl":
        return 30;
      case "2xl":
        return 50;
      case "3xl":
        return 80;
    }
  }
  return (
    <div className="min-h-screen flex items-start justify-center mt-40">
      <LucideLoader2 size={getSize(size)} className="animate-spin" />
    </div>
  );
};

export default Spinner;
