"use client";
import React from "react";
import { motion } from "framer-motion";
import FacilityMap from "./Efacility";

// Note: For SEO metadata in Next.js 14 app directory, 
// create a separate metadata export in a server component or layout
const Page = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="">
          <FacilityMap />
        </div>
      </motion.div>
    </>
  );
};

export default Page;
