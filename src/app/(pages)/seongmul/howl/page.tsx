"use client";

import { useRouter } from "next/navigation";

export default function HowlSeongmulPage() {
  // rootに遷移する
  const router = useRouter();
  console.log("準備中です");
  router.push("/");
}
