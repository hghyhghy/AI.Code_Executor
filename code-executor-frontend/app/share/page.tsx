
'use client';
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export  default  function ShareCode(){
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("javascript")
    const [output, setOutput] = useState("")
    const [shareLink, setShareLink] = useState("")

    const handleShare =  async() => {
        try {
            
            const token  = localStorage.getItem("token")
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

      <button
      onClick={handleShare}
       className="mt-4 bg-blue-500 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-600 transition cursor-pointer"
      >
        share Code 
      </button>

      {shareLink && (

        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-md">
                      <p className="text-green-600">Share this link:</p>
                        <a 
                        href={shareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                        >
                            {shareLink}
                        </a>
        </div>
      )}
        </div>
    )
}