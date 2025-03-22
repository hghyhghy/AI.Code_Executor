"use client"
import { useState,useEffect } from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
import Modal from "react-modal";



export   default function BlogsPage(){    
    useEffect(() => {
    Modal.setAppElement(document.body); // Attach modal to body instead of #modal-root
  }, []);
    const [articles, setArticles] = useState<{id:number, title: string; content: string }[]>([])
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<{ id:number,title: string; content: string } | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [topic, setTopic] = useState("");


    const token = Cookies.get("token")
      // Fetch Articles
    useEffect(() => {
        if(!token) return 
        axios.get("http://localhost:3001/interview/my-articles" , {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }).then((res) =>  setArticles(res.data)).catch((err) => console.error("Error fetching articles:", err))
    },[token])

    const openModal = (article: { id:number,title: string; content: string }) =>{
        setSelectedArticle(article);
        setNewTitle(article.title)
        setNewContent(article.content)
        setModalIsOpen(true)

    }

    const closeModal =()=>{
        setModalIsOpen(false)
        setSelectedArticle(null)

    }

      // Generate Article (calls AI-powered endpoint)
    const generateArticleContent=()=>{
        if(!topic.trim()) return alert("enter a topic name")
        axios.post("http://localhost:3001/interview/generate",{topic},{
    headers:{
        Authorization:`Bearer ${token}`
    }}).then((res) => {
        setArticles([...articles , res.data])
        setTopic("")
    }).catch((err) => console.error("Error generating article:", err))
    }

      // Update Article Title
    const updateTitle=()=>{
        if (selectedArticle) {
            axios.put(`http://localhost:3001/interview/update/${selectedArticle.id}`, 
                {title:newTitle},
                {headers:{
                    Authorization:`Bearer ${token}`
                }}
            ).then(() => {
                setArticles((prev) => 
                prev.map((art) => art.id === selectedArticle.id ? {...art, title:newTitle} : art))
                closeModal()
            }).catch((err) => console.error("Error updating article:", err))
        } else {
            console.error("No article selected for update.");
        }
    }

    const updateContent=()=>{
        if (!selectedArticle) {
            console.error("No article selected for update.");
            return;
        }
        axios.put( `http://localhost:3001/interview/update/${selectedArticle.id}`, 

            {content:newContent},
            {headers:{
                Authorization:`Bearer ${token}`
            }}
        ).then(() => {
            setArticles((prev) =>  prev.map((art) =>  art.id === selectedArticle.id ? {...art, content:newContent}: art))
        })
    }

      // Delete Article

      const deleteArticle=(id:number)=>{
        axios.delete(`http://localhost:3001/interview/delete/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }).then(() =>{
            setArticles((articles.filter((art) => art.id !== id)))
            closeModal()
        }).catch((err) => console.error("Error deleting article:", err));
      }
      return (

        <main className=' min-h-screen bg-[#FFFFFF]'>

        <div className="max-w-lg mx-auto mt-10 ">
          {/* Generate Article Section */}
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Enter topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border rounded p-2 flex-grow text-gray-800"
            />
            <button
              onClick={generateArticleContent}
              className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
              Generate
            </button>   
          </div>
    
          {/* Articles List */}
          {articles.map((article) => (
            <div key={article.id} className="border rounded-lg p-4 mb-4 shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-blue-500">{article.title}</h2>
                <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm">Done</span>
              </div>
              <div className="border rounded p-2 mt-2 bg-gray-100">
                <p className="truncate  text-gray-800">{article.content}</p>
              </div>
              <button
                onClick={() => openModal(article)}
                className="text-blue-500 mt-2 underline"
              >
                Show More
              </button>
            </div>
          ))}
    
          {/* Modal */}
          {modalIsOpen && (
            <div id="modal-root">
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              >
                <div className="bg-white p-6 rounded-lg w-96">
                  <h2 className="text-lg font-semibold mb-2 text-blue-500">Edit Article</h2>
    
                  {/* Update Title */}
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border rounded p-2 w-full mb-2 text-gray-950"
                  />
                  <button onClick={updateTitle} className="bg-yellow-500 text-white px-4 py-2 rounded w-full mb-2">
                    Update Title
                  </button>
    
                  {/* Update Content */}
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="border rounded p-2 w-full mb-2 h-32 text-gray-800"
                  />
                  <button onClick={updateContent} className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2">
                    Update Content
                  </button>
    
                  {/* Delete & Close Buttons */}
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => selectedArticle && deleteArticle(selectedArticle.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                    <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
                      Close
                    </button>
                  </div>
                </div>
              </Modal>
            </div>
          )}
        </div>
        </main>

      );

}