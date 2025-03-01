'use client'
import React, { useState } from 'react'
import Editor from "@monaco-editor/react";
import { executeCode } from '@/lib/api'
import LanguageSelect from './LanguageSelect';

const CodeEditor=() => {
    const [code, setCode] = useState<string>("print('Hello, World')");
    const [language, setLanguage] = useState<string>("python");
    const [output, setOutput] = useState<string>("");

    const handleRun = async () => {
        const result = await executeCode(code, language);
        setOutput(result);
    };

    return (
        <div className="w-1/2 mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
            {/* Language Selector */}
            <LanguageSelect language={language} setLanguage={setLanguage} />

            {/* Code Editor */}
            <Editor
                height="300px"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{ fontSize: 14 }}
            />

            {/* Run Button */}
            <button
                onClick={handleRun}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Run
            </button>

            {/* Output Section */}
            <div className="mt-4 p-2 bg-gray-800 rounded w-full">
                <h3 className="text-lg font-semibold">Output</h3>
                <pre className="text-green-400 whitespace-pre-wrap break-words">
                    {output || "No output yet"}
                </pre>
            </div>
        </div>
    );
};

export default CodeEditor;
