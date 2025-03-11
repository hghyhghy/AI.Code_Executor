"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import dynamic from "next/dynamic";
import { FaCode, FaEye, FaEyeSlash } from "react-icons/fa";
import { executeCode,getCodeSuggestion } from "@/lib/api";
import { RxResume } from "react-icons/rx";
import {Menu} from "@headlessui/react"

const socket = io("http://localhost:4000"); // Adjust backend URL as needed
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const generateRoomId = () => Math.random().toString(36).substring(2, 6);

const languages = [
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "Go", value: "go" },
];

const themes  = [
  {name:"Dark", value:"vs-dark",

  },
  {
    name:"Light", value:"light"
  },
  {
    name:"High Contrast",value:"hc-black"
  }
]

export default function CollabPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("javascript");
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy");
  const [showRoomId, setShowRoomId] = useState<boolean>(false);
  const [users, setUsers] = useState<{ socketId: string; access: "read" | "write" }[]>([]);
  const [username, setUsername] = useState<string>("Guest");
  const [access, setAccess] = useState<"read"|"write">("read")
  const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false); // New state
  const [theme, setTheme] = useState<string>("light")
  const [outPut, setOutPut] = useState<string>("")
  const [suggestion, setSuggestion] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState("")

  const editorRef = useRef<any>(null);
  const lastContentRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUsername(storedUser?.username || "Guest");
    }
  }, []);

  const toggleRoomIdVisibility = () => {
    setShowRoomId((prev) => !prev);
  };

  useEffect(() => {
    const paramRoomId = searchParams.get("roomId");
    if (paramRoomId) {
      setRoomId(paramRoomId);
      setShowModal(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", { roomId });

    socket.on("userJoined", (data: { clientId: string; access: "read" | "write" }) => {
      setUsers((prevUsers) => [...prevUsers, { socketId: data.clientId, access: data.access }]);
      if (data.clientId === socket.id) {
        setAccess(data.access);
        console.log(`[FRONTEND] You have '${data.access}' access.`);

      }
    });

    // socket.on("accessUpdated", (data: { socketId: string; access: "read" | "write" }) => {
    //   setUsers((prevUsers) =>
    //     prevUsers.map((user) =>
    //       user.socketId === data.socketId ? { ...user, access: data.access } : user
    //     )
    //   );
    // });

    socket.on("codeUpdate", (data: { content: string; from: string }) => {
      if (editorRef.current && data.from !== socket.id) {
        const editor = editorRef.current;
        const currentContent = editor.getValue();

        if (currentContent !== data.content) {
          const position = editor.getPosition();
          editor.executeEdits("", [
            {
              range: editor.getModel()?.getFullModelRange() || {
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: 1,
              },
              text: data.content,
            },
          ]);

          if (position) editor.setPosition(position);
          lastContentRef.current = data.content;
        }
      }
    });

    return () => {
      socket.off("codeUpdate");
      socket.off("userJoined");
      socket.off("accessUpdated");
    };
  }, [roomId]);



  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();

      if (content !== lastContentRef.current) {
        lastContentRef.current = content;
        socket.emit("codeChange", { roomId:roomId, content:content });
      }
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    socket.emit("changeLanguage", { roomId, language: newLanguage });
  };



  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsRoomCreator(true)
    setShowModal(true);
    router.push(`/collab?roomId=${newRoomId}`);
    socket.emit("joinRoom", { roomId: newRoomId });
  };

  const handleJoinRoom = () => {
    if (!inputRoomId.trim()){
      setError('Please Enter roomId to  proceed')
      return
    }
    setRoomId(inputRoomId);
    router.push(`/collab?roomId=${inputRoomId}`);
    socket.emit("joinRoom", { roomId: inputRoomId });
    setShowModal(false);
  };
  
  const handleCopyRoomId = async () => {
    if (!roomId) {
      console.error("No Room ID available to copy.");
      return;
    }
  
    try {
      await navigator.clipboard.writeText(roomId);
      setCopyTooltip("Copied!");
      setTimeout(() => setCopyTooltip("Copy"), 2000);
    } catch (error) {
      console.error("Failed to copy Room ID:", error);
    }
  };
  



const handleConfirmRoom = () => {
  const newRoomId = generateRoomId();
  setRoomId(newRoomId);
  setShowModal(false);
  router.push(`/collab?roomId=${newRoomId}`);

  socket.emit("joinRoom", { roomId: newRoomId });
};

const handleExecuteCode = async () => {
  if(!editorRef.current) return
  setLoading(true)
  const code  =  editorRef.current.getValue()
  const result  =  await executeCode(code,language)
  setOutPut(result)
  setLoading(false)
}


return (
  <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
    {/* Left side: Editor (Takes remaining space) */}
    <div className="flex-1 p-4 flex flex-col h-full">
      <Editor
        height="100%"
        theme={theme}
        language={language}
        defaultValue=""
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          insertSpaces: true,
          detectIndentation: true,
          tabSize: 4,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnType: true,
          
        }}
      />
      {/* Output Box - Now inside the layout properly */}
      <div className="bg-gray-700 p-3 rounded-md h-40  overflow-y-auto mt-4 w-full">
        <h3 className="text-lg mb-2">Output:</h3>
        <pre className="text-green-400 whitespace-pre-wrap">
          {loading ? "Running..." : outPut || "No output yet"}
        </pre>
      </div>
    </div>

    {/* Right side: Sidebar (Reduced width) */}
    <div className="w-[20rem] h-full bg-[#0D0E0E] p-4 flex flex-col space-y-6 shadow-lg shrink-0">
      {/* Room ID Box */}
      <div className="p-4 bg-[#1E1E1D] rounded-lg text-center gap-5 flex flex-col">
        <p className="text-gray-300">Room ID</p>
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
          <button onClick={toggleRoomIdVisibility} className="absolute right-3 text-gray-400 hover:text-white transition">
            {showRoomId ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

      {/* Language Selector */}
      <div className="p-4 bg-[#1E1E1D] rounded">
        <h1 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
          Select Language
        </h1>
        <Menu as="div" className="relative">
          <Menu.Button className=" cursor-pointer w-full px-4 py-2 bg-gray-800 text-white flex justify-between items-center rounded-md hover:bg-gray-700 transition">
            {languages.find((l) => l.value === language)?.name}
            <span className="text-gray-400">▼</span>
          </Menu.Button>
          <Menu.Items className="absolute mt-2 w-full bg-gray-800 rounded-md shadow-lg z-10 cursor-pointer">
            {languages.map((lang) => (
              <Menu.Item key={lang.value}>
                {({ active }) => (
                  <button
                    onClick={() => handleLanguageChange(lang.value)}
                    className={`w-full px-4 py-2 text-left text-gray-200 hover:bg-blue-600 transition cursor-pointer flex flex-row gap-1 ${
                      language === lang.value ? "bg-blue-500" : ""
                    }`}
                  >
                   <FaCode className="text-blue-400" />  {lang.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>

      {/* Theme Selector */}
      <div className="p-4 bg-[#1E1E1D] rounded">
        <h1 className="text-lg font-semibold mb-2 text-white  flex items-start justify-start">Choose Theme</h1>
        <Menu as="div" className="relative">
          <Menu.Button className="cursor-pointer w-full px-4 py-2 bg-gray-800 text-white flex justify-between items-center rounded-md hover:bg-gray-700 transition">
            {themes.find((t) => t.value === theme)?.name}
            <span className="text-gray-400">▼</span>
          </Menu.Button>
          <Menu.Items className="absolute mt-2 w-full bg-gray-800 rounded-md shadow-lg z-10">
            {themes.map((t) => (
              <Menu.Item key={t.value}>
                {({ active }) => (
                  <button
                    onClick={() => setTheme(t.value)}
                    className={`w-full px-4 py-2 flex items-center gap-2 text-gray-200 hover:bg-blue-600 transition ${
                      theme === t.value ? "bg-blue-500" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        theme === t.value ? "border-white bg-blue-500" : "border-gray-400"
                      }`}
                    ></div>
                    {t.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>

      </div>


      {/* Run Button */}
      <div className="flex space-x-3">
        <button
          onClick={handleExecuteCode}
          className="bg-blue-600 px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition  cursor-pointer"
        >
          <RxResume /> <span>Run</span>
        </button>
      </div>
    </div>

    {/* Modal for Room Joining */}
    {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 border border-blue-950">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[400px]">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Code Collab Powered By Ai.Editor</h2>

      {/* Roles Section */}
      <div className="text-left">
        <label className="text-sm text-gray-600">Roles</label>
        <p className="text-xs text-gray-500 mb-2">
          Access limited to everyone of select role(s)
        </p>

        {/* Invite Dropdown */}
        <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
        <input
                type="text"
                placeholder={error ? "Error: " + error : "Enter your roomId"}
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-200 text-black border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

        </div>

        {/* Role Checkboxes */}
        {[
          { role: "Makers", desc: "Everyone assigned the maker role", avatars: true },
          { role: "Contributors", desc: "Everyone assigned the contributor role", avatars: false },
          { role: "Viewers", desc: "Everyone assigned the viewer role", avatars: false },
        ].map(({ role, desc, avatars }) => (
          <label key={role} className="flex items-center gap-3 mb-3">
            <input type="radio" className="accent-blue-500 w-5 h-5" defaultChecked />
            <div>
              <p className="text-gray-700 font-medium">{role}</p>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
            {/* {avatars && (
              <div className="flex -space-x-2">
                <img className="w-6 h-6 rounded-full border" src="/avatar1.png" alt="User" />
                <img className="w-6 h-6 rounded-full border" src="/avatar2.png" alt="User" />
                <img className="w-6 h-6 rounded-full border" src="/avatar3.png" alt="User" />
              </div>
            )} */}
          </label>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-5 mt-4">
  <button
    onClick={handleJoinRoom}
    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded text-sm cursor-pointer"
  >
    Join Room
  </button>
  <button
    onClick={handleConfirmRoom}
    className="bg-blue-800 hover:bg-blue-800 text-white py-3 px-4 rounded text-sm cursor-pointer"
  >
    Create New Room
  </button>
</div>
    </div>
  </div>
)}
  </div>
);



}
