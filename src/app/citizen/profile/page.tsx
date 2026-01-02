"use client";
import React from "react";
import { motion } from "framer-motion";
import Profile from "./Profile";

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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Profile />
    </motion.div>
  );
};

export default Page;
