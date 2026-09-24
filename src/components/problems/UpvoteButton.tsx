"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";

interface UpvoteButtonProps {
  problemId: string;
  initialCount: number;
  initialUpvoted: boolean;
}

export default function UpvoteButton({
  problemId,
  initialCount,
  initialUpvoted,
}: UpvoteButtonProps) {
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    setPopping(true);
    setTimeout(() => setPopping(false), 300);

    const res = await fetch(`/api/problems/${problemId}/upvote`, {
      method: "POST",
    });
    if (res.status === 401) {
      router.push(`/login?redirect=/problems/${problemId}`);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setUpvoted(data.upvoted);
      setCount((c) => (data.upvoted ? c + 1 : c - 1));
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 min-h-[44px] text-sm select-none ${
        upvoted
          ? "bg-gradient-to-r from-[#14B8A6] to-[#6366F1] text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:scale-[1.03] active:scale-[0.97]"
          : "bg-white text-gray-700 border-1.5 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600 shadow-sm active:scale-[0.97]"
      }`}
    >
      <ThumbsUp
        size={17}
        className={`transition-transform ${
          popping ? "animate-upvote-pop" : "group-hover:scale-110"
        } ${upvoted ? "text-white" : "text-indigo-600"}`}
      />
      <span className="font-extrabold">{count}</span>
      <span className="font-semibold">{upvoted ? "Upvoted" : "Upvote"}</span>
    </button>
  );
}
