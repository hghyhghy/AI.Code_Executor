'use client'
import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
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

type Language = "python" | "javascript" | "go";

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
    const [fileContents, setFileContents] = useState<{ [key: number]: string }>({});
    const [currentFileId, setCurrentFileId] = useState<number | null>(fileId ?? null);
    const [output, setOutput] = useState<string>("");

    // Load file content when switching files
    useEffect(() => {
        if (fileId !== undefined) {
            setCurrentFileId(fileId);
            setFileContents((prev) => ({
                ...prev,
                [fileId]: prev[fileId] ?? fileContent ?? "",
            }));
        }
    }, [fileId, fileContent]);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;

        // Auto-save when editor loses focus
        editor.onDidBlurEditorText(() => {
            if (folderId && currentFileId !== null) {
                updateFile(folderId, folderName || "Untitled", fileContents[currentFileId]);
            }
        });
    };

    const handleEditorChange = (value?: string) => {
        if (value !== undefined && currentFileId !== null) {
            setFileContents((prev) => ({
                ...prev,
                [currentFileId]: value,
            }));
        }
    };

    const handleSave = () => {
        if (folderId == null || currentFileId == null) {
            alert("Folder or File ID is missing!");
            return;
        }
        onContentChange?.(currentFileId, fileContents[currentFileId]);
        updateFile(folderId, folderName || "Untitled", fileContents[currentFileId]);
    };

    const handleRun = async () => {
        if (!fileContents[currentFileId || 0]) return;
        const result = await executeCode(fileContents[currentFileId || 0], language);
        setOutput(result);
    };

    const handleSuggest = async () => {
        const aiSuggestion = await getCodeSuggestion(language, fileContents[currentFileId || 0]);
        setFileContents((prev) => ({
            ...prev,
            [currentFileId || 0]: `${prev[currentFileId || 0]}\n${aiSuggestion}`,
        }));
    };

    return (
        <div className="w-[120%] mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
            <LanguageSelect language={language} setLanguage={(lang) => setLanguage(lang as Language)} />

            <div className="flex gap-3 mt-1 mb-4">
                <button onClick={handleSave} className="flex items-center gap-2 bg-gray-100 text-black cursor-pointer hover:bg-gray-200 font-medium py-2 px-5 rounded-lg shadow-md transition duration-200">
                    <FaRegSave /> Save
                </button>
                <button onClick={handleRun} className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-5 rounded-lg shadow-md transition duration-200">
                    <RxResume className="text-lg" /> Run
                </button>
                <button onClick={handleSuggest} className="flex items-center gap-2 cursor-pointer bg-black hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow-md transition duration-200">
                    <VscCopilot className="text-lg" /> Code Copilot
                </button>
            </div>

            <Editor
                height="500px"
                theme="vs-dark"
                language={language}
                value={fileContents[currentFileId || 0]}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 14,
                    autoClosingBrackets: "always",
                    autoClosingQuotes: "always",
                    tabCompletion: "on",
                }}
            />

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
