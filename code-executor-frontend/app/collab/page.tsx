"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const socket = io("http://localhost:3001"); // Adjust backend URL as needed

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

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const lastContentRef = useRef<string>("");

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
        editorRef.current.setValue(data.content);
        lastContentRef.current = data.content;
      }
    });

    return () => {
      socket.off("codeUpdate");
    };
  }, [roomId]);

  // Handle Monaco Editor Mount
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();

      if (content !== lastContentRef.current) {
        socket.emit("codeChange", { roomId, content });
        lastContentRef.current = content;
      }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {/* Modal for Room ID Input */}
      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-96 text-center backdrop-blur-md">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Join a Room</h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleJoinRoom}
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                Join Room
              </button>
              <button
                onClick={handleCreateRoom}
                className="w-1/2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                Create New Room
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="w-full max-w-4xl bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <p className="text-gray-300">Room ID:</p>
              <button
                onClick={handleCopyRoomId}
                className="bg-gray-700 px-3 py-1 rounded-md hover:bg-gray-600 transition relative group"
              >
                {roomId}
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  {copyTooltip}
                </span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="w-full max-w-4xl flex justify-center space-x-2 mt-4">
            {languages.map((lang) => (
              <button
              key={lang.value}
              onClick={() =>  handleLanguageChange(lang.value)}
              className={`px-6 py-2 rounded-lg font-medium transition duration-200 cursor-pointer ${
                language === lang.value
                  ? "bg-gray-900 text-white shadow-md" // Active style (highlighted)
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              >
                  {lang.name}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="w-full max-w-4xl mt-4 bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
            <Editor
              height="500px"
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
        </>
      )}
    </div>
  );
}
