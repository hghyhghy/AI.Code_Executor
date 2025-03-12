
"use client";
import {useEffect,useState} from 'react';
import axios  from 'axios';
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
    createdAt:string
}

export default  function  ExecutedCodes(){

    const [executions, setExecutions] = useState<ExecutionHistory[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("");
    const [showCommentBox, setShowCommentBox] = useState(false);

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

    if (executions.length === 0) return <p>Loading executed codes...</p>;
    return (
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Executed Code</h1>
    
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre className="whitespace-pre-wrap">{executions[currentIndex].code}</pre>
          </div>
    
          <p className="text-sm text-gray-500 mt-2">
            Language: {executions[currentIndex].language} | Output: {executions[currentIndex].output}
          </p>
    
          {/* Navigation */}
          <div className="mt-4 flex justify-between">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              Prev
            </button>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, executions.length - 1))}
              disabled={currentIndex === executions.length - 1}
            >
              Next
            </button>
          </div>
    
          {/* Comments Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Comments</h2>
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-gray-100 rounded my-2">
                  <p>{comment.content}</p>
                  <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
    
            {/* Add Comment Button */}
            <button
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add Comment
            </button>
    
            {/* Comment Input Box */}
            {showCommentBox && (
              <div className="mt-2">
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={handlePostComment}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      );
    
}