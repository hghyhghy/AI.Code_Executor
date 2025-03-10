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
          className="flex items-center gap-2 bg-gray-100 text-black cursor-pointer hover:bg-gray-200 font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <FaRegSave /> Save
        </button>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <RxResume className="text-lg" /> Run
        </button>
        <button
          onClick={() => router.push("/share")}
          className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
          <FaShareNodes className="text-lg" /> Share
        </button>
        <button
        onClick={() =>  router.push("/collab")}
         className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
       <FaCode />
          Code Collab

        </button>
        <button
        onClick={() =>  router.push("/history")}
         className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-5 rounded shadow-md transition duration-200"
        >
       <GrTransaction />
          History

        </button>
        <button
          onClick={handleSuggest}
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
    </div>
  );
};

export default CodeEditor;
