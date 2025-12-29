"use client";
import React from "react";
import { motion } from "framer-motion";
import BookRecycle from "./bookRecycle";

const Page = () => {
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