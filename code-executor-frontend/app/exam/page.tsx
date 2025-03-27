'use client';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { GoArrowRight } from "react-icons/go";
import { BsThreeDots } from "react-icons/bs";

const topics = ["Web Development", "AI/Machine Learning", "Cybersecurity", "Data Science", "Cloud Computing"];

export default function ExamPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [examId, setExamId] = useState<number | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const token = Cookies.get("token");

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
                {!selectedTopic ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-lg mx-auto">
                        <h2 className="text-2xl mb-4 font-bold text-gray-800">Choose a topic</h2>
                        <p className="text-gray-600">Select a topic from the sidebar to begin your exam.</p>
                    </div>
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
