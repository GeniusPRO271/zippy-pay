"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { logout } from "@/app/actions/auth";
import { Spinner } from "./spinner";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={loading} className="cursor-pointer">
      {loading ?
        <>
          <Spinner />
          Logging out...
        </> :
        "Log Out"}
    </Button>
  );
}
