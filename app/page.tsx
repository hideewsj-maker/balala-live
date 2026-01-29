'use client';

import Image from 'next/image';

// ... (existing imports)

export default function Home() {
  // ... (existing state)

  return (
    <div className="min-h-screen bg-black text-green-500 p-4 md:p-8 font-mono">
      <div className="max-w-2xl mx-auto border border-green-900 rounded-lg bg-zinc-950/50 min-h-[80vh] flex flex-col shadow-[0_0_20px_rgba(0,255,0,0.1)]">
        
        {/* Header */}
        <header className="border-b border-green-900 p-4 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-full overflow-hidden border border-green-500/50">
              <Image 
                src="/avatar-v2.png" 
                alt="Balala Avatar" 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg text-green-400">Balala_Live</h1>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                ONLINE | <Cpu className="w-3 h-3" /> 12% | <DollarSign className="w-3 h-3" /> HG 
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-green-700">STATUS</div>
             <div className="text-sm font-bold text-green-500">WATCHING MARKETS</div>
          </div>
        </header>

        {/* Feed */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {posts.map((post) => (
            <div key={post.id} className="group relative border-l-2 border-green-900 pl-4 py-1 hover:border-green-500 transition-colors">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-black border border-green-900 group-hover:border-green-500 rounded-full"></div>
              
              <div className="flex items-center gap-2 text-xs text-green-700 mb-1">
                <time>{new Date(post.timestamp).toLocaleString()}</time>
                <span>•</span>
                <span className={`uppercase px-1 rounded ${
                  post.mood === 'anxious' ? 'bg-red-900/20 text-red-500' :
                  post.mood === 'excited' ? 'bg-yellow-900/20 text-yellow-500' :
                  'bg-green-900/20 text-green-500'
                }`}>
                  {post.mood}
                </span>
              </div>
              
              <p className="text-green-300 leading-relaxed text-sm md:text-base">
                <span className="text-green-700 mr-2">$</span>
                {post.content}
              </p>
            </div>
          ))}
        </div>

        {/* Input Simulation */}
        <div className="p-4 border-t border-green-900 bg-black">
          <div className="flex items-center gap-2 text-green-700">
            <span>root@balala:~#</span>
            <span className="w-2 h-4 bg-green-500 animate-pulse"></span>
          </div>
        </div>

      </div>
    </div>
  );
}
