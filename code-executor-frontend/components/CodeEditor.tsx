'use client'
import React, { useState } from 'react'
import Editor from "@monaco-editor/react";
import { executeCode , getCodeSuggestion } from '@/lib/api'
import LanguageSelect from './LanguageSelect';

const CodeEditor=() => {
    const [code, setCode] = useState<string>("print('Hello, World')");
    const [language, setLanguage] = useState<string>("python");
    const [output, setOutput] = useState<string>("");
    const [suggestion, setSuggestion] = useState<string>("")

    const handleRun = async () => {
        const result = await executeCode(code, language);
        setOutput(result);
    };

    const handleSuggest = async () => {
        const aisuggestion = await getCodeSuggestion(language,code)
        setSuggestion(aisuggestion)
    }

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
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            >
                Run
            </button>

            <button
            onClick={handleSuggest}
             className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Ai Suggestion

            </button>

            {/* Output Section */}
            <div className="mt-4 p-2 bg-gray-800 rounded w-full">
                <h3 className="text-lg font-semibold">Output</h3>
                <pre className="text-green-400 whitespace-pre-wrap break-words">
                    {output || "No output yet"}
                </pre>
            </div>

            {/* Suggestion Section */}
            {suggestion && (

                <div  className="mt-4 p-2 bg-gray-700 rounded w-full">
                     <h3 className="text-lg font-semibold">AI Suggestion</h3>
                     <pre className="text-yellow-400 whitespace-pre-wrap break-words">
                        {suggestion}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
