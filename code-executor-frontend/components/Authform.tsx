"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CiUser } from "react-icons/ci";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

export default function AuthForm({ type }: { type: "login" | "register" }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = type === "login" ? "auth/login" : "auth/register";
      const payload =
        type === "login" ? { name: formData.name, password: formData.password } : formData;

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, payload);

      localStorage.setItem("token", res.data.access_token);
      toast.success(type === "login" ? "Login successful!" : "Registration successful!");
      router.push("/execute");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Section (Form) */}
      <div className="w-1/2 h-full flex items-center justify-center bg-white p-8 shadow-lg">
        <div className="max-w-md w-full">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
            {type === "login" ? "Sign In" : "Sign Up"}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {type === "login" ? "Access your account" : "Join us to create your resume"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-lg">
            {type === "register" && (
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-lg" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
            )}
            <div className="relative">
              <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg" />
              <input
                type="name"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            <div className="relative">
              <RiLockPasswordFill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Processing..." : type === "login" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-4 text-gray-700">
            {type === "login" ? (
              <>
                Don't have an account?{" "}
                <button className="text-blue-600 hover:underline" onClick={() => router.push("/register")}>
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="text-blue-600 hover:underline" onClick={() => router.push("/login")}>
                  Login here
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Section (Text Animation) */}
      <div className="w-1/2 h-full flex items-center justify-center bg-gray-100 p-8">
        <div className="text-center animate-slideInRight">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-blue-600">Code.Editor</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Run and Debug  your <span className="text-blue-600 font-medium">Code </span> with us  in minutes.
            Choose from Languages and  import Your code to start over
          </p>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 1s ease-out;
        }
      `}</style>
    </div>
  );
}
