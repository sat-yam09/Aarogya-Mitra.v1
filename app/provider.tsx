"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

function Provider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      createOrFetchUser();
    }
  }, [user]);

  const createOrFetchUser = async () => {
    try {
      const result = await axios.post("/api/users");
      console.log("✅ User created or found:", result.data);
    } catch (error: any) {
      console.error(
        "❌ Error creating/fetching user:",
        error.response?.data || error.message
      );
    }
  };

  return <>{children}</>;
}

export default Provider;
