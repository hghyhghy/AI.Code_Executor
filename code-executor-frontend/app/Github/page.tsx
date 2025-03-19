
'use client';
import React from "react";
import { useState,useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const GitHubPage= () =>{

    const [files, setFiles] = useState<{

        id:number,
        name:string,
        folder:{name:string},
        execution:{language:string, createdAt:string} | null;
    }  []>([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [pat, setPat] = useState("");
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [filePath, setFilePath] = useState("");
    const [commitMessage, setCommitMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const token =Cookies.get("token")
    useEffect(() => {
      fetchfiles()

    }, [])
    
    const fetchfiles=async()=>{
        try {
            
            const response  = await axios.get("http://localhost:3001/github/files",{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            } );
            const fileName  =  response.data.map((file:{name:string}) =>  file.name)
            setFiles(response.data)
        } catch (error) {
            console.error("Error fetching files",error)
        }
    }

    const handlePush= async()=>{
        if(!pat || !owner || !repo || filePath || commitMessage || selectedFile){
            alert("Please enter all the fields ")
        }

        setLoading(true)
        try {
            
            await axios.post("http://localhost:3001/github/push",{
                pat,owner,repo,filePath,commitMessage
            }, {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            alert("File pushed successfully!");

        } catch (error) {
            console.error("Error pushing file", error);
            alert("Failed to push file.");
        }finally{
            setLoading(false)
        }
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Push Files to GitHub</h1>

            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">GitHub PAT</label>
                    <input
                        type="password"
                        value={pat}
                        onChange={(e) => setPat(e.target.value)}
                        className="w-full p-2 border rounded mt-1 text-black"
                        placeholder="Enter Your GitHub PAT"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Owner:</label>
                        <input
                            type="text"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="w-full p-2 border rounded mt-1 text-black"
                            placeholder="Repository owner (GitHub username)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Repository:</label>
                        <input
                            type="text"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            className="w-full p-2 border rounded mt-1 text-black"
                            placeholder="Repository name"
                        />
                    </div>
                </div>

                <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Commit Message:</label>
                    <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="w-full p-2 border rounded mt-1 text-black"
                        placeholder="Enter Commit Message"
                    />
                </div>

                {/* Table displaying files */}
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md text-black">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 border text-left">Select</th>
                                <th className="py-2 px-4 border text-left">File Name</th>
                                <th className="py-2 px-4 border text-left">Folder</th>
                                <th className="py-2 px-4 border text-left">Language</th>
                                <th className="py-2 px-4 border text-left">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.id} className="border-t">
                                    <td className="py-2 px-4 border">
                                        <input
                                            type="radio"
                                            name="selectedFile"
                                            value={file.name}
                                            checked={selectedFile === file.name}
                                            onChange={() => setSelectedFile(file.name)}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2 px-4 border">{file.name}</td>
                                    <td className="py-2 px-4 border">{file.folder?.name || "NA"}</td>
                                    <td className="py-2 px-4 border">{file.execution?.language || 'N/A'}</td>
                                    <td className="py-2 px-4 border">{new Date(file.execution?.createdAt || "").toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={handlePush}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? "Pushing..." : "Push to GitHub"}
                </button>
            </div>
        </div>
    );


}

export default GitHubPage