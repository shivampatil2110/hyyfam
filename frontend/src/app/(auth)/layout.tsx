"use client";
import { useAppDispatch } from "@/redux/store";
import { checkAuth } from "@/redux/features/authSlice";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!(searchParams.get("isLoggedIn") == "true")) {
      checkLogin();
    }
  }, [searchParams]);

  const checkLogin = async () => {
    let res = await dispatch(checkAuth());
    if (res.payload.code == 200) {
      router.push("/home");
    }
  };

  return (
    <div className="h-screen bg-gray-200 w-full font-inter">{children}</div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-200 w-full font-inter flex items-center justify-center">Loading...</div>}>
      <AuthContent>{children}</AuthContent>
    </Suspense>
  );
}