"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import dynamic from "next/dynamic";
import { FaCode, FaEye, FaEyeSlash } from "react-icons/fa";
import { executeCode,getCodeSuggestion } from "@/lib/api";
import { RxResume } from "react-icons/rx";


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
  const [theme, setTheme] = useState<string>("vs-dark")
  const [outPut, setOutPut] = useState<string>("")
  const [suggestion, setSuggestion] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

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
    if (!inputRoomId.trim()) return alert("Please enter a valid Room ID!");
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
  

  const handleAccessChange = (socketId:string,  newAccess:"read"|"write") => {
    socket.emit("updateAccess", {roomId,socketId,access:newAccess})
  }

const handleCreateRoomClick = () => {
  setIsRoomCreator(true);
  setIsCreatingRoom(true); // Now we are in the room creation process
};
const handleConfirmRoom = () => {
  const newRoomId = generateRoomId();
  setRoomId(newRoomId);
  setShowModal(false);
  router.push(`/collab?roomId=${newRoomId}`);

  socket.emit("joinRoom", { roomId: newRoomId, access });
};

const handleExecuteCode = async () => {
  if(!editorRef.current) return
  setLoading(true)
  const code  =  editorRef.current.getValue()
  const result  =  await executeCode(code,language)
  setOutPut(result)
  setLoading(false)
}

// const handleFetSuggestions =  async() => {
//   if(!editorRef.current) return
//   const code  =  editorRef.current.getValue()
//   const suggestion1 =  await  getCodeSuggestion(language,code)
//   setSuggestion(suggestion1)
//   if(suggestion1){
//     const editor   =  editorRef.current
//     editor.setValue(suggestion1)
//   }
// }
  return (
    <>
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 p-4">
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
      </div>



      <div className="w-[29rem] h-screen bg-gray-800 p-4 flex flex-col space-y-6 shadow-lg">
        <div className="p-4 bg-gray-700 rounded-lg text-center">
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
          
        </div>

        <div className="p-20 bg-gray-800 rounded-lg">
          <h1 className="text-2xl mb-3 flex items-center justify-center"><FaCode /></h1>
          <div className="flex flex-col space-y-2">
            {languages.map((lang) => (
              <button key={lang.value} onClick={() => handleLanguageChange(lang.value)} className={`py-2 rounded font-medium transition duration-200 cursor-pointer ${language === lang.value ? "bg-blue-600 text-white shadow-md" : "bg-gray-600 text-gray-300 hover:bg-gray-500"}`}>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        <h3 className="text-lg mb-3 flex items-center justify-center">Choose  Theme</h3>
        <div className="flex flex-row gap-5">
  {themes.map((t) => (
    <button
      key={t.value}
      onClick={() => setTheme(t.value)}
      className={`flex items-center gap-3 px-5 py-2 rounded font-medium transition duration-200 cursor-pointer ${
        theme === t.value ? "bg-blue-600 text-white shadow-md" : "bg-gray-600 text-gray-300 hover:bg-gray-500"
      }`}
    >
      {/* Radio Circle */}
      <div
        className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
          theme === t.value ? "border-white bg-white" : "border-gray-400"
        }`}
      >
        {theme === t.value && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
      </div>

      {/* Theme Name */}
      <span>{t.name}</span>
    </button>
  ))}
</div>

<div className="flex space-x-3">
          <button
            onClick={handleExecuteCode}
            className="bg-blue-600 px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition"
          >
            <RxResume /> <span>Run</span>
          </button>
          



        </div>





      </div>

      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-96 text-center">
      <h2 className="text-2xl font-bold text-gray-200 mb-4">
        {isRoomCreator && isCreatingRoom ? "Set Room Access" : "Join a Room"}
      </h2>

      {!isRoomCreator && !isCreatingRoom && (
        <>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJoinRoom} // New "Join Room" button
            className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg mt-3"
          >
            Join Room
          </button>
        </>
      )}

      {isCreatingRoom && (
        <div className="mt-4">
          <p className="text-gray-300 mb-2">Set your access:</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setAccess("read")}
              className={`px-4 py-2 rounded-lg ${
                access === "read" ? "bg-blue-500 text-white" : "bg-gray-500 hover:bg-gray-400"
              }`}
            >
              Read
            </button>
            <button
              onClick={() => setAccess("write")}
              className={`px-4 py-2 rounded-lg ${
                access === "write" ? "bg-green-500 text-white" : "bg-gray-500 hover:bg-gray-400"
              }`}
            >
              Write
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {!isCreatingRoom && (
          <button
            onClick={handleCreateRoomClick}
            className="w-1/2 bg-green-500 hover:bg-green-600 py-2 rounded-lg"
          >
            Create New Room
          </button>
        )}
        {isCreatingRoom && (
          <button
            onClick={handleConfirmRoom}
            className="w-1/2 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg"
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  </div>
)}


    </div>
    
  
  <div className="bg-gray-700 p-3 rounded-md h-40 overflow-auto">
          <h3 className="text-lg mb-2">Output:</h3>
          <pre className="text-green-400 whitespace-pre-wrap">
            {loading ? "Running..." : outPut || "No output yet"}
          </pre>
        </div>
</>
)

}
