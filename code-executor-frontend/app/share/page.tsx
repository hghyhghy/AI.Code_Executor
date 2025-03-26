'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy } from "react-icons/fa";
import { IoShareOutline, IoLockClosedOutline, IoEyeOutline } from "react-icons/io5";
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
            <div className="w-full bg-blue-500 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl font-bold">Share and Control</h1>
                    <p className="text-xl mt-2 text-gray-200">Your Code</p>
                    <h2 className="mt-4 text-lg font-semibold">
                        Welcome, <span className="bg-gray-800 px-4 py-2 rounded-md">{username}</span>
                    </h2>
                    <h2 className="mt-4 text-lg font-semibold">
                    Shared Code Count:<span className="bg-gray-800 px-6 py-2 rounded-md ml-2">{sharedCount}</span>
                    </h2>
                </div>
                <div className="md:w-1/2 flex justify-center mt-4 md:mt-0">
                    <Image src="/share.webp" width={450} height={550} alt="Share" />
                </div>
            </div>

            {/* Features Section (Styled Like Screenshot) */}
            <div className="flex flex-col md:flex-row gap-6 mt-8">
                {/* Feature 1 */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
                    <div className="bg-blue-500 text-white p-4 rounded-full inline-block">
                        <IoShareOutline size={30} />
                    </div>
                    <p className="text-gray-700 mt-4">
                        Share your code and generate a unique link to distribute.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
                    <div className="bg-blue-500 text-white p-4 rounded-full inline-block">
                        <IoLockClosedOutline size={30} />
                    </div>
                    <p className="text-gray-700 mt-4">
                        Control who can view or modify your shared code.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
                    <div className="bg-blue-500 text-white p-4 rounded-full inline-block">
                        <IoEyeOutline size={30} />
                    </div>
                    <p className="text-gray-700 mt-4">
                        Track when someone views or interacts with your code.
                    </p>
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


            <div className=" w-1/2 p-5 bg-[#FFFFFF] rounded-md h-[38rem] mt-5 flex flex-row  gap-10">
                <div className=" bg-[#AD87E4] w-1/2  p-5 rounded-md h-[30rem] " >
                        <div className=" flex flex-col gap-2 mt-10">
                            <h2 className=" w-1/12 bg-[#C1A4E7] rounded-full text-white items-center  justify-center flex">✓</h2>

                            <p className=" font-normal  font-serif text-gray-100"> Lorem ipsum dolor sit amet   </p>
                            <p className=" font-sans text-sm"> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aspernatur, deleniti. </p>
                        </div>
                        <div className=" flex flex-col gap-2 mt-10">
                            <h2 className="w-1/12 bg-[#C1A4E7] rounded-full text-white items-center  justify-center flex ">✓</h2>

                            <p className=" font-normal  font-serif text-gray-100"> Lorem ipsum dolor sit amet   </p>
                            <p className=" font-sans text-sm"> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aspernatur, deleniti. </p>
                        </div>
                        <div className=" flex flex-col gap-2 mt-10">
                            <h2 className=" w-1/12 bg-[#C1A4E7] rounded-full text-white items-center  justify-center flex">✓</h2>

                            <p className=" font-normal  font-serif text-gray-100"> Lorem ipsum dolor sit amet   </p>
                            <p className=" font-sans text-sm"> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aspernatur, deleniti. </p>
                        </div>
                </div>
                <div className=" flex flex-col">

                    <div>
                        <h4 className=" text-gray-700 mb-2">Code</h4>
                        <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter Your Code"
                        className="w-[20rem] p-3 border rounded-md shadow-sm  text-gray-700 border-none outline-none  bg-gray-200"

                         />

                    </div>
{/* Language Selection Buttons */}
<div className="w-full max-w-xl flex flex-row justify-center gap-4 mt-4">
    {["JavaScript", "Python", "Go"].map((lang) => (
        <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-6 py-2 font-medium rounded-lg shadow-md transition-all duration-300 cursor-pointer
                ${language === lang 
                    ? "bg-blue-600 text-white scale-110 shadow-lg cursor-pointer" 
                    : "bg-gray-200 text-gray-800 hover:bg-blue-400 hover:text-white hover:scale-105"}
            `}
        >
            {lang}
        </button>
    ))}
</div>

                    <div className=" mt-5">

                    <h4 className=" text-gray-700 mb-2">Output</h4>
                        
                <textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="Output (optional)"
                    className="w-[20rem] p-3 border rounded-md shadow-sm  text-gray-700 border-none outline-none  bg-gray-200 h-[13rem]"

                    rows={3}
                />
                    </div>
                    <div className="flex flex-col gap-4 mt-3">
                <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow-md hover:bg-blue-700 transition"
                >
                    Share Code
                </button>
                <button
                    onClick={() => router.push("/execute")}
                    className="bg-transparent border border-blue-600  text-blue-500 px-6 py-2 rounded shadow-md  transition cursor-pointer"
                >
                    Go Back
                </button>
            </div>

                </div>

                
            </div>

            {/* Code Input */}


            {/* Language Selection & Output */}


            {/* Buttons */}

        </div>
    );
}
