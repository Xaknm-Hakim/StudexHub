"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [name, setName] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem("name");
        if (storedName) {
            setName(storedName);
        }
    }, []);
    return(

        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4">        

                    <h1 className="text-2xl text-center font-bold">Dashboard and Home!</h1>
                    <p className="text-center text-grey-400"> how are you doing? {name}</p>

            </div>
        </main>
    );
}