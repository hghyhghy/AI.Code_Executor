"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const socket = io("http://localhost:3001"); // Adjust backend URL as needed

const generateRoomId = () => Math.random().toString(36).substring(2, 6); // Generate 4-letter ID

const languages = [
  {name:"Javascript","value":"javascript"},
  {name:"Python","value":"python"},
  {name:"GO","value":"go"},


]

export default function CollabPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("javascript")
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const paramRoomId = searchParams.get("roomId");
    if (paramRoomId) {
      setRoomId(paramRoomId);
      setShowModal(false); // Close modal if roomId exists in URL
    }
  }, [searchParams]);

  useEffect(() => {
    if (!roomId) return;
  
    socket.emit("joinRoom", { roomId });
  
    socket.on("codeUpdate", (data: { from: string; content: string }) => {
      if (editorRef.current && data.from !== socket.id) {
        const currentContent = editorRef.current.getValue();
        if (currentContent !== data.content) {
          editorRef.current.setValue(data.content); // Only update if different
        }
      }

      socket.on('languageUpdate',(data:{language:string}) => {
        setLanguage(data.language)
      }) 

    });
  
    return () => {
      socket.off("codeUpdate");
      socket.off("languageUpdate")
    };
  }, [roomId]);
  

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      setEditorContent(content);
      socket.emit("codeChange", { roomId, content });
    });
  };

  const handleLanguageChange = (newLangauge:string) => {
    setLanguage(newLangauge)
    socket.emit("changeLanguage", {roomId , language:newLangauge})
  }

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {/* Modal for Room ID Input */}
      {showModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-bold mb-4">Join a Room</h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleJoinRoom}
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
              >
                Join Room
              </button>
              <button
                onClick={handleCreateRoom}
                className="w-1/2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition"
              >
                Create New Room
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="w-full max-w-4xl text-center bg-gray-800 p-4 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-2">💻 Real-Time Code Collaboration</h1>
            <p className="text-gray-400">Room ID: {roomId}</p>
          </div>

          {/* Language Selection */}
          <div className="w-full max-w-4xl flex justify-end mt-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <div className="w-full max-w-4xl mt-4 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <Editor
              height="500px"
              theme="vs-dark"
              language={language}
              value={editorContent}
              onMount={handleEditorDidMount}
              options={{ fontSize: 14, tabCompletion: "on" }}
            />
          </div>
        </>
      )}
    </div>
  );
}
