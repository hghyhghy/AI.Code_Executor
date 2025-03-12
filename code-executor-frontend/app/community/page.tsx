
"use client";
import {useEffect,useState} from 'react';
import axios  from 'axios';
import { jwtDecode } from "jwt-decode";
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
    }
}

interface DecodedToken {
  id: number;
  exp: number;
}

export default  function  ExecutedCodes(){

    const [executions, setExecutions] = useState<ExecutionHistory[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("");
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          setUserId(decoded.id);
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
    }, []);

    const token  =  typeof window !== undefined ?  localStorage.getItem("token") : null
    const axiosInstance = axios.create({
        baseURL: "http://localhost:3001", // Updated API base URL
        headers: { Authorization: `Bearer ${token}` },
      });

    //   code for fetching history
    useEffect(() => {
      axiosInstance.get("/execution-history/history")
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


    if (executions.length === 0) return <p>Loading executed codes...</p>;
    return (
      <div className="w-full min-h-screen bg-[#F9FAFB] p-6 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Community Executed Codes</h1>
  
        {/* Executed Code Card */}
        <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 border">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Executed Code</h2>
          <div className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm font-mono overflow-auto max-h-60">
            <pre className="whitespace-pre-wrap">{executions[currentIndex].code}</pre>
          </div>
  
          <p className="text-sm text-gray-600 mt-3">
            <span className="font-semibold">Language:</span> {executions[currentIndex].language} | 
            <span className="font-semibold"> Output:</span> {executions[currentIndex].output}
          </p>
  
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
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, executions.length - 1))}
              disabled={currentIndex === executions.length - 1}
            >
               ▶
            </button>
          </div>
        </div>
  
        {/* Comments Section */}
        <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 mt-6 border">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Comments</h2>
  
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">No comments yet. Be the first to add one!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-100 p-3 rounded-md">
                      <p className="text-gray-800">
                            <span className="font-semibold text-blue-600">{comment.user?.name || "unknown"}</span>
                          </p>
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="px-2 py-1 bg-[#2F2078] cursor-pointer  text-white text-xs rounded  transition"
                                  >
                                    Delete
                                  </button>
                                
                </div>

                

              ))}
            </div>
          )}
  
          {/* Add Comment Button */}
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="mt-4 w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            {showCommentBox ? "Cancel" : "Add Comment"}
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
                className="mt-3 w-full bg-green-600 text-white font-medium px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Post Comment
              </button>
            </div>
          )}
        </div>
      </div>
    );
    
}