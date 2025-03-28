'use client';
import {  useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { GoArrowRight } from "react-icons/go";
import { BsThreeDots } from "react-icons/bs";
import Image from "next/image";
import { LiaHashtagSolid } from "react-icons/lia";
import { LiaTagSolid } from "react-icons/lia";
const topics = ["Web Development", "AI/Machine Learning", "Cybersecurity", "Data Science", "Cloud Computing"];

export default function ExamPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [examId, setExamId] = useState<number | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [examResults, setExamResults] = useState <any[]>([])

    const token = Cookies.get("token");
        // Fetch User Exam Results on Mount
    useEffect(() => {

        const fetchResults  =  async() => {
            try {
                
                const response  =  await fetch('http://localhost:3001/exam/result' ,{
                    method:"GET",
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                })
                if(!response.ok) throw new Error("Failed to fetch results ")
                const data = await response.json()
            setExamResults(data)    
            } catch (error) {
                toast.error('Error fetching exam results ')
            } 
            finally{
                setLoading(false)
            }
        };

        fetchResults();
    }, [token])

    const startExam = async (topic: string) => {
        setSelectedTopic(topic);
        setLoading(true);

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
                            ? "text-white border border-gray-800 bg-[#2B7FFF] hover:bg-[#1447E6]"
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
            {loading ? (
    <p className="text-gray-600 text-center">Loading exam results...</p>
) : examResults.length === 0 ? (
    <div className="bg-white p-6 rounded-lg  text-center w-full max-w-lg mx-auto border border-gray-400">
        <h2 className="text-2xl mb-4 font-bold text-gray-800">No Exam Records Found</h2>
        <p className="text-gray-600">Start an exam by selecting a topic from the sidebar.</p>
    </div>
) : (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full mx-auto border-2 border-gray-300">
        <div>

        <span className="text-sm font-bold text-gray-800 mb-4 flex flex-row gap-2 bg-[#f7f7f7] w-1/8 p-1 rounded-lg">  <LiaHashtagSolid className=" text-xl"  /> Multiple Choice  </span>
        </div>

        {/* Grid Layout for Exam Results */}
        <div className=" flex flex-col sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examResults.map((exam, index) => (
                <div key={index} className=" flex flex-row justify-between">
                    <div  className="p-4  rounded-lg  bg-[#F6F6F6] border w-[50rem]">

                    <p className="font-medium text-gray-900  flex flex-row gap-2 bg-blue-200    w-1/9  p-1 rounded-full "><LiaTagSolid className=" mt-1 text-lg font-bold" />{exam.topic}</p>
                    <p className="text-gray-600">
                        Score: <span className="font-bold">{exam.score}</span>/5
                    </p>
                    <p className="text-gray-600">
                        Answers: <span className="font-bold">{JSON.stringify(exam.answer)}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                        Attempted on: {new Date(exam.date).toLocaleDateString()}
                    </p>
                    </div>
                    <div>
                        <Image
                        src="/exam.jpeg"
                        width={300}
                        height={300}
                        alt="exam"
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
)}

                {!selectedTopic ? (
                    ""
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Topic: {selectedTopic}</h2>
                        {loading && <p className="text-gray-600">Loading Questions...</p>}

                        {!loading && questions.length > 0 && (
                            <div>
                                {questions.map((q, index) => (
                                    <div key={index} className="mb-4 p-4 border rounded-lg">
                                        <p className="font-medium text-gray-800 mb-2">
                                            {index + 1}. {q.question}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((option: string, optIndex: number) => (
                                                <button
                                                    key={optIndex}
                                                    className={`px-4 py-2 rounded-md text-sm border transition-all duration-200 text-blue-500 ${
                                                        answers[index] === option ? "bg-green-500 text-white" : "bg-gray-200"
                                                    }`}
                                                    onClick={() => setAnswers({ ...answers, [index]: option })}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300"
                                    onClick={submitAnswers}
                                >
                                    Submit Exam
                                </button>
                            </div>
                        )}

                        {score !== null && (
                            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                                <h3 className="text-lg font-bold">Your score: {score}</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
