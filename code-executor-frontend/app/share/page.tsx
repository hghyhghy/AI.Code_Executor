
'use client';
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy } from "react-icons/fa";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export  default  function ShareCode(){
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("javascript")
    const [output, setOutput] = useState("")
    const [shareLink, setShareLink] = useState("")
    const router =  useRouter()

    const handleShare =  async() => {
        try {
            
            const token  = Cookies.get("token")
            if (!token) {
                toast.error("You must be logged in to share code.");
                return;
              }

            const res=  await axios.post("http://localhost:3001/share/set", {
                code,language,output
            },
        {headers:{ Authorization: `Bearer ${token}` }});

        setShareLink(res.data.link)
        console.log(res.data.link)
        toast.success("code shared successfully")
        } catch (error) {
            toast.error("Failed to share code ")
        }
    }

    const handleCopy = () => {
        if(shareLink){
            navigator.clipboard.writeText(shareLink)
            toast.success("Link  copied to clipboard")
        }
    }
    

    return (

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <ToastContainer/>
            <h1 className="text-3xl font-bold mb-6 text-black">Share Your Code</h1>
            <textarea
            value={code}
            onChange={(e) =>  setCode(e.target.value)}
            placeholder="Enter Your code To share"
            className="w-full max-w-2xl p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-black"
            rows={6}
            />

            <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-3 p-2 border rounded-md shadow-sm text-black"
            >

        <option value="JavaScript">JavaScript</option>
        <option value="Python">Python</option>
        <option value="Go">Go</option>
            </select>

        <textarea
        value={output}
        onChange={(e) => setOutput(e.target.value)}
        placeholder="Output (optional)"
        className="w-full max-w-2xl p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 mt-3 text-black"
        rows={3}
      />

      <div className=" flex flex-row gap-2">


      <button
      onClick={handleShare}
       className="mt-4 bg-blue-500 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-600 transition cursor-pointer"
      >
        share Code 
      </button>
      <button
      onClick={() => router.push("/execute")}
       className="mt-4 bg-blue-500 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-600 transition cursor-pointer"
      >
        Go Back
      </button>
      </div>

      {shareLink && (

        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-md flex items-center justify-between w-full max-w-2xl">
                      <p className="text-green-60 break-all ">Share this link:</p>
                        <a 
                        href={shareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                        >
                            {shareLink}
                        </a>
                        <button
                        onClick={handleCopy}
                        className="ml-2 bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition"
                        >
                            <FaRegCopy className="text-gray-700" />
                        </button>
        </div>
      )}
        </div>
    )
}