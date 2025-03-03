"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaBars } from "react-icons/fa";
import { CiFolderOn } from "react-icons/ci";
import CodeEditor from "@/components/CodeEditor";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoAdd } from "react-icons/io5";

export default function ExecuteCode() {
  const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [contextMenuFolderId, setContextMenuFolderId] = useState<number | null>(null);
  const [showFolders, setShowFolders] = useState(true);
  const [files, setFiles] = (useState<{ name: string }[]>([]))
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] =useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [showModal, setShowModal] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = "http://localhost:3001/folder";
  const API_URL1 = "http://localhost:3001";


  useEffect(() => {
    if (token) fetchFolders();
  }, [token]);

  async function fetchFolders() {
    try {
      const res = await fetch(`${API_URL}/find`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFolders(data.folders);
      else alert(data.message || "Failed to fetch folders");

    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }

  // for fetching files
  async function fetchFiles(folderId:number) {
    try {
      const res=  await fetch(`${API_URL1}/file/folder/${folderId}`, {
        method:"GET",
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      const data  = await res.json()
      if(res.ok) setFiles(data.files)
        else alert(data.message || "Failed to fetch files");

    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }
  //  for creating files

  async function createFile() {
    if (!fileName.trim() || !selectedFolder) return alert("File name cannot be empty");
  
    try {
      const res = await fetch(`${API_URL1}/file/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folderId: selectedFolder, name: fileName, content: "" }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setFileName("");
        setFiles((prevFiles) => (Array.isArray(prevFiles) ? [...prevFiles, { name: fileName }] : [{ name: fileName }]));
        setShowModal(false);
      } else {
        alert(data.message || "Failed to create file");
      }
    } catch (error) {
      console.error("Error creating file:", error);
    }
  }
  

  // openfile 

  async  function openFIle(folderId:number,fileName:string){

    try {
      const  res =  await fetch(`${API_URL1}/file/${folderId}/${fileName}`, {
        method :"GET",
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      const data =  await res.json()
      if (res.ok){
        setSelectedFile(fileName)
        setFileContent(data.content)
      }
      else alert(data.message || "Failed to fetch file content");
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  }

  // deletefile

  async  function deleteFIle(folderId:number,fileName:string){
    console.log("Deleting file with data:", { folderId, fileName });

      try {
        const res  =  await fetch(`${API_URL1}/file/delete`,{
          method:"DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ folderId, fileName: fileName }),
        });
        const data  =  await res.json()
        if(res.ok){
          setFiles(files.filter((file) =>  file.name !== fileName))
        }else alert(data.message || "Failed to delete file");
      } catch (error) {
        console.error("Error deleting file:", error);

      }
  }

  // update file
  async  function updateFile(folderId:number, fileName:string, content:string){
    try {
      const res  =  await fetch(`${API_URL1}/file/update`,{
        method:"PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folderId, fileName, content }),
      });

      const data  =  await res.json()
      if(res.ok){
        setFileContent(content)
        alert("File updated successfully");
      }
      else {
        alert(data.message || "Failed to update file");
      }
    } catch (error) {
      console.error("Error updating file:", error);

    }
  }




  async function createFolder() {
    if (!folderName.trim()) return alert("Folder name cannot be empty");
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: folderName }),
      });
      const data = await res.json();
      if (res.ok) {
        setFolders([...folders, data.folder]);
        setFolderName("");
      } else {
        alert(data.message || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
    setCreating(true);
  }

  async function deleteFolder(folderId: number) {
    if (!confirm("Are you sure you want to delete this folder?")) return;
    try {
      const res = await fetch(`${API_URL}/delete/${folderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFolders(folders.filter((folder) => folder.id !== folderId));
      else alert("Failed to delete folder");
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Main Content (Code Editor) */}
      <div className="flex-1 flex flex-col  items-center p-6">
        {/* Hamburger Menu Button */}
        <div className="flex flex-row gap-2">
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="md:hidden text-white bg-gray-800 p-2 rounded mb-4"
          >
            <FaBars size={24} />
          </button>
          <h1 className="font-bold text-3xl mb-2">Online Code Editor</h1>
        </div>
  
{/* File List Section */}
{selectedFolder && (
  <div className="mt-4 p-4 bg-gray-700 rounded shadow">
    <h3 className="text-lg font-semibold mb-3">Files in {folders.find(f => f.id === selectedFolder)?.name}</h3>
    <ul className="space-y-2">
      {files?.length === 0 && <p className="text-gray-400">No files found.</p>}
      {files?.map((file) => (
        <li
          key={file.name}
          className={`p-2 bg-gray-600 rounded flex justify-between items-center cursor-pointer ${
            selectedFile === file.name ? "bg-blue-600" : "hover:bg-gray-500"
          }`}
          onClick={() => openFIle(selectedFolder, file.name)}
        >
          <span>{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFIle(selectedFolder, file.name);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
          >
            <RiDeleteBin6Fill />
          </button>
        </li>
      ))}
    </ul>
  </div>
)}

      </div>
  
      {/* Folder Section */}
      <div
        className={`fixed md:relative top-0 right-0 w-80 bg-gray-800 p-4 rounded-md shadow-lg h-screen overflow-y-auto transition-transform transform ${
          showFolders ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0`}
      >
        {/* Close Button on Mobile */}
        <button
          onClick={() => setShowFolders(false)}
          className="md:hidden absolute top-4 right-4 text-white bg-red-600 px-2 py-1 rounded"
        >
          X
        </button>
  
        <h2 className="text-xl font-semibold mb-3 flex items-center justify-between">
          Create Folders
          <FaPlus
            onClick={() => setCreating(!creating)}
            className="text-white cursor-pointer hover:text-blue-400 transition"
            size={20}
          />
        </h2>
  
        {creating && (
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
            />
            <button
              onClick={createFolder}
              disabled={!folderName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <IoAdd />
            </button>
          </div>
        )}
  
        {/* Folder List */}
        <div className="grid grid-cols-1 gap-4">
          {folders.length === 0 && <p className="text-gray-400">No folders found.</p>}
          {folders.map((folder) => (
  <div
    key={folder.id}
    className={`relative p-3 bg-gray-700 rounded shadow flex flex-row gap-2 items-center cursor-pointer ${
      selectedFolder === folder.id ? "bg-blue-600" : "hover:bg-gray-600"
    }`}
    onClick={() => {
      setSelectedFolder(folder.id); // Set selected folder
      fetchFiles(folder.id); // Fetch files for the folder
      setShowModal(true); // Show modal when a folder is clicked
    }}
    onContextMenu={(e) => {
      e.preventDefault();
      setContextMenuFolderId(folder.id === contextMenuFolderId ? null : folder.id);
    }}
  >
    <CiFolderOn size={30} className="text-yellow-400" />
    <span>{folder.name}</span>

    {contextMenuFolderId === folder.id && (
      <button
        onClick={() => deleteFolder(folder.id)}
        className="absolute top-1 right-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
      >
        <RiDeleteBin6Fill />
      </button>
    )}
  </div>
))}

        </div>
      </div>
  
      {/* Add File Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-4 rounded-md w-96">
            <h2 className="text-lg font-semibold mb-3">Enter File Name</h2>
            <input
              type="text"
              placeholder="File Name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 rounded text-white mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createFile();
                  setShowModal(false);
                }}
                disabled={!fileName.trim()}
                className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
