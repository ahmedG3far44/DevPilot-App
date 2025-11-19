import type { ReactNode } from "react";

export const Container = ({ children }: { children: ReactNode }) => {
  return <div className="w-3/4 m-auto p-4 ">{children}</div>;
};
