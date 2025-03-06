
'use client'
import { useEffect,useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"

interface CodeData {

    language:string,
    code:string,
    output?:string
}
export  default function ViewSharedCode(){

    const { codeId } =  useParams()
    const [codeData, setCodeData] = useState<CodeData | null>(null)

    useEffect(() => {
        const fetchCode =  async() => {
            try {
            
                const res=  await axios.get(`http://localhost:3001/share/${codeId}`)
                setCodeData(res.data)
    
    
            } catch (error) {
                console.error("Error fetching code:", error);
            }
        };

        fetchCode()
        
    },[codeId])


  if (!codeData) return <p className="text-center mt-10">Loading...</p>;
  return (

        <div  className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
                  <h1 className="text-2xl font-bold mb-4">Shared Code</h1>
      <p className="text-gray-600">Language: {codeData.language}</p>
      <pre className="bg-gray-900 text-white p-4 rounded-md mt-3 w-full max-w-2xl">
        {codeData.code}
      </pre>

      {codeData.output && (
        <div className="mt-3 p-3 bg-gray-200 border rounded-md">
          <p className="font-bold">Output:</p>
          <pre>{codeData.output}</pre>
        </div>
      )}

        </div>
  )
}   