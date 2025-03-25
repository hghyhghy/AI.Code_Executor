'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy } from "react-icons/fa";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ShareCode() {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [shareLink, setShareLink] = useState("");
    const [username, setUsername] = useState("");
    const [sharedCount, setSharedCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = Cookies.get("token");
                if (!token) {
                    toast.error("Token is not found");
                    return;
                }
                const res = await axios.get("http://localhost:3001/share/status", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsername(res.data.username);
                setSharedCount(res.data.sharedCodeCount);
            } catch (error) {
                console.error("Error fetching user details:", error);
                toast.error("Failed to load user details.");
            }
        };
        fetchUserDetails();
    }, []);

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
        <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 py-8 px-4">
            <ToastContainer />

            {/* Header Section */}
            <div className="w-full max-w-4xl bg-blue-500 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl font-bold">Share and Control</h1>
                    <p className="text-xl mt-2 text-gray-200">Your Document</p>
                    <h2 className="mt-4 text-lg font-semibold">
                        Welcome, <span className="bg-gray-800 px-4 py-2 rounded-md">{username}</span>
                    </h2>
                    <p className="text-sm mt-2 text-gray-300">Shared Code Count: {sharedCount}</p>
                </div>
                <div className="md:w-1/2 flex justify-center mt-4 md:mt-0">
                    <Image src="/share.webp" width={250} height={250} alt="Share" />
                </div>
            </div>

            {/* Share Link Box */}
            {shareLink && (
                <div className="w-full max-w-xl mt-6 bg-green-100 border border-green-300 p-4 rounded-lg flex items-center shadow-md">
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
                        <FaRegCopy />
                    </button>
                </div>
            )}

            {/* Permission Info */}
            <div className="w-full max-w-xl mt-4 bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-gray-700 font-medium">Permissions</h2>
                <p className="text-gray-500 text-sm mt-1">🔒 Only people you add can open this link</p>
            </div>

            {/* Code Input */}
            <div className="w-full max-w-xl mt-6">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code..."
                    className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-800"
                    rows={6}
                />
            </div>

            {/* Language Selection & Output */}
            <div className="w-full max-w-xl flex flex-col md:flex-row mt-4 gap-4">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full md:w-1/3 p-2 border rounded-md shadow-sm text-gray-800"
                >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                </select>

                <textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="Output (optional)"
                    className="w-full md:w-2/3 p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-800"
                    rows={3}
                />
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4 mt-6">
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
