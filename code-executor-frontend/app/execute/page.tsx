
"use client";
import CodeEditor from "@/components/CodeEditor";

export default  function ExecutePage() {

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
            <h1 className=" font-bold text-3xl mb-6 mt-2"> Online Code Editor </h1>
            <CodeEditor/>
        </div>
    )
}