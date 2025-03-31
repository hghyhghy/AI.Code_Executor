
"use client";
import {useEffect,useState} from 'react';
import axios  from 'axios';
import { jwtDecode } from "jwt-decode"
import Cookies from 'js-cookie';
import { IoAddOutline, IoClose, IoMenu } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaCode, FaCrown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { CiSettings } from "react-icons/ci";
import { FaGithub } from "react-icons/fa";
import { ImBlogger } from "react-icons/im";
import { PiExam } from "react-icons/pi";
import { FaRegHeart } from "react-icons/fa";
import { BiDislike } from "react-icons/bi";
import { FaDeleteLeft } from "react-icons/fa6";

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
    dislikes:number,
    replies?: Comment[];

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
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
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

    // handle comment submission
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
    
      // Handle reply submission

      const handlePostReply = async (parentId: number) => {
        if (!replyText[parentId]?.trim()) return;
    
        const executionId = executions[currentIndex].id;
    
        try {
            const response = await fetch(`http://localhost:3001/comment/reply/${executionId}/${parentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Include token if required
                },
                body: JSON.stringify({ content: replyText[parentId] }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to post reply");
            }
    
            const newReply = await response.json();
    
            // Clear reply input after posting
            setReplyText((prev) => ({ ...prev, [parentId]: "" }));
            setReplyingTo(null);
    
            // Correctly update the comment state by nesting replies
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === parentId
                        ? {
                              ...comment,
                              replies: [...(comment.replies || []), newReply], // Add new reply inside replies array
                          }
                        : comment
                )
            );
        } catch (err) {
            console.error("Error posting reply:", err);
        }
    };
    
      

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
        <div className="bg-[#F2F2F6] text-blue-500 flex items-center justify-center p-4">
          <h1 className="text-3xl font-extrabold text-blue-500">
            Community Executed Codes
          </h1>
        </div>
    
        <div className="w-full min-h-screen bg-[#F2F2F6] p-6 flex flex-col items-center">
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
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <IoHomeOutline className=' text-2xl' /> <h2 className=' text-1xl'>Home</h2>
            </li>


            <li
            onClick={() => router.push("/execute")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <FaCode className=' text-2xl' />

              Code
            </li>
            <li
            onClick={() => router.push("/subscription")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <FaCrown  className=' text-2xl
              ' />
              Go pro
            </li>
            <li
            onClick={() => router.push("/Github")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <FaGithub   className=' text-2xl
              ' />
              Github
            </li>
            <li
            onClick={() => router.push("/blogs")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <ImBlogger    className=' text-2xl
              ' />
                Blogs
             </li>
             <li
            onClick={() => router.push("/exam")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <PiExam     className=' text-2xl
              ' />
                Mock Test
             </li>

            <li
            onClick={() => router.push("/userprofile")}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white transform hover:scale-105 flex flex-row gap-2"
            >
              <CiSettings className=' text-2xl' />

              Settings
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
              <div className="w-[120rem] bg-white h-[25rem]  shadow-md rounded-lg p-6 border">
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
            <div className="w-1/2  rounded-lg p-6 ">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Comments</h2>
    
              {comments.length === 0 ? (
                <div className=' bg-white rounded-2xl  p-3'>

                <p className="text-gray-500 italic">
                  No comments yet. Be the first to add one!
                </p>
                </div>
              ) : (
                <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-3 rounded-2xl cursor-pointer">
                    {/* Comment Info */}
                    <div className="flex flex-row gap-3">
                      <p className="text-gray-800">
                        <span className="font-semibold text-blue-600 uppercase">
                          {comment.user?.name || "Unknown"}
                        </span>
                      </p>
                      <p className="text-xs mt-1 text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Comment Content */}
                    <p className="text-gray-800">{comment.content}</p>

                    {/* Actions: Like, Dislike, Delete, Reply */}
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1 px-2 py-1 text-blue-500 text-xs rounded-full cursor-pointer">
                        <FaRegHeart className="text-lg" /> {comment.likes}
                      </button>
                      <button onClick={() => handleDislikeComment(comment.id)} className="flex items-center gap-1 px-2 py-1 text-blue-500 text-xs rounded-full cursor-pointer">
                        <BiDislike className="text-lg" /> {comment.dislikes}
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="px-2 py-1 cursor-pointer text-blue-500 text-xs rounded transition flex items-end justify-end">
                        <FaDeleteLeft className="text-lg relative left-[12rem]" />
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="px-2 py-1 text-blue-500 text-xs rounded cursor-pointer"
                      >
                        <IoAddOutline className="text-sm" /> Reply
                      </button>
                    </div>

                    {/* Reply Input (Shown when user clicks 'Reply') */}
                    {replyingTo === comment.id && (
                      <div className="mt-2">
                        <textarea
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Write a reply..."
                          value={replyText[comment.id] || ""}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => handlePostReply(comment.id)}
                          className="mt-2 w-full bg-blue-500 text-white font-medium px-4 py-2 rounded-md hover:bg-green-700 transition"
                        >
                          Post Reply
                        </button>
                      </div>
                    )}

                    {/* Display Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-6 mt-3 border-l-2 border-gray-300 pl-4 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-100 p-2 rounded-md">
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold text-blue-600">{reply.user?.name || "Unknown"}</span>{" "}
                              - {new Date(reply.createdAt).toLocaleString()}
                            </p>
                            <p className="text-gray-800">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
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