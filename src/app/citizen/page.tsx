"use client";
import React from "react";
import { useEffect, useState } from "react";
import Home from "./Components";
import { isAuthenticated } from "./sign-in/auth";

/* eslint-disable react/no-unescaped-entities */
export default function App() {

  return (
    <>
      <Home />
    </>
  );
}
