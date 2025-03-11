"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaBars } from "react-icons/fa";
import { CiFolderOn } from "react-icons/ci";
import CodeEditor from "@/components/CodeEditor";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoAdd } from "react-icons/io5";
import { CiFileOn } from "react-icons/ci";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiArrowTurnDownRight } from "react-icons/hi2";

export default function ExecuteCode() {
  const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [showFolders, setShowFolders] = useState(true);
  const [files, setFiles] = useState<{ name: string }[]>([])
  const [fileName, setFileName] = useState("")
  const [rightClickedFile, setRightClickedFile] = useState<string | null>(null)
  interface File {
    id: number;
    folderId: number;
    folderName: string;
    name: string;
    content: string;
    language: string;
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<{ [key: number]: string }>({});
  const [showModal, setShowModal] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState([{}])
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = "http://localhost:3001";
  const API_URL1 = "http://localhost:3001";
  useEffect(() => {
    if (selectedFile) {
      console.log(`Updated selectedFile: folderId=${selectedFile.folderId}, fileName=${selectedFile.folderName}, fileId=${selectedFile.id}, name=${selectedFile.name}, content=${selectedFile.content}`);
    }
  }, [selectedFile]); // Runs whenever `selectedFile` changes

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId] : !prev[folderId],
    }))
    fetchFiles(folderId)
  }

  useEffect(() => {
    const lastOpenedFile  =  localStorage.getItem("last_opened_file")
    if(lastOpenedFile ){
      const {folderId,fileName} = JSON.parse(lastOpenedFile )
      openFile(folderId,fileName)
    }
  },[])
  useEffect(() => {
    if (token) {
      fetchFolders().then((fetchedFolders) => {
        if (fetchedFolders && fetchedFolders.length > 0) {
          setSelectedFolder(fetchedFolders[0].id); // Automatically select the first folder
        }
      });
    }
  }, [token]);
  
  useEffect(() => {
    if (selectedFolder !== null) {
      fetchFiles(selectedFolder);
    }
  }, [selectedFolder]);

  async function fetchFolders() {
    try {
      const res = await fetch(`${API_URL}/folder/find`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFolders(data.folders);
        return data.folders;
      }
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
      if(res.ok) setFiles(data)
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
  async function openFile(folderId: number, fileName: string) {
    console.log(`Opening file: folderId=${folderId}, fileName=${fileName}`);
  
    try {
      const res = await fetch(`${API_URL1}/file/${folderId}/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        console.log("🔄 Fetched from MySQL:", data);
  
        if (data) {
          setFileContent((prev) => ({
            ...prev,
            [data.id]: data.content,
          }));
  
          setSelectedFile({
            id: data.id,
            folderId: data.folderId,
            folderName: data.folderName,
            name: data.name,
            content: data.content,
            language: data.language,
          });
  
          console.log("Response okay");
        } else {
          console.warn("⚠️ No content found in database, setting empty.");
          setFileContent({});
          setSelectedFile(null);
        }
      } else {
        console.warn("⚠️ Failed to fetch file from MySQL.");
      }
    } catch (error) {
      console.error("❌ Error fetching file:", error);
    }
  }
  
  
  
  // deletefile

  async function deleteFile(folderId: number, fileName: string) {
    console.log("Deleting file with data:", { folderId, fileName });
  
    try {
      const res = await fetch(`${API_URL1}/file/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folderId, fileName }),
      });
  
      if (res.ok) {
        console.log("File deleted successfully");
        await fetchFiles(folderId); // Re-fetch files after deletion
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
  // update file
  async function updateFile(folderId: number, fileName: string, content: string) {
    try {
        console.log(`📝 Updating file: folderId=${folderId}, fileName=${fileName}, content=${content}`);
        console.log("🔑 Token:", token);

        const res = await fetch(`${API_URL1}/file/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ folderId, fileName, content }),
        });

        const responseText = await res.text();
        console.log("📨 Response from server:", responseText);

        if (res.ok) {
            console.log("✅ Update successful in MySQL");
            setFileContent(content);
            await openFile(folderId, fileName);
        } else {
            console.warn("⚠️ Update failed");
        }
    } catch (error) {
        console.error("❌ Error updating file:", error);
    }
}

  
  
  
  async function createFolder() {
    if (!folderName.trim()) return alert("Folder name cannot be empty");
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/folder/create`, {
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
      const res = await fetch(`${API_URL}/folder/delete/${folderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.ok) {
        setFolders(folders.filter((folder) => folder.id !== folderId));
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
          setFiles([]); // Reset file list
        }
      } else alert("Failed to delete folder");
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }

  const handleRightClick = (e: React.MouseEvent, fileName: string) => {
      e.preventDefault()
      setRightClickedFile((prev) => (prev === fileName ? null: fileName))
  }
  

  return (
    <div className="min-h-screen bg-[#0D0E0E] text-white flex">
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
          <h1 className="font-bold text-3xl mb-5">Online Code Editor</h1>

        </div>
        <div className=" w-[65%] absolute left-0">

 {selectedFile &&          

  <CodeEditor
    folderId={selectedFile?.folderId }  // Ensures a default value
    folderName={selectedFile?.name}
    fileId={selectedFile?.id} // Ensures a default value
    fileContent={selectedFile?.content}
    language={selectedFile?.language}
    updateFile={updateFile}
/>
}
</div>
  
{/* File List Section */}

</div>

  
      {/* Folder Section */}
      <div className="fixed md:relative top-0 right-0 w-80 bg-[#020202] p-4 rounded-md shadow-lg h-screen overflow-y-auto transition-transform transform">
      <h2 className="text-xl font-semibold mb-3 flex items-center justify-between text-gray-300">
        Create Folders
        <FaPlus onClick={() => setCreating(!creating)} className="text-white cursor-pointer bg-[#1E1E1E] hover:text-blue-400 transition" size={20} />
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
          <button onClick={createFolder} disabled={!folderName.trim()} className="px-4 py-2 bg-[#3D3C3C] text-white rounded cursor-pointer ">
            <IoAdd />
          </button>
        </div>
      )}

      {/* Folder List */}
      <div className="grid grid-cols-1 gap-4">
        {folders.length === 0 && <p className="text-gray-400">No folders found.</p>}
        {folders.map((folder) => (
  <div key={folder.id}>
    {/* Folder Header */}
    <div className="flex items-center space-x-2">
      {/* Toggle folder expand/collapse */}
      <IoMdArrowDropdown
        className={`text-white cursor-pointer transition-transform duration-300  ${ expandedFolders[folder.id] ? 'rotate-180' : 'rotate-0'}`}
        onClick={() => toggleFolder(folder.id)}
      />
      <CiFolderOn size={30} className="text-yellow-400" />
      <span>{folder.name}</span>

      {/* New File Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent folder toggle
          setSelectedFolder(folder.id); // Store selected folder ID
          setShowModal(true); // Open modal
        }}
        className="ml-auto px-4 py-3 text-1xl bg-[#3E3E3E]  cursor-pointer text-white rounded  mb-2"
      >
                    <IoAdd />

      </button>
      <button
    onClick={(e) => {
      e.stopPropagation(); // Prevent folder toggle
      deleteFolder(folder.id);
    }}
    className="px-4 py-3 text-white text-1xl rounded bg-[#2B2B2B] flex items-center mb-2 cursor-pointer"
  >
    <RiDeleteBin6Fill className="text-xl" />
  </button>
    </div>

    {/* Files List */}
    {expandedFolders[folder.id] && (
  <ul className="pl-10 py-2 bg-[#0F1010] rounded">
    {files?.length === 0 && <p className="text-gray-400">No files found.</p>}
    {files?.map((file) => (
      <li
        key={file.name}
        className="p-2 flex items-center cursor-pointer  relative"
        onClick={() => openFile(folder.id, file.name)}
        onContextMenu={(e) => handleRightClick(e, file.name)} // Right-click event
      >
        <HiArrowTurnDownRight />
        <CiFileOn className="text-2xl" />
        <span className="ml-2">{file.name}</span>

        {/* Show delete button only if right-clicked */}
        {rightClickedFile === file.name && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFile(folder.id, file.name);
              setRightClickedFile(null); // Reset after delete
            }}
            className="px-3 py-1 text-white rounded flex items-center ml-auto cursor-pointer"
          >
            <RiDeleteBin6Fill />
          </button>
        )}
      </li>
    ))}
  </ul>
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
