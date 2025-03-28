"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { GoArrowRight } from "react-icons/go";
import Image from "next/image";
import { LiaHashtagSolid, LiaTagSolid } from "react-icons/lia";
import { AiOutlineDoubleLeft } from "react-icons/ai";
import { AiOutlineDoubleRight } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";

const topics = [
    "Web Development",
    "AI/Machine Learning",
    "Cybersecurity",
    "Data Science",
    "Cloud Computing"
];

export default function ExamPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [examId, setExamId] = useState<number | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [examResults, setExamResults] = useState<any[]>([]);
    const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    

    const token = Cookies.get("token");

    // Function to delete a specific exam history
    const deleteExamHistory = async (examId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/exam/delete/${examId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to delete the exam");

            toast.success("Exam history deleted successfully!");
            setExamResults((prevResults) => prevResults.filter((exam) => exam.examId !== examId));
            setDropdownIndex(null); // Close dropdown after deleting
        } catch (error) {
            toast.error("Error deleting exam history!");
        } finally {
            setLoading(false);
        }
    };

    // Fetch User Exam Results on Mount
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch('http://localhost:3001/exam/result', {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch results");

                const data = await response.json();
                setExamResults(data);
            } catch (error) {
                toast.error('Error fetching exam results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [token]);

    const startExam = async (topic: string) => {
        setSelectedTopic(topic);
        setLoading(true);
        setCurrentQuestionIndex(0)

        try {
            const res = await fetch("http://localhost:3001/exam/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ topic }),
            });

            if (!res.ok) throw new Error("Failed to start Exam");

            const data = await res.json();
            setExamId(data.examId);
            setQuestions(data.questions);
            setAnswers({});
            setScore(null);
        } catch (error) {
            toast.error("Error fetching questions!");
        } finally {
            setLoading(false);
        }
    };

    const submitAnswers = async () => {
        if (!examId) return;
        try {
            const res = await fetch(`http://localhost:3001/exam/evaluate/${examId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answers }),
            });

            if (!res.ok) throw new Error("Failed to submit answers");

            const data = await res.json();
            setScore(data.score);
            toast.success("Exam submitted successfully");
        } catch (error) {
            toast.error("Error submitting answers");
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#F6F6F6] shadow-md p-4 animate-fade-in">
                <div className="flex flex-row justify-between">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Available Topics</h2>
                    <span className="bg-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xl text-black transition-transform duration-300 hover:rotate-90">
                        <GoArrowRight />
                    </span>
                </div>
                <ul className="space-y-5">
                    {topics.map((topic, index) => (
                        <li key={index}>
                            <button
                                className={`w-full text-left p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 h-[6rem] font-semibold text-blue-900 cursor-pointer shadow-md ${
                                    selectedTopic === topic
                                        ? "text-gray-900 border border-gray-800 bg-[#2B7FFF] "
                                        : "text-black bg-[#F3F5F7] border border-gray-800 hover:bg-[#ECEDEA]"
                                }`}
                                onClick={() => startExam(topic)}
                            >
                                <span className="bg-gray-200 rounded-full px-2 py-2 mr-2 inline-block transition-all duration-300 hover:bg-gray-300">
                                    {index + 1}
                                </span>
                                {topic}
                                <br />
                                <div className="mt-2 flex flex-row justify-between">
                                    <span className="flex items-center gap-2 text-sm bg-gray-200 rounded px-2 py-1 text-black w-[9rem] transition-all duration-300 hover:bg-gray-300">
                                        Multiple Choice
                                    </span>
                                    <BsThreeDots className="text-lg mt-2 transition-all duration-300 hover:text-gray-600 cursor-pointer" />
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
    
            {/* Main Content */}
            <div className="flex-1 p-6">
                {selectedTopic ? (
                    <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full  h-[25rem] mx-auto relative top-30">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Topic: {selectedTopic}</h2>
                        {loading && <p className="text-gray-600">Loading Questions...</p>}
    
                        {!loading && questions.length > 0 && (
                            <div>
                                <div className="mb-4 p-4 border rounded-lg relative top-20">
                                    <p className="font-medium text-gray-800 mb-2">
                                        {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {questions[currentQuestionIndex].options.map((option: string, optIndex: number) => (
                                            <button
                                                key={optIndex}
                                                className={`px-4 py-2 rounded-md text-sm border transition-all duration-200 text-blue-500 cursor-pointer ${
                                                    answers[currentQuestionIndex] === option ? "bg-blue-500 text-white" : "bg-gray-200"
                                                }`}
                                                onClick={() =>
                                                    setAnswers({ ...answers, [currentQuestionIndex]: option })
                                                }
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* {navigation  buttons } */}

                                <div className=" flex justify-between  mt-4">
                                            <button
                                            className={`px-4 py-2 rounded-md bg-gray-500 text-white relative top-25 ${                                            currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
                                            }`}
                                            onClick={() => setCurrentQuestionIndex((prev) =>  prev-1)}
                                            disabled={currentQuestionIndex ===0}


                                            >
                                              <AiOutlineDoubleLeft />

                                            </button>

                                            {currentQuestionIndex <  questions.length -1 ? (
                                                <button
                                                 className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 relative top-25"
                                                 onClick={() =>  setCurrentQuestionIndex((prev) =>  prev+1)}
                                                >
                                                                                                  <AiOutlineDoubleRight />
 

                                                </button>
                                            ) : (

                                                <button
                                                  className="px-4 py-2 rounded-md bg-blue-900 text-white hover:bg-transparent hover:border border-blue-500 bo relative top-25 hover:text-blue-500 cursor-pointer"
                                                  onClick={submitAnswers}
                                                >
                                                    Submit 
                                                </button>
                                            )}
                                </div>

                            </div>
                        )}
    
                        {score !== null && (
                            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                                <h3 className="text-lg font-bold">Your score: {score}</h3>
                            </div>
                        )}
                    </div>
                ) : loading ? (
                    <p className="text-gray-600 text-center">Loading exam results...</p>
                ) : examResults.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg text-center border border-gray-400">
                        <h2 className="text-2xl mb-4 font-bold text-gray-800">No Exam Records Found</h2>
                        <p className="text-gray-600">Start an exam by selecting a topic from the sidebar.</p>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full border-2 border-gray-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Your Exam History</h2>
    
                        {/* Exam Results Grid */}
                        <div className="flex flex-col gap-6">
                            {examResults.map((exam, index) => (
                                <div key={index} className="flex flex-row justify-between relative">
                                    {/* Exam Info */}
                                    <div className="p-4 bg-[#F6F6F6] border w-[50rem] rounded-lg">
                                        <div className=" flex flex-row  justify-between">
                                            <div>
                                                <p className="font-medium  text-gray-900 bg-blue-200 px-2 py-1 rounded-full flex flex-row gap-2 mx-auto">
                                                    <LiaTagSolid className="mt-1 text-lg" />
                                                    {exam.topic}
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setDropdownIndex(dropdownIndex === index ? null : index)}
                                                    className="text-gray-600 hover:text-gray-900 p-2 rounded-md transition"
                                                >
                                                    <BsThreeDots className="text-xl" />
                                                </button>
    
                                                {dropdownIndex === index && (
                                                    <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-md border border-gray-300">
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
                                                            onClick={() => deleteExamHistory(exam.examId)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-600">Score: <span className="font-bold">{exam.score}</span>/5</p>
                                        <p className="text-gray-600">Answers: <span className="font-bold">{JSON.stringify(exam.answer)}</span></p>
                                        <p className="text-gray-600 text-sm">Attempted on: {new Date(exam.date).toLocaleDateString()}</p>                                    
                                    </div>
    
                                    {/* Exam Image */}
                                    <Image src="/exam.jpeg" width={300} height={300} alt="exam" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    

}
  