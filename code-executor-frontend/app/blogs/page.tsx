"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { LuTableOfContents } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";
export default function BlogsPage() {
  useEffect(() => {
    Modal.setAppElement(document.body);
  }, []);

  const [activeSection, setActiveSection] = useState<"generate" | "blogs">("generate");
  const [articles, setArticles] = useState<{ id: number; title: string; content: string }[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ id: number; title: string; content: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [topic, setTopic] = useState("");
  const [wordLimit, setWordLimit] = useState <number>(300)
  const [language, setLanguage] = useState <string>("English")
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const token = Cookies.get("token");
  const router= useRouter()

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:3001/interview/my-articles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArticles(res.data))
      .catch((err) => console.error("Error fetching articles:", err));
  }, [token]);

  const openModal = (article: { id: number; title: string; content: string }) => {
    setSelectedArticle(article);
    setNewTitle(article.title);
    setNewContent(article.content);
    setModalIsOpen(true);
  };

  const handleRightClick=(e:React.MouseEvent,article:{id:number, title:string, content:string})=>{
    e.preventDefault()
    setSelectedArticle(article)
    setShowDeleteButton(true)
    setTimeout(() => setShowDeleteButton(false), 5000);

  }

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedArticle(null);
    setShowDeleteButton(false)
  };

  const generateArticleContent = () => {
    if (!topic.trim()) return alert("Enter a topic name");
    axios
      .post(
        "http://localhost:3001/interview/generate",
        { topic,wordLimit,language },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setArticles([...articles, res.data]);
        setTopic("");
        setWordLimit(500)
        setLanguage('English')
        setActiveSection("blogs"); // Switch to Blogs section after generating
      })
      .catch((err) => console.error("Error generating article:", err));
  };

  const updateTitle = () => {
    if (!selectedArticle) return;
    axios
      .put(
        `http://localhost:3001/interview/update/title/${selectedArticle.id}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setArticles((prev) =>
          prev.map((art) => (art.id === selectedArticle.id ? { ...art, title: newTitle } : art))
        );
        closeModal();
      })
      .catch((err) => console.error("Error updating article:", err));
  };

  const updateContent = () => {
    if (!selectedArticle) return;
    axios
      .put(
        `http://localhost:3001/interview/update/content/${selectedArticle.id}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setArticles((prev) =>
          prev.map((art) => (art.id === selectedArticle.id ? { ...art, content: newContent } : art))
        );
      });
  };

  const deleteArticle = (id: number) => {
    axios
      .delete(`http://localhost:3001/interview/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setArticles(articles.filter((art) => art.id !== id));
        closeModal();
      })
      .catch((err) => console.error("Error deleting article:", err));
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 p-4 min-h-screen shadow-md">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveSection("generate")}
              className={`w-full text-left px-4 py-2 rounded cursor-pointer ${
                activeSection === "generate" ? "bg-[#2B7FFF] text-white" : ""
              }`}
            >
              Generate
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("blogs")}
              className={`w-full text-left px-4 py-2 rounded cursor-pointer ${
                activeSection === "blogs" ? "bg-[#2B7FFF] text-white":""
              }`}
            >
              Blogs
            </button>
          </li>
        </ul>

      </aside>

      {/* Main Content */}
{/* Main Content */}
<div className="flex-grow p-6 w-full max-w-4xl mx-auto">
  {activeSection === "generate" && (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Generate Article</h1>
      <div className="w-full max-w-md mx-auto p-4">
  {/* Form Heading */}
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate AI-Powered Content</h2>

  {/* Form Fields */}
  <div className="space-y-4">
    {/* Topic Name */}
    <input
      type="text"
      placeholder="TOPIC NAME"
      onChange={(e) =>setTopic(e.target.value) }
      className="w-full border-b border-gray-300 p-2 text-gray-700 outline-none focus:border-black"
    />

    {/* Word Limit */}
    <input
      type="number"
      placeholder="WORD LIMIT"
      onChange={(e) => setWordLimit(parseInt(e.target.value) || 500)}
      className="w-full border-b border-gray-300 p-2 text-gray-700 outline-none focus:border-black"
    />

    {/* Language Selection */}
    <select 
    onChange={(e) => setLanguage(e.target.value)}
    className="w-full border-b border-gray-300 p-2 text-gray-700 bg-transparent outline-none focus:border-black">
      <option value="English">English</option>
      <option value="Spanish">Spanish</option>
      <option value="French">French</option>
      <option value="German">German</option>
      <option value="Chinese">Chinese</option>
    </select>
  </div>

  {/* Checkbox Section */}
  <div className="flex items-start mt-4">
    <input type="checkbox" id="terms" className="mt-1" />
    <label htmlFor="terms" className="ml-2 text-gray-600 text-sm">
      By clicking you agree to accept our{" "}
      <span className="font-bold">terms & conditions</span> and confirm that the information is correct.
    </label>
  </div>

  {/* Generate Button */}
  <button 
  onClick={generateArticleContent}
  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
    Generate Content
  </button>
  <button 
  onClick={() => router.push('/community')}
  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
    Go Back
  </button> 
</div>



    </div>
  )}

  {activeSection === "blogs" && (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Blogs</h1>
      {articles.map((article) => (
        <div 
        key={article.id} 
        className="border rounded-lg p-4 mb-4 shadow-md w-full"
        onContextMenu={(e) => {
          e.preventDefault()
          setSelectedArticle(article)
          handleRightClick(e,article)
        }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-row gap-2">
              <LuTableOfContents className="mt-1 text-lg text-blue-500" />
              <h2 className="text-lg font-semibold text-blue-500">{article.title}</h2>
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm">Done</span>
            </div>
          </div>
          <div className="border rounded p-2 mt-2 bg-gray-100 overflow-hidden">
            <p className="truncate text-gray-800">{article.content}</p>
          </div>
          <button onClick={() => openModal(article)} className="text-blue-500 mt-2 underline">
            Show More
          </button>
        </div>
      ))}
    </div>
  )}
{modalIsOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50"
    onClick={closeModal} // Close when clicking outside
  >
    <div
      className="bg-[#262626] p-6 rounded-lg w-[64rem] shadow-lg relative h-[39rem] ml-28"
      onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
    >

      <h2 className="text-lg font-semibold mb-2 text-gray-200">Manage your Article </h2>

      {/* Update Title */}
      <div className=" flex flex-row gap-2 items-center justify-center">

      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        className="border  p-2 w-1/2 mb-2 text-gray-300 bg-[#393939] border-none outline-none  rounded-lg"
        />
      <button onClick={updateTitle} className="bg-blue-500 text-white px-2 py-2  w-1/9 mb-2 rounded-lg">
        Update 
      </button>
      <div className="flex justify-between ">
        <button
          onClick={() => selectedArticle && deleteArticle(selectedArticle.id)}
          className="bg-red-500 text-white px-5 py-2  w-full rounded-full"
          >
          Delete
        </button>
          </div>

        </div>
        <button onClick={closeModal} className=" text-white px-4 py-2 rounded mb-1 absolute top-3 left-[60rem] cursor-pointer">
      <RxCross2 className=" text-2xl" />
        </button>

      {/* Update Content */}
      <textarea
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
         className="border rounded p-2 w-full mb-2 h-[22rem] text-gray-400 outline-none border-none mt-5
             scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-300"
      />
      <div className=" bg-[#181818] w-[64rem] -ml-6 p-5 rounded-md">

      <button onClick={updateContent} className="bg-blue-500 text-white px-4 py-2 rounded w-1/5 mb-2  mt-3">
        Update Content
      </button>

      {/* Delete & Close Buttons */}




      </div>
    </div>
  </div>
)}

</div>

    </main>
  );
}   
