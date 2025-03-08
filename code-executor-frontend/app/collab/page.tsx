"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import dynamic from "next/dynamic";
import { FaCode, FaEye, FaEyeSlash } from "react-icons/fa";

const socket = io("http://localhost:3001"); // Adjust backend URL as needed
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const generateRoomId = () => Math.random().toString(36).substring(2, 6);

const languages = [
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "Go", value: "go" },
];

export default function CollabPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("javascript");
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy");
  const [showRoomId, setShowRoomId] = useState<boolean>(false);

  const editorRef = useRef<any>(null); // No direct use of 'monaco' here
  const lastContentRef = useRef<string>("");

  const toggleRoomIdVisibility = () => {
    setShowRoomId((prev) => !prev);
  };

  // Handle roomId from URL
  useEffect(() => {
    const paramRoomId = searchParams.get("roomId");
    if (paramRoomId) {
      setRoomId(paramRoomId);
      setShowModal(false);
    }
  }, [searchParams]);

  // Connect to WebSocket and listen for updates
  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", { roomId });

    socket.on("codeUpdate", (data: { from: string; content: string }) => {
      if (editorRef.current && data.from !== socket.id) {
        const editor = editorRef.current;
        const currentContent = editor.getValue();

        if (currentContent !== data.content) {
          const position = editor.getPosition(); // Save cursor position

          editor.executeEdits("", [
            {
              range: editor.getModel()?.getFullModelRange() || { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
              text: data.content,
            },
          ]);

          if (position) {
            editor.setPosition(position); // Restore cursor position
          }

          lastContentRef.current = data.content; // Store last content to avoid redundant updates
        }
      }
    });

    return () => {
      socket.off("codeUpdate");
    };
  }, [roomId]);

  // Handle Monaco Editor Mount
  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor; // Store editor instance

    let timeout: NodeJS.Timeout | null = null;

    editor.onDidChangeModelContent(() => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        const content = editor.getValue();

        if (content !== lastContentRef.current) {
          socket.emit("codeChange", { roomId, content });
          lastContentRef.current = content;
        }
      }, 300); // Add debounce to prevent excessive WebSocket updates
    });
  };

  // Handle Language Change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    socket.emit("changeLanguage", { roomId, language: newLanguage });
  };

  // Join or Create Room
  const handleJoinRoom = () => {
    if (!inputRoomId.trim()) return alert("Please enter a valid Room ID!");
    setRoomId(inputRoomId);
    router.push(`/collab?roomId=${inputRoomId}`);
    setShowModal(false);
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    router.push(`/collab?roomId=${newRoomId}`);
    setShowModal(false);
  };

  // Copy Room ID
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopyTooltip("Copied!");
    setTimeout(() => setCopyTooltip("Copy"), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Side - Editor */}
      <div className="flex-1 p-4">
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          defaultValue=""
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            tabCompletion: "on",
            insertSpaces: true,
            detectIndentation: true,
            tabSize: 4,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            formatOnType: true,
          }}
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-96 h-screen bg-gray-800 p-4 flex flex-col space-y-6 shadow-lg">
        {/* Room ID Section */}
        <div className="p-4 bg-gray-700 rounded-lg text-center">
          <p className="text-gray-300">Room ID:</p>
          <div className="relative mt-2 flex items-center justify-center">
            <button
              onClick={handleCopyRoomId}
              className="w-full bg-gray-600 p-2 rounded-md hover:bg-gray-500 transition relative group cursor-copy"
            >
              {showRoomId ? roomId : "****"}
              <span className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                {copyTooltip}
              </span>
            </button>
            <button
              onClick={toggleRoomIdVisibility}
              className="absolute right-3 text-gray-400 hover:text-white transition"
            >
              {showRoomId ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="p-6 bg-gray-700 rounded-lg">
          <h1 className="text-2xl mb-3 flex items-center justify-center"><FaCode /></h1>
          <div className="flex flex-col space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`py-2 rounded font-medium transition duration-200 cursor-pointer ${
                  language === lang.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room Join Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-96 text-center">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Join a Room</h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleJoinRoom} className="w-1/2 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg">
                Join Room
              </button>
              <button onClick={handleCreateRoom} className="w-1/2 bg-green-500 hover:bg-green-600 py-2 rounded-lg">
                Create New Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
