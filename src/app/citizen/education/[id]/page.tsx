import React from "react";
import Blog from "./Blog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  return (
    <>
      <div>
        <Blog id={resolvedParams.id} />
      </div>
    </>
  );
};

export default Page;
