"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");

  function handleLogin() {
    console.log({ 

      email, 
      pass

    });

    // pretend backend validated
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4">
        <h1 className="text-2xl text-center font-bold">Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full border border-white/20 hover:bg-white hover:text-black transition py-3 rounded"
        >
          Log In
        </button>
        <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/signIn" className="text-white font-medium hover:underline">
              Sign in
            </Link>
        </div>
      </div>
    </div>
  );
}