
'use client';
import React from "react";
import { useState,useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { RiExpandUpDownFill } from "react-icons/ri";
import { FaRegFileCode } from "react-icons/fa";
import { FaRegFolderOpen } from "react-icons/fa";
import { FaCode } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
const GitHubPage= () =>{

    const [files, setFiles] = useState<{

        id:number,
        name:string,
        folder:{name:string},
        username:string,
        email:string,
        execution:{language:string, createdAt:string} | null;
    }  []>([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [pat, setPat] = useState("");
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [filePath, setFilePath] = useState("");
    const [commitMessage, setCommitMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("")
    const [searchLanguage, setSearchLanguage] = useState("")
    const router = useRouter()

    const token =Cookies.get("token")
    const  handleSearch=async()=>{
        try {
            const query   = `?filename=${searchQuery}`;
            const response  =  await axios.get(`http://localhost:3001/github/search${query}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            setFiles(response.data)
        } catch (error) {
            console.error("Error searching files", error);

        }
    }
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
        <main className=" min-h-screen  bg-[#0D1117]">

        <div className="flex flex-col items-center justify-center  h-full bg-[#0D1117] p-6">
        {/* <h2 className="text-xl font-bold text-gray-300 mb-4">Search Files</h2>
    <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-300">Filename:</label>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded mt-1 text-gray-300"
                placeholder="Enter filename"
            />
        </div>

    </div> */}
    {/* <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
    >
        Search
    </button> */}
            <h1 className="text-3xl font-bold text-gray-400 mb-6">Push Files to GitHub</h1>

            <div className="w-full max-w-4xl bg-[#0D1117] p-8 rounded-lg shadow-lg">

    <div className="grid grid-cols-2 gap-4">
        {/* First Column */}
        <div>
            <label className="block text-sm font-medium text-gray-400">GitHub PAT</label>
            <input
                type="password"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                className="w-full p-3  border-none outline-none rounded-md mt-1 text-white  bg-[#101828]"
                placeholder="Enter Your GitHub PAT"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-400">Owner</label>
            <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full p-3  border-none outline-none rounded-md mt-1 text-white  bg-[#101828]"

                placeholder="GitHub Username"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-400">Repository</label>
            <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full p-3  border-none outline-none rounded-md mt-1 text-white  bg-[#101828]"

                placeholder="Repository Name"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-400">Commit Message</label>
            <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="w-full p-3  border-none outline-none rounded-md mt-1 text-white  bg-[#101828]"

                placeholder="Enter Commit Message"
            />
        </div>
    </div>

    <div className="mt-4">
        <label className="block text-sm font-medium text-gray-400">
            What are you hoping to learn about?
        </label>
        <textarea
                           className="w-full p-3  border-none outline-none rounded-md mt-1 text-white  bg-[#101828]"

            placeholder="Write your thoughts..."
            rows={3}
        />
    </div>

    <div className="flex items-center mt-4">
        <input type="checkbox" id="subscribe" className="h-4 w-4 text-blue-600 border-gray-600 bg-transparent focus:ring-blue-500" />
        <label htmlFor="subscribe" className="ml-2 text-gray-400 text-sm">
            I would like to receive emails about future updates
        </label>
    </div>

    <button
        onClick={handlePush}
        className="w-1/5 bg-blue-600 text-white py-3 rounded-md mt-6 hover:bg-blue-700 transition cursor-pointer "
        disabled={loading}
    >
        {loading ? "Pushing..." : "Push"}
    </button>
    
    <button
        onClick={() => router.push("/community")}
        className="w-1/5 bg-[#101828] text-white py-3 rounded-md mt-6 hover:bg-gray-800 transition ml-5 cursor-pointer"
        disabled={loading}
    >
        Back 
    </button>
</div>

        </div>
{/* 

        <div>
        {[... new Set(files.map(file=>file.email))].map((email,index) => (
                <h1  key={index}>
                        {email}
                </h1>
            ))}
        </div> */}

        <div className="mt-6 overflow-x-auto w-full  p-6 rounded">

        <div className="w-full p-2 bg-gray-900 rounded-lg shadow-lg">


    <div className="flex flex-row justify-end gap-5  px-9 rounded-lg    shadow-md">
    <div className="relative w-1/2">
    <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mt-1 text-gray-300 bg-[#0D1117] rounded-lg p-2 pl-10 border-none outline-none focus:ring-0"
        placeholder="Search by filename"
    />
    <CiSearch 
    onClick={handleSearch}
    className="absolute right-3 top-1/2 transform -translate-y-1/2  text-2xl cursor-pointer text-blue-500 font-bold " />
</div>


        {/* User Information Section */}
        <div className="flex flex-row gap-4 items-center">
            {[...new Set(files.map(file => file.username))].map((username, index) => (
                <div 
                    key={index} 
                    onClick={() => router.push("/userprofile")}
                    className=" cursor-pointer  flex flex-row items-center gap-3 bg-gray-800 h-[3rem]  rounded-lg  p-2  shadow-md hover:bg-gray-800 transition-all duration-300"
                >
                    <CiUser className="text-2xl text-blue-400" />
                    <h1 className="text-md font-normal text-blue-500">{username}</h1>
                </div>
            ))} 
        </div>

        {/* Email Section */}

    </div>
</div>


    <table className="min-w-full bg-[#0D1117] border border-gray-800 shadow-lg rounded-lg text-gray-300">
        <thead className=" text-gray-700 text-sm  font-semibold">
            <tr className=" text-gray-300">
                <th className="py-3 px-4 text-left"> <div className=" flex flex-row gap-1">
                Select <RiExpandUpDownFill className=" text-1xl text-lg" />
                    </div>
                    </th>
                <th className="py-3 px-4 text-left">
                    <div className=" flex flex-row gap-1">

                    File Name <RiExpandUpDownFill className=" text-1xl text-lg" />
                    </div>
                    </th>
                <th className="py-3 px-4 text-left">                    <div className=" flex flex-row gap-1">

Folder <RiExpandUpDownFill className=" text-1xl text-lg" />
</div>
</th>
                <th className="py-3 px-4 text-left">                    <div className=" flex flex-row gap-1">

Language <RiExpandUpDownFill className=" text-1xl text-lg" />
</div>
</th>
                <th className="py-3 px-4 text-left">                    <div className=" flex flex-row gap-1">

Created At <RiExpandUpDownFill className=" text-1xl text-lg" />
</div>
</th>
            </tr>
        </thead>
        <tbody>
            {files.map((file) => (
                <tr 
                    key={file.id} 
                    className={`border-t text-gray-700 text-sm even:bg-[#0D1117] cursor-pointer ${
                        selectedFile === file.name ? "" : ""
                    }`}
                    onClick={() => setSelectedFile(file.name)}
                >
                    <td className="py-3 px-4 text-lg font-bold text-blue-600">
                        {selectedFile === file.name ? <>
                        <div className=" bg-[#4D41E8] rounded-md w-1/10 h-5 p-2 flex items-center justify-center">
                        <h4 className=" text-white text-sm">
                        ✓
                        </h4>
                        </div>
                        </> :<>
                        <div className=" bg-white border  border-blue-500 rounded-md w-1/10 h-5 p-2 flex items-center justify-center">
                        <h4 className=" text-white text-sm">
                        </h4>
                        </div>
                        </>}
                    </td>
                    <td className="py-3 px-4 font-medium flex items-center">
                        <span className="p-2 w-10 h-10 mr-2 text-lg bg-transparent rounded-full flex  items-center justify-center"><FaRegFileCode className=" text-blue-500" /></span>
                        <span className=" text-gray-300">

                        {file.name}
                        </span>
                    </td>
                    <td className="py-3 px-4 flex-row">                          
                         <div className="flex items-center">
        <span className="p-2 w-10 h-10  text-lg  ">
            <FaRegFolderOpen   className="text-yellow-800 text-2xl" />
        </span>
        <span className="text-gray-300">
    {typeof file.folder === "string" ? file.folder : file.folder?.name || "N/A"}
</span>
    </div></td>
                    
    <td className="py-3 px-4"><div className="flex items-center">
        <span className="p-2 w-10 h-10  text-lg  ">
            <FaCode   className="text-blue-700 text-2xl" />
        </span>
        <span  className=" bg-blue-800 rounded-full px-4 py-1 text-white">

        {file.execution?.language || "N/A"}
        </span>
    </div></td>
                    <td className="py-3 px-4">
                    <div className="flex items-center">
        <span className="p-2 w-10 h-10  text-lg  ">
            <BsFillCalendarDateFill    className="text-blue-500 text-2xl" />
        </span>
        <span className=" font-semibold uppercase text-1xl text-gray-300">

        {new Date(file.execution?.createdAt || "").toLocaleDateString()}
        </span>
    </div>
                        
                        
                        
                       </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
        </main>

    );


}

export default GitHubPage