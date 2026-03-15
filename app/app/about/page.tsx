"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AboutPage() {
    const router = useRouter();

    return (
    <>
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-8 py-16 space-y-16">
      <div className="border-t border-zinc-700 pt-4">
        <h2 className="text-xl font-semibold">About Us</h2>
        <p className="text-zinc-400">
          A group of 4 Idiots making a website basing around what students needs.
        </p>
      </div>
      <div className="bg-zinc-900 rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-4">About This Project</h1>
        <p className="text-zinc-400 leading-relaxed">
BaruasHub is a static-first collaborative web project designed to simulate real-world software engineering workflow, infrastructure planning, and DevOps practices.

This project functions as a structured technical playground where we practice disciplined development, clear documentation, and defined engineering roles — while building a scalable and meaningful platform.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs sm:text-sm">Next.js</span>
          <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs sm:text-sm">Prisma</span>
          <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs sm:text-sm">PostgreSQL</span>
          <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs sm:text-sm">TailwindCSS</span>
          <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs sm:text-sm">Typescript</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/*copy and paste this below to create another profile */}
              <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full 
                  overflow-hidden mb-4">
                    <Image
                    src="/pfp Zerpo.jpg"
                    alt="Zerpo"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"/>
                     </div>
            <h2 className="text-xl font-semibold">Zerpo (Zuddin)</h2>
            <p className="text-sm text-zinc-400 mb-3">Lead Frontend Developer</p>

            <p className="text-sm text-zinc-400">
              Responsible for UI design, dashboard logic, and frontend architecture.
            </p>

            <div className="flex gap-3 mt-4">
              <a 
              href={"https://github.com/Zerpo-Zero"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 px-3 py-1 rounded text-sm">
                GitHub
              </a>
              <button className="bg-zinc-800 px-3 py-1 rounded text-sm">
                LinkedIn
              </button>
                  
                    </div>
                  </div>
                </div>
        {/* up until here*/}        

              <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300">
                <div className="flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-full 
                  overflow-hidden mb-4">
                    <Image
                    src="/pfp hakim v2.jpg"
                    alt="Hakim"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"/>
                     </div>
            

            <h2 className="text-xl font-semibold">Hakimz</h2>
            <p className="text-sm text-zinc-400 mb-3">Infrastructure/Backend Engineer</p>

            <p className="text-sm text-zinc-400">
              Responsible for backend development and infrastructure deployment
            </p>

            <div className="flex gap-3 mt-4">
              <a 
              href={"https://github.com/whateverItIs-26"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 px-3 py-1 rounded text-sm">
                GitHub
              </a>
              <button className="bg-zinc-800 px-3 py-1 rounded text-sm">
                LinkedIn
              </button>
                  
                    </div>
                  </div>
                </div>

              <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300">
                <div className="flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-full 
                  overflow-hidden mb-4">
                    <Image
                    src="/default pfp.jpg"
                    alt="Hakim"
                    width={96}
                    height={96}/>
                    </div>
            

            <h2 className="text-xl font-semibold">Afham</h2>
            <p className="text-sm text-zinc-400 mb-3">Frontend Dev</p>

            <p className="text-sm text-zinc-400">
              Responsible for suggesting ideas to add
            </p>

            <div className="flex gap-3 mt-4">
              <button className="bg-blue-600 px-3 py-1 rounded text-sm">
                GitHub
              </button>
              <button className="bg-zinc-800 px-3 py-1 rounded text-sm">
                LinkedIn
              </button>
                  
                    </div>
                  </div>
                </div>

              <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300">
                <div className="flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-full 
                  overflow-hidden mb-4">
                    <Image
                    src="/default pfp.jpg"
                    alt="Hakim"
                    width={96}
                    height={96}/>
                    </div>
            

            <h2 className="text-xl font-semibold">Faiz</h2>
            <p className="text-sm text-zinc-400 mb-3">QA Engineer</p>

            <p className="text-sm text-zinc-400">
              Assuring the work quality from each members
            </p>

            <div className="flex gap-3 mt-4">
              <button className="bg-blue-600 px-3 py-1 rounded text-sm">
                GitHub
              </button>
              <button className="bg-zinc-800 px-3 py-1 rounded text-sm">
                LinkedIn
              </button>
                  
                    </div>
                  </div>
                </div>
</div>
</div>
</main>
      <div className="w-full flex flex-col items-center gap-4"> {/* this is used for centering the items and is only for this button only*/}

      <button
      onClick={() => router.push("/dashboard")}
      className="px-4 py-2 bg-black font-semibold text-white border-2 border-white rounded-full cursor-pointer hover:bg-white hover:text-black transition duration-300 ease-in-out ">
      ← Back to Dashboard
      </button>
      </div>
    </>
  );
}