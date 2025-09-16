"use client";

import React, { useState, useCallback, useEffect } from "react";

import { Loader2 } from "lucide-react";

export default function Home() {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      Loading...
      <Loader2 className="animate-spin" />
      Redirecting... to dashboard
    </div>
  );
}
