"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroPage() {

    const router =  useRouter()
    const handleLogOut=() => {
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
      router.push("/login")
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center py-4 px-8">
          <h1 className="text-2xl font-bold">Code.Ai</h1>
          <div className="space-x-6 hidden md:flex">
            <a href="#" className="text-gray-600 hover:text-black">Product</a>
            <a href="#" className="text-gray-600 hover:text-black">Teams</a>
            <a href="#" className="text-gray-600 hover:text-black">Individuals</a>
            <a href="#" className="text-gray-600 hover:text-black">Download</a>
            <a href="#" className="text-gray-600 hover:text-black">Pricing</a>
          </div>

          <div className="space-x-4">
          <button 
            className="bg-transparent text-black  px-4 py-2 rounded-md border border-blue-500 cursor-pointer"
            onClick={handleLogOut}
          >
            Logout
          </button>

          </div>
        </nav>
  
        {/* Hero Section */}
        <section className="text-center max-w-4xl mt-12">
          <h2 className="text-3xl font-bold leading-tight">
            Manage projects and code  from <br /> beginning to end with file and folder based structure
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            With Code.Ai's  connected workspace, get your projects to the finish line faster and with less context switching.
          </p>
          <div className="mt-6 space-x-4">
            <button 
            onClick={() =>router.push("/execute")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg cursor-pointer">
              Get Code.AI 
            </button>
            <button
            onClick={() => router.push("/community")}
            className="border border-gray-400 text-black px-6 py-3 rounded-md text-lg cursor-pointer">
              Our Community
            </button>
          </div>
        </section>
  
        {/* Illustration */}
        <div className="mt-12">
          <Image
            src="/hero.avif"
            height={500}
            width={500}
            alt="Hero Illustration"
            className="max-w-xl"
          />
        </div>
      </div>
    );
  }
  