'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Fractal Self-Awareness Intelligence Router
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of AI with our multi-layered cognitive enhancement system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[4, 5, 6, 7].map((layer) => (
            <Link
              key={layer}
              href={`/layers/layer${layer}`}
              className="group p-6 rounded-lg transition-all duration-300 transform hover:scale-105 bg-gray-800 hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                  <span className="text-xl font-bold">{layer}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Layer {layer}</h2>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Learn more about this layer</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
} 