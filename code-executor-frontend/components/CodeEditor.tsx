"use client";
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { executeCode, getCodeSuggestion } from "@/lib/api";
import LanguageSelect from "./LanguageSelect";
import { RxResume } from "react-icons/rx";
import { VscCopilot } from "react-icons/vsc";
import { FaRegSave } from "react-icons/fa";
import { FaShareNodes } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BiShow } from "react-icons/bi";
import { FaCode } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { FaUserGroup } from "react-icons/fa6";
import { IoAddOutline } from "react-icons/io5";

type CodeEditorProps = {
  folderId?: number;
  folderName?: string;
  fileId?: number;
  fileContent?: string;
  language?: string;
  onContentChange?: (fileId: number, newContent: string) => void;
  updateFile: (folderId: number, fileName: string, content: string) => void;
};

type Language = "python" | "javascript" | "go";

const CodeEditor = ({
  folderId,
  folderName,
  fileId,
  fileContent,
  language: initialLanguage,
  updateFile,
  onContentChange,
}: CodeEditorProps) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState<Language>(
    (initialLanguage as Language) || "python"
  );
  const [fileContents, setFileContents] = useState<{ [key: number]: string }>(
    {}
  );
  const [currentFileId, setCurrentFileId] = useState<number | null>(
    fileId ?? null
  );
  const [output, setOutput] = useState<string>("");
  const [sharedUrl, setSharedUrl] = useState<string>("");
  const [apiToken, setApiToken] = useState("")
  const [tokenError, setTokenError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enabled1, setEnabled1] = useState(false);
  const [enabled, setEnabled] = useState(false);



  const router = useRouter();

  // Load file content when switching files

  useEffect(() => {
    if (fileId !== undefined) {
      setCurrentFileId(fileId);
      setFileContents((prev) => ({
        ...prev,
        [fileId]: prev[fileId] ?? fileContent ?? "",
      }));
    }
  }, [fileId, fileContent]);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;

    // Auto-save when editor loses focus
    editor.onDidBlurEditorText(() => {
      if (folderId && currentFileId !== null) {
        updateFile(
          folderId,
          folderName || "Untitled",
          fileContents[currentFileId]
        );
      }
    });
  };

  const handleEditorChange = (value?: string) => {
    if (value !== undefined && currentFileId !== null) {
      setFileContents((prev) => ({
        ...prev,
        [currentFileId]: value,
      }));
    }
  };

  const handleSave = () => {
    if (folderId == null || currentFileId == null) {
      alert("Folder or File ID is missing!");
      return;
    }
    onContentChange?.(currentFileId, fileContents[currentFileId]);
    updateFile(folderId, folderName || "Untitled", fileContents[currentFileId]);
  };

  const handleRun = async () => {
    if (!fileContents[currentFileId || 0]) return;
    const result = await executeCode(
      fileContents[currentFileId || 0],
      language
    );
    setOutput(result);
  };

  const handleSuggest = async () => {
    const aiSuggestion = await getCodeSuggestion(
      language,
      fileContents[currentFileId || 0]
    );
    setFileContents((prev) => ({
      ...prev,
      [currentFileId || 0]: `${prev[currentFileId || 0]}\n${aiSuggestion}`,
    }));
  };

  const handleCopilotclick=()=>{
    setIsModalOpen(true)
    setTokenError("")
  }



  const handleValidateToken  = async() => {

    setIsModalOpen(true)
    setTokenError("")

    try {
      const response  = await axios.post("http://localhost:3001/api-token/validate",{
        token:apiToken
      })
      if(response.data.valid){
        setIsModalOpen(false)
        handleSuggest()

      }
      else {
        setTokenError("Invalid API Token. Please try again.");
      }
    }  catch (error) {
      setTokenError("Error validating API token.");
    }
    setIsVerifying(false);

  }

  const  handleFetchedSharedCode = async () =>{
    try {
      
      const urlparts =  sharedUrl.split("/")
      const codeId =  urlparts[urlparts.length-1]
      const response = await axios.get(`http://localhost:3001/share/${codeId}`)
      if(response.data && response.data.code){
        setFileContents((prev) => ({
          ...prev,
          [currentFileId || 0]:response.data.code
        }));

        setLanguage(response.data.language as Language)

      }
      else{
        alert("Invalid response from the server.");
      }
    } catch (error) {
      console.error("Error fetching shared code:", error);
      alert("Failed to fetch the shared code. Please check the URL.");
    }
  }

  return (
    <div className="w-[120%] mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
      <LanguageSelect
        language={language}
        setLanguage={(lang) => setLanguage(lang as Language)}
      />

      <div className="flex gap-3 mt-1 mb-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-transparent border border-blue-500 text-white  cursor-pointer  font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <FaRegSave /> Save
        </button>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 cursor-pointer bg-transparent border border-blue-500 text-white   font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <RxResume className="text-lg" /> Run
        </button>
        <button
          onClick={() => router.push("/share")}
          className="flex items-center gap-2 cursor-pointer bg-transparent border border-blue-500 text-white   font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <FaShareNodes className="text-lg" /> Share
        </button>
        <button
        onClick={() =>  router.push("/collab")}
         className="flex items-center gap-2 cursor-pointer bg-transparent border border-blue-500 text-white   font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
       <FaCode />
          Code Collab

        </button>
        <button
        onClick={() =>  router.push("/history")}
         className="flex items-center gap-2 cursor-pointer bg-transparent border border-blue-500 text-white   font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
       <GrTransaction />
          History

        </button>
        <button
        onClick={() =>  router.push("/community")}
         className="flex items-center gap-2 cursor-pointer bg-transparent border border-blue-500 text-white   font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
      <FaUserGroup />

          Community

        </button>
        <button
          onClick={handleCopilotclick}
          className="flex items-center gap-2 cursor-pointer bg-black hover:bg-gray-700 text-white font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <VscCopilot className="text-lg" /> Code Copilot
        </button>
      </div>

      <div className=" flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter URL here"
          value={sharedUrl}
          onChange={(e) => setSharedUrl(e.target.value)}
          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
        <button
        onClick={handleFetchedSharedCode}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
        >
          <BiShow />
        </button>
      </div>

      <Editor
        height="500px"
        theme="vs-dark"
        language={language}
        value={fileContents[currentFileId || 0]}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          tabCompletion: "on",
        }}
      />

      <div className="mt-4 p-2 bg-gray-800 rounded w-full">
        <h3 className="text-lg font-semibold">Output</h3>
        <pre className="text-green-400 whitespace-pre-wrap break-words">
          {output || "No output yet"}
        </pre>
      </div>

      {isModalOpen && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-black w-96">
            <h3 className="text-lg font-semibold mb-2">About API Token</h3>
            <p className=" text-sm"> Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident autem consequuntur praesentium maxime temporibus enim adipisci magnam vitae obcaecati earum debitis excepturi expedita asperiores quis accusamus voluptas, suscipit non fugiat.</p>
             <button className="  bg-[#161439]  rounded-full px-5 py-3 mt-3 text-white ">
              Allow All
             </button>

             <div className=" mt-3">
              <h2 className=" text-blue-800 ">Manage Consent Preferences </h2>
              <div className=" flex flex-col gap-2 mt-5">
                  <div className=" flex flex-row gap-3">

                  <IoAddOutline className=" font-bold text-1xl mt-1" />
                  <h2 className=" text-blue-950">Strictly necessary cookies </h2>
                  <h4 className=" text-gray-400">Always Active </h4>
                  </div>
                  <div className=" flex flex-row gap-3">

                  <IoAddOutline className=" font-bold text-1xl mt-1" />
                  <h2 className=" text-blue-950">Functional Cookies</h2>
                  <button
      onClick={() => setEnabled(!enabled)}
      className={`w-10 h-7 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ml-10 ${
        enabled ? "bg-[#0C0C36]" : "bg-gray-200"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300 ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      ></div>
    </button>
                  </div>                  
                  
                  <div className=" flex flex-row gap-3">

                  <IoAddOutline className=" font-bold text-1xl mt-1" />
                  <h2 className="text-blue-950">Performance cookies </h2>
                  <button
      onClick={() => setEnabled1(!enabled1)}
      className={`w-10 h-7 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ml-7 ${
        enabled1 ? "bg-[#0C0C36]" : "bg-gray-200"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300 ${
          enabled1 ? "translate-x-4" : "translate-x-0"
        }`}
      ></div>
    </button>
                  </div>

              </div>
             </div>
              <input 
              type="text"
              placeholder="Enter  API token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-5"

              />
            {tokenError && <p className="text-red-600 mt-2">{tokenError}</p>}
            <div className=" flex flex-row  justify-end gap-5 mt-4">
               <button
               onClick={handleValidateToken}
               className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
              disabled={isVerifying}
               >
                                    {isVerifying ? "Verifying..." : "Verify"}

               </button>

               <button
               onClick={() => setIsModalOpen(!isModalOpen)}
               className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
               >
                  Cancel
               </button>
            </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
