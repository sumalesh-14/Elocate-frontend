"use client";
import React from "react";
import { motion } from "framer-motion";
import BookRecycle from "./bookRecycle";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../sign-in/auth";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/sign-in");
    }
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <BookRecycle />
    </motion.div>
  );
};

export default Page;