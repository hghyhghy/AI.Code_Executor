"use client";

import AuthForm from "@/components/Authform";
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 text-black">
      <AuthForm type="login" />
    </div>
  );
}
