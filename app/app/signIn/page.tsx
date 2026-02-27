"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [invite, setInvite] = useState<string>("");

  
 async function handleSignup() {
  const res = await fetch("/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password: pass,     // backend expects "password"
      inviteCode: invite, // backend expects "inviteCode"
    }),
  });

  const data = await res.json();

  if (res.ok) {
    router.push("/login"); // after signup, go to login
  } else {
    alert(data.error);
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4">
        <h1 className="text-2xl text-center font-bold">Register to BaruasHub</h1>

      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 bg-zinc-800 rounded"
      />

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 bg-zinc-800 rounded"
      />

      <input
        type="password"
        placeholder="Enter password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="w-full p-3 bg-zinc-800 rounded"
      />
      
      <input
        type="text"
        placeholder="Enter invite code"
        value={invite}
        onChange={(e) => setInvite(e.target.value)}
        className="w-full p-3 bg-zinc-800 rounded"
      />

      <button
        onClick={handleSignup}
        className="w-full border border-white/20 hover:bg-white hover:text-black transition py-3 rounded"
      >
        Submit
      </button>
        <div className="text-center text-sm text-gray-400">
            Have an account?{" "}
            <Link href="/login" className="text-white font-medium hover:underline">
              Log in
            </Link>
        </div>
      </div>
    </div>
  );
}