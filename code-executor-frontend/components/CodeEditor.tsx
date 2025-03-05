'use client'
import React, { useState, useEffect, useRef } from 'react';
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import * as monaco from 'monaco-editor';
import { executeCode, getCodeSuggestion } from '@/lib/api';
import LanguageSelect from './LanguageSelect';
import { RxResume } from "react-icons/rx";
import { VscCopilot } from "react-icons/vsc";
import { FaRegSave } from "react-icons/fa";

type CodeEditorProps = {
    folderId?: number;
    folderName?: string;
    fileId?: number;
    fileContent?: string;
    language?: string;
    onContentChange?: (fileId: number, newContent: string) => void;
    updateFile: (folderId: number, fileName: string, content: string) => void;
};

const defaultCode = {
    python: "print('Hello, World!')",
    javascript: "console.log('Hello, World!');",
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`};

type Language = keyof typeof defaultCode;

const CodeEditor = ({
    folderId,
    folderName,
    fileId,
    fileContent,
    language: initialLanguage,
    updateFile,
    onContentChange
}: CodeEditorProps) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [language, setLanguage] = useState<Language>(initialLanguage as Language || "python");
    const [code, setCode] = useState<string>(fileContent || defaultCode[language]);
    const [output, setOutput] = useState<string>("");

    const monacoInstance = useMonaco();

    // Update code when a new file is selected
    useEffect(() => {
        if (fileContent !== undefined) {
            setCode(fileContent);
        }
    }, [fileId, fileContent]);

    // Change default code only if no file is selected
    useEffect(() => {
        if (!fileContent) {
            setCode(defaultCode[language]);
        }
    }, [language]);

    // Handle editor mount
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;

        // Auto-save when editor loses focus
        editor.onDidBlurEditorText(() => {
            if (folderId && folderName) {
                updateFile(folderId, folderName, code);
            }
        });
    };

    // Save Function
    const handleSave = () => {
        if (folderId == null || fileId == null) {
            alert("Folder or File ID is missing!");
            return;
        }
        updateFile(folderId, folderName || "Untitled", code);
    };

    // Code Execution
    const handleRun = async () => {
        const result = await executeCode(code, language);
        setOutput(result);
    };

    // AI Code Suggestion
    const handleSuggest = async () => {
        const aiSuggestion = await getCodeSuggestion(language, code);
        setCode(prevCode => `${prevCode}\n${aiSuggestion}`);
    };

    return (
        <div className="w-[120%] mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
            {/* Language Selector */}
            <LanguageSelect language={language} setLanguage={(lang) => setLanguage(lang as Language)} />

            {/* Buttons */}
            <div className="flex gap-3 mt-1 mb-4">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gray-100 text-black hover:bg-blue-600  font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
                >
                     <FaRegSave />
                     Save
                </button>
                <button
                    onClick={handleRun}
                    className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
                >
                    <RxResume className="text-lg" /> Run
                </button>
                <button
                    onClick={handleSuggest}
                    className="flex items-center gap-2 cursor-pointer bg-black hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
                >
                    <VscCopilot className="text-lg" /> Code Copilot
                </button>
            </div>

            {/* Code Editor */}
            <Editor
                height="500px"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 14,
                    autoClosingBrackets: "always",
                    autoClosingQuotes: "always",
                    tabCompletion: "on",
                }}
            />

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
