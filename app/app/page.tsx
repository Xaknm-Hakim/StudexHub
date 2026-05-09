"use client";

import Link from "next/link";

export default function MainPage() {

    return(

        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4">        

                    <h1 className="text-2xl text-center font-bold">Yo, welcome to StudexHub</h1>
                    <p className="text-sm text-center text-grey-400">Academic management for students</p>
                    
                    <div className="text-center text-sm text-gray-400">
                      {"what you wanna do twin? "}
                      <Link href="/signIn" className="text-white font-medium hover:underline">
                       {" Sign in"}
                      </Link>
                        {" or "}
                      <Link href="/login" className="text-white font-medium hover:underline">
                        {"Log in"}
                      </Link>
                    </div>
            </div>
        </main>
    );
}
