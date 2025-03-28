'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { FaCode, FaTrashAlt } from "react-icons/fa";
import Cookies from "js-cookie";

interface ExecutionHistory {
  id: number;
  user: {
    name: string;
  };
  code: string;
  language: string;
  output: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0)
  const [redirect, setRedirect] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")

  const router = useRouter()
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token not found");

        const { data } = await axios.get("http://localhost:3001/execution-history/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(data);
        setCurrentIndex(0)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteSpecificHistory = async (entryId:Number) => {
    try {
      setDeleting(true)
      const token  =  localStorage.getItem("token")
      await axios.delete(`http://localhost:3001/execution-history/delete/${entryId}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })

      const updatehistory =  history.filter(entry =>  entry.id  !== entryId)
      setHistory(updatehistory)
      setCurrentIndex(prev =>  (prev >= updatehistory.length -1  ?  prev-1: prev))

    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeleting(false);
    }
  }

  const confirmDeleteAll = async() => {
    if(deleteInput.toLowerCase() === "delete all"){
      setDeleting(true)
    }
      try {
        setDeleting(true)
  
        const token  = localStorage.getItem("token")
        await axios.delete("http://localhost:3001/execution-history/delete-all",{
          headers:{
  
            Authorization:`Bearer ${token}`
          }
        });
        setHistory([])
        setShowModal(false)
        setDeleteInput("")
        setCurrentIndex(0)
        alert("All execution history deleted successfully!");
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setDeleting(false);
      }
  }

  const  nextEntry =()=>{
    if(currentIndex <  history.length -1){
        setCurrentIndex((prev) =>  prev+1)
    }
  }

  const  prevEntry=()=>{
    if (currentIndex > 0){
        setCurrentIndex((prev) => prev-1)
    }
  }
  const handleRedirect = ()=> {
    if(redirect){
        router.push("/execute")
    }
  }
  // Get the user's name from the first history entry (since it's the same for all)
  const username = history.length > 0 ? history[0].user.name : "";
  const  progress  =  history.length > 0 ?  ((currentIndex + 1)/history.length) * 100 :  0;
  console.log(history.length)

  return (
    
    <div className="min-h-screen bg-gray-200 text-black flex flex-col items-center p-3 w-full">

<div className="w-[20%] h-3 bg-gray-300 rounded overflow-hidden mt-4  relative -left-64 top-[5.5rem]">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

      {loading && <p className="text-gray-400">Loading history...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && history.length === 0 && (
        <p className="text-gray-400">No execution history found.</p>
      )}



      {history.length > 0 && (
        <>  
    <div className="w-full bg-white rounded shadow-lg text-black  border-b-neutral-950 mb-5 flex flex-row items-start justify-start mt-10">

         <div className=" flex flex-row justify-evenly">

            <div className="flex justify-start mb-4 gap-3 py-3 px-3 top-2 relative">
                  <button 
                    className={` cursor-pointer text-white gap-2  px-6 py-2 rounded  flex flex-row items-center justify-center  ${currentIndex === 0 ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-500'}`}
                    onClick={prevEntry}
                    disabled={currentIndex === 0}
                  >
                      <GrPrevious 
                      className="font-bold text-white text-1xl"
                      />
                    Prev
                  </button>
                  <button 
                    className={` cursor-pointer text-white px-6 py-2 gap-2 rounded  flex flex-row items-center justify-center ${currentIndex === history.length - 1 ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-500'}`}
                    onClick={nextEntry}
                    disabled={currentIndex === history.length - 1}
                  >
                      Next
                      <GrNext 
                      className="font-bold text-white text-1xl"
                      />
                  </button>


                {username && <h2 className=" text-sm font-semibold  mt-3  uppercase "><span className="text-blue-400">{username}</span></h2>}


                </div>
                <div className="relative ml-[40rem] flex flex-wrap items-center justify-between gap-5   px-6 py-3 bg-white shadow-md rounded-md">
  
  {/* Delete Specific Entry */}
                            <button
                              className="px-4 py-2 flex items-center gap-2 bg-[#2F2078] text-white rounded  disabled:bg-red-300 cursor-pointer"
                              onClick={() => deleteSpecificHistory(history[currentIndex]?.id)}
                              disabled={deleting}
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </button>

                            {/* Delete All Entries */}
                            {/* <button
                            onClick={() => setShowModal(true)}
        className="px-4 py-2 flex items-center gap-2 bg-[#2F2078] text-white rounded disabled:bg-red-400 cursor-pointer">
         Delete All
      </button> */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black  bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-lg font-semibold text-red-600">Are you sure?</h2>
            <p className="text-sm text-gray-300 my-2">
              Type <strong>"delete all"</strong> below to confirm deletion.
            </p>

            {/* Input Field */}
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="border p-2 w-full mt-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-300"
              placeholder='Type "delete all" here'
            />

            <div className="flex justify-between mt-4">
              {/* Cancel Button */}
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
                onClick={() => {
                  setShowModal(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </button>

              {/* Confirm Delete Button */}
              <button
                className={`px-4 py-2 rounded text-white  ${
                  deleteInput.toLowerCase() === "delete all"
                    ? "bg-gray-700 cursor-pointer"
                    : "bg-red-300 cursor-not-allowed"
                }`}
                disabled={deleteInput.toLowerCase() !== "delete all"}
                onClick={confirmDeleteAll}
              >
                {deleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

                            {/* Execution Redirect */}
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={redirect}
                                  onChange={() => setRedirect(!redirect)}
                                  className="w-4 h-4 cursor-pointer accent-blue-500"
                                />
                              </label>

                              <button
                                className="cursor-pointer border border-blue-500 text-black gap-2 px-4 py-2 rounded flex items-center justify-center hover:bg-blue-100"
                                onClick={handleRedirect}
                              >
                                <FaCode className="text-black text-lg" />
                                Execute
                              </button>
                         </div>

</div>

         </div>

                

        </div>
            
        <div className="w-full  bg-white p-6 rounded-lg shadow-lg text-black  border-b-neutral-950">


          {/* Table Layout for Execution History */}
          <table className="w-full border-collapse shadow-lg rounded-lg overflow-hidden">
  <thead>
    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-black uppercase text-sm font-semibold">
      <th className="p-4 border-l border-r border-gray-400">Execution Time</th>
      <th className="p-4 border-l border-r border-gray-400">Language</th>
      <th className="p-4 border-l border-r border-gray-400">Code</th>
      <th className="p-4 border-l border-r border-gray-400">Output</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-300">
    <tr className="text-center">
      <td className="p-4 border-l border-r border-gray-400">
        {new Date(history[currentIndex].createdAt).toLocaleString()}
      </td>
      <td className="p-4 border-l border-r border-gray-400 text-yellow-500 font-semibold">
        {history[currentIndex].language}
      </td>
      <td className="p-4 border-l border-r border-gray-400">
        <pre className="bg-gray-50 p-3 rounded-md text-sm max-w-[1950px] whitespace-pre-wrap break-words overflow-x-auto">
          {history[currentIndex].code}
        </pre>
      </td>
      <td className="p-4 border-l border-r border-gray-400">
        <pre className="bg-gray-50 p-3 rounded-md text-sm max-w-[1950px] whitespace-pre-wrap break-words overflow-x-auto">
          {history[currentIndex].output}
        </pre>
      </td>
    </tr>
  </tbody>
</table>



        </div>
        </>
      )}
    </div>
  );
}
