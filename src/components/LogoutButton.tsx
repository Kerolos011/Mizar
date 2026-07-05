"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "جاري الخروج..." : "تسجيل الخروج"}
    </button>
  );
}