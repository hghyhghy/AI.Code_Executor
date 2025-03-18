
"use client";
import {useEffect,useState} from 'react';
import axios  from 'axios';
import { jwtDecode } from "jwt-decode"
import Cookies from 'js-cookie';
import { IoAddOutline, IoClose, IoMenu } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { IoArrowDownSharp } from "react-icons/io5";
import { IoArrowUpSharp } from "react-icons/io5";

interface  ExecutionHistory {
    id:number,
    code:string,
    language:string,
    output:string,
    createdAt:string
}

interface Comment {
    id:number,
    content:string,
    createdAt:string,
    userId:string,
    user:{
      name:string
    },
    likes:number,
    dislikes:number
}

interface DecodedToken {
  id: number;
  exp: number;
}

export default  function  ExecutedCodes(){

    const router = useRouter()
    const [executions, setExecutions] = useState<ExecutionHistory[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("");
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [showOutPut, setShowOutPut] = useState(false)
    useEffect(() => {
      const token = typeof window !== "undefined" ? Cookies.get("token") : null;
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          setUserId(decoded.id);
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
    }, []);

    const handlelogout=()=> {
      localStorage.removeItem("token")
      Cookies.remove("token")
      sessionStorage.removeItem("token")
      router.push("/login")
    }

    const token  =  typeof window !== undefined ?  Cookies.get("token") : null
    const axiosInstance = axios.create({
        baseURL: "http://localhost:3001", // Updated API base URL
        headers: { Authorization: `Bearer ${token}` },
      });

    //   code for fetching history
    useEffect(() => {
      axiosInstance.get("/publichistory/history")
      .then((res) => setExecutions(res.data))
      .catch((err) => console.error("Error fetching executions:", err))
    

    }, [])

      // Fetch comments when execution changes
    useEffect(() => {

        if (executions.length === 0) return
        const executionId  =  executions[currentIndex].id

        axiosInstance.get(`/comment/${executionId}`)
        .then((res) => setComments(res.data))
        .catch((err) => console.error("Error fetching comments:", err))
    }, [currentIndex,executions])
    
      // Handle comment submission

    const handlePostComment = async ()=> {
        if (!newComment.trim()) return
        const executionId  =  executions[currentIndex].id

        try {
            const res  =  await axiosInstance.post(`/comment/${executionId}`, {content:newComment})
            if (res.status === 200||  res.status === 201 ){
                setComments([...comments, res.data])
                setNewComment("")
                setShowCommentBox(false)
            }
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    }

    // hnadle deletion  functionality 
    const handleDeleteComment = async(commentId:number)=>{
        try {
           await axiosInstance.delete(`/comment/${commentId}`)
           setComments(comments.filter((comment) =>  comment.id !==  commentId))
        }  catch (err) {
          console.error("Error deleting comment:", err);
        }
    }

    //function for like 
    const handleLikeComment=async(commentId:number)=>{
      try {
        await axiosInstance.patch(`/comment/like/${commentId}`)
        setComments((prevcomments) => 
        prevcomments.map((comment) =>  comment.id ===  commentId ? {...comment,  likes:comment.likes+1} :comment))
      } catch (err) {
        console.error("Error liking comment:", err);
      }
    } 

    // function  for the dislike
    const handleDislikeComment =  async(commentId:number) => {
      try {
        await axiosInstance.patch(`/comment/dislike/${commentId}`);
        setComments((prevcomments) => 
        prevcomments.map((comment) =>  comment.id ===  commentId ? {...comment, dislikes:comment.dislikes+1} : comment))
      } catch (error) {
        
      }
    }


    if (executions.length === 0) return <p>Loading executed codes...</p>;
    return (
      <>
        {/* Page Header */}
        <div className="bg-[#F9FAFB] text-blue-500 flex items-center justify-center p-4">
          <h1 className="text-3xl font-extrabold text-blue-500">
            Community Executed Codes
          </h1>
        </div>
    
        <div className="w-full min-h-screen bg-[#F9FAFB] p-6 flex flex-col items-center">
          {/* Sidebar Toggle Button */}
          <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="text-3xl text-blue-500 fixed top-5 right-5 z-50 cursor-pointer"
      >
        {isSidebarOpen ? <IoClose /> : <IoMenu />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">Menu</h2>
          <ul className="space-y-3">
            <li
              onClick={() => router.push("/landing")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105"
            >
              Home
            </li>

            <li
            onClick={() => router.push("/userprofile")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105"
            >
              Settings
            </li>
            <li
            onClick={() => router.push("/execute")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105"
            >
              Code
            </li>

            <li
              onClick={handlelogout}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white transform hover:scale-105"
            >
              Logout
            </li>
          </ul>
        </div>
      </div>
    
          {/* Main Content */}
          <div className="w-full h-full flex flex-row  gap-6">
            {/* Executed Code Card */}
            {executions.length > 0 && (
              <div className="w-full bg-white h-full  shadow-md rounded-lg p-6 border">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Executed Code
                </h2>
                <div className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm font-mono overflow-auto max-h-60">
                  <pre className="whitespace-pre-wrap">
                    {executions[currentIndex].code}
                  </pre>
                </div>
                <button
                onClick={() => setShowOutPut(!showOutPut)}
                 className="mt-3 w-1/4 bg-gray-700 text-white font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                    {showOutPut ? <><FaChevronUp />Hide</> : <> <FaChevronDown /> Show</>}
                </button>
                {showOutPut && (
                                      <p className="text-sm text-gray-600 mt-3">
                                      <span className="font-semibold">Language:</span>{" "}
                                      {executions[currentIndex].language} |{" "}
                                      <span className="font-semibold"> Output:</span>{" "}
                                      {executions[currentIndex].output}
                                    </p>
                )}

    
                {/* Navigation */}
                <div className="mt-4 flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                  >
                    ◀
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(prev + 1, executions.length - 1))
                    }
                    disabled={currentIndex === executions.length - 1}
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}
    
            {/* Comments Section */}
            <div className="w-full bg-white shadow-md rounded-lg p-6 border">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Comments</h2>
    
              {comments.length === 0 ? (
                <p className="text-gray-500 italic">
                  No comments yet. Be the first to add one!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-3 rounded-md border border-blue-500 hover:bg-gray-100 cursor-pointer"
                    >
                      <p className="text-gray-800">
                        <span className="font-semibold text-blue-600">
                          {comment.user?.name || "unknown"}
                        </span>
                      </p>
                      <p className="text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
    
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center gap-1 px-2 py-1  text-blue-500 bg-gray-200 text-xs rounded-full transition cursor-pointer"
                        >
                         <IoArrowUpSharp /> {comment.likes}
                        </button>
                        <button
                          onClick={() => handleDislikeComment(comment.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-blue-500 text-xs rounded-full transition cursor-pointer"
                        >
                            <IoArrowDownSharp />{comment.dislikes}
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="px-2 py-1 bg-[#2F2078] cursor-pointer text-white text-xs rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
    
              {/* Add Comment Button */}
              <button
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="mt-4 cursor-pointer  bg-[#F0EDFF] text-blue-500 font-bold px-4 py-2 transition flex items-center justify-center gap-2 rounded-full "
              >
                {showCommentBox ? "Cancel" : <><IoAddOutline className="text-sm" /> Reply  </>} 
              </button>
    
              {/* Comment Input Box */}
              {showCommentBox && (
                <div className="mt-4">
                  <textarea
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    onClick={handlePostComment}
                    className="mt-3 w-full bg-blue-500 text-white font-medium px-4 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Post Comment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
    
    
}