"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSocialPostsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/social-management");
  }, [router]);

  return null;
}
