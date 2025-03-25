'use client';
import { useState,useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy } from "react-icons/fa";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ShareCode() {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [shareLink, setShareLink] = useState("");
    const [username, setUsername] = useState("")
    const [sharedCount, setSharedCount] = useState(0)
    const router = useRouter();

    useEffect(() => {
        
        const fetchUserDetails=async ()=>{
                try {
                    const token = Cookies.get("token")
                    if(!token){
                        toast.error("token  is not found ")
                        return
                    }
                    const res=   await axios.get("http://localhost:3001/share/status",{
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    })
                    setUsername(res.data.username)
                    setSharedCount(res.data.sharedCodeCount)
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    toast.error("Failed to load user details.");
                }
        };
        fetchUserDetails()
    },[]);

    const handleShare = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                toast.error("You must be logged in to share code.");
                return;
            }

            const res = await axios.post("http://localhost:3001/share/set", {
                code, language, output
            }, { headers: { Authorization: `Bearer ${token}` } });

            setShareLink(res.data.link);
            toast.success("Code shared successfully");
        } catch (error) {
            toast.error("Failed to share code");
        }
    };

    const handleCopy = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            toast.success("Link copied to clipboard");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <ToastContainer />
            <div className="w-full max-w-xl bg-blue-100 border border-blue-300 p-4 rounded-lg text-center">
                <h2 className="text-lg font-medium text-gray-800">
                    Welcome, <span className="font-semibold">{username || "Guest"}</span>
                </h2>
                <p className="text-gray-600">Total Shared Codes: <span className="font-semibold">{sharedCount}</span></p>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Share document</h1>

            {/* Share Box */}
            {shareLink && (
                <div className="w-full max-w-xl bg-green-100 border border-green-300 p-4 rounded-lg flex items-center">
                    <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 p-2 bg-transparent text-gray-800 outline-none"
                    />
                    <button
                        onClick={handleCopy}
                        className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    >
                        Copy link
                    </button>
                </div>
            )}

            {/* Permissions */}
            <div className="w-full max-w-xl mt-4 bg-white p-4 rounded-lg shadow">
                <h2 className="text-gray-700 font-medium">Permission</h2>
                <div className="flex items-center mt-2">
                    <span className="text-gray-600">🔒 Restricted</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">Only people you add can open this link</p>
            </div>

            {/* Code Input */}
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code..."
                className="w-full max-w-xl mt-4 p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-800"
                rows={6}
            />

            {/* Language Selection */}
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-3 p-2 border rounded-md shadow-sm text-gray-800"
            >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Go">Go</option>
            </select>

            {/* Output Input */}
            <textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Output (optional)"
                className="w-full max-w-xl mt-3 p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-800"
                rows={3}
            />

            {/* Buttons */}
            <div className="flex flex-row gap-3 mt-4">
                <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
                >
                    Share Code
                </button>
                <button
                    onClick={() => router.push("/execute")}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
