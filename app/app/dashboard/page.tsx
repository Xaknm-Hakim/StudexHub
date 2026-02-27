"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    return(
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4">        

                <h1 className="text-2xl text-center font-bold">Dashboard and Home!</h1>
                <p className="text-center text-grey-400"> how are you doing? </p>

                
                <div className="text-center"> {/* This div is to make the redirects/buttons */} 
                <button
                onClick={() => router.push("/assignments")} 
                className="px-4 py-2 bg-white text-black rounded ">
                    go to assignments
                
                </button>
                </div>
            </div>
        </main>
    );
}