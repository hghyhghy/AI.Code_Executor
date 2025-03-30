"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
type ExamResult = {
  id: number;
  topic: string;
  score: number;
};

type User = {
  id: number;
  name: string;
};

export default function StudentExamPage() {
  const router = useRouter();
  const [token1, settoken] = useState<string>()
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(true); // ✅ Show modal on page load
  const [secretKey, setSecretKey] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [pendingExams, setPendingExams] = useState<
    { id: number; topic: string; questions: { text: string; options: string[] }[] }[]
  >([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState(["", "", "", "", ""]);
  const [examId, setExamId] = useState<number | null>(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState<number | null>(null);
 const  token  = Cookies.get("token")


  useEffect(() => {
 
    if (!isAdmin) {
      fetchStudentData();
    }
  }, [isAdmin]);

  // ✅ Handle Secret Key Submission
  const handleSecretKeySubmit = async () => {
    if (secretKey === "1111") {
      setIsAdmin(true);
      try {
        const { data } = await axios.get("http://localhost:3001/student-exam/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        });
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    setShowModal(false); // ✅ Hide modal after submission
  };
  const assignExam = async () => {
    if (!selectedUser || !topic || questions.some((q) => q.trim() === "")) {
      alert("Please fill all fields");
      return;
    }
  
    console.log("Assigning Exam with Data:", {
      secretkey: secretKey,
      userId: Cookies.get('token'),
      topic,
      questions,
    });
  
    try {
       await fetch('http://localhost:3001/student-exam/assign', {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          secretkey: secretKey,
          userId: Cookies.get('token'),
          topic,
          questions,
        }),
      });

  
      alert("Exam assigned successfully!");
    } catch (error) {
      console.error("Error assigning exam:", error);
    }
  };
  

  const submitExam = async () => {
    if (!examId) {
      alert("No exam selected");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/student-exam/submit",
        { studentexamid: examId, answers },
        {
          headers: { Authorization: `Bearer ${token1}` },
        }
      );
      alert("Exam submitted successfully!");
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  const evaluateExam = async () => {
    if (!examId || score === null) {
      alert("Enter a valid score");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/student-exam/evaluate",
        { secretkey: secretKey, studentexamid: examId, score },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Exam evaluated successfully!");
    } catch (error) {
      console.error("Error evaluating exam:", error);
    }
  };

  const fetchStudentData = async () => {
    console.log("Assigning Exam with Data:", {
      userId: selectedUser,
    });
    try {
      const pendingRes = await axios.get("http://localhost:3001/student-exam/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingExams(pendingRes.data);

      const resultRes = await axios.get("http://localhost:3001/student-exam/results", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExamResults(resultRes.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ✅ Admin Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Admin Verification</h2>
            <input
              type="password"
              placeholder="Enter Admin Secret Key"
              className="border p-2 w-full mb-4"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleSecretKeySubmit}
              >
                Submit
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Student Examination Portal</h1>

      {/* Student Dashboard */}
      {!isAdmin ? (
        <>
          <h2 className="text-xl font-semibold mb-2">Pending Exams</h2>
          {pendingExams.length > 0 ? (
            pendingExams.map((exam) => (
              <div key={exam.id} className="p-4 border mb-2">
                <h3 className="font-semibold">{exam.topic}</h3>
                {exam.questions.map((q, index) => (
                  <div key={index}>
                    <p>{q.text}</p>
                    {q.options.map((opt, i) => (
                      <label key={i} className="block">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={opt}
                          onChange={() => setAnswers({ ...answers, [index]: opt })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ))}
                <button 
                onClick={submitExam}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                  Submit Exam
                </button>
              </div>
            ))
          ) : (
            <p>No pending exams</p>
          )}

          <h2 className="text-xl font-semibold mt-6">Exam Results</h2>
          {examResults.length > 0 ? (
            examResults.map((result) => (
              <p key={result.id}>
                {result.topic} - Score: {result.score}/100
              </p>
            ))
          ) : (
            <p>No exam results available</p>
          )}
        </>
      ) : (
        <>
          {/* Admin Dashboard */}
          <h2 className="text-xl font-semibold mb-2">Assign Exam</h2>
          <select
            onChange={(e) => setSelectedUser(Number(e.target.value))}
            className="border p-2"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} (ID: {user.id})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Topic"
            className="border p-2 mt-2 w-full"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          {questions.map((q, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Question ${index + 1}`}
              className="border p-2 mt-2 w-full"
              value={q}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index] = e.target.value;
                setQuestions(newQuestions);
              }}
            />
          ))}

          <button 
          onClick={assignExam}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
            Assign Exam
          </button>

          <h2 className="text-xl font-semibold mt-6">Evaluate Exam</h2>
          <input
            type="number"
            placeholder="Exam ID"
            className="border p-2 mt-2 w-full"
            value={examId || ""}
            onChange={(e) => setExamId(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Score (0-100)"
            className="border p-2 mt-2 w-full"
            value={score || ""}
            onChange={(e) => setScore(Number(e.target.value))}
          />
          <button 
          onClick={evaluateExam}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Submit Score
          </button>
        </>
      )}
    </div>
  );
}
