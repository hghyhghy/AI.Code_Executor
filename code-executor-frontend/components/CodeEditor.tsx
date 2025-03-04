'use client'
import React, { useState, useEffect ,useRef} from 'react';
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import * as monaco from 'monaco-editor';
import { executeCode, getCodeSuggestion } from '@/lib/api';
import LanguageSelect from './LanguageSelect';
import { RxResume } from "react-icons/rx";
import { VscCopilot } from "react-icons/vsc";

type CodeEditorProps = {
    folderId?: number;
    folderName?: string;
    fileId?: number;
    fileContent?: string;
    language?: string;
    onContentChange?: (fileId: number, newContent: string) => void; 
    updateFile: (folderId: number, fileName: string, content: string) => void;// <-- Add this to update parent
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
    onContentChange // <-- Added
}: CodeEditorProps) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [language, setLanguage] = useState<Language>(initialLanguage as Language || "python");
    const [code, setCode] = useState<string>(fileContent || defaultCode[language]); 
    const [output, setOutput] = useState<string>("");
    const monaco = useMonaco();

    // 🔄 When a new file is selected, update code
    useEffect(() => {
        if (fileContent !== undefined) {
            setCode(fileContent);
        }
    }, [fileId, fileContent]);

    // 🔄 When the language changes, set default code ONLY IF no file is open
    useEffect(() => {
        if (!fileContent) {
            setCode(defaultCode[language]); // Don't overwrite if file is open
        }
    }, [language]);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
    
        // Detect when the editor loses focus (blur event)
        editor.onDidBlurEditorText(() => {
          if (folderId && folderName) {
            updateFile(folderId, folderName, code);
          }
        });
      };

    // 🔄 Monaco Editor Setup (Syntax Highlighting, Suggestions)
    useEffect(() => {
        if (!monaco) return;

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
        });

        monaco.languages.register({ id: "python" });
        monaco.languages.register({ id: "go" });

        const registerCompletions = (lang: string, suggestions: any[]) => {
            monaco.languages.registerCompletionItemProvider(lang, {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };
                    return { suggestions: suggestions.map(s => ({ ...s, range })) };
                },
            });
        };

        registerCompletions("python", [
            { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print()" },
            { label: "for loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "for i in range():\n\t" },
            { label: "while loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "while condition:\n\t" },
            { label: "def function", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "def function_name():\n\t" },
            { label: "len()", kind: monaco.languages.CompletionItemKind.Function, insertText: "len()" },
        ]);

        registerCompletions("go", [
            { label: "fmt.Println", kind: monaco.languages.CompletionItemKind.Function, insertText: "fmt.Println()" },
            { label: "for loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "for i := 0; i < n; i++ {\n\t\n}" },
        ]);

    }, [monaco]);

    // 🔄 Handle Code Execution
    const handleRun = async () => {
        const result = await executeCode(code, language);
        setOutput(result);
    };

    // 🔄 AI Code Suggestion
    const handleSuggest = async () => {
        const aiSuggestion = await getCodeSuggestion(language, code);
        setCode(prevCode => `${prevCode}\n${aiSuggestion}`);
    };
    const handleSave = () => {
        console.log("Debug - Saving file with:", { folderId, fileId, fileContent: code });
    
        if (folderId == null || fileId == null) { // Only triggers alert if values are missing
            alert("Folder or File ID is missing!");
            return;
        }
    
        updateFile(folderId, folderName || "Untitled", code);
    };
    
    
    

    return (
        <div className="w-[120%] mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
            {/* Language Selector */}
            <LanguageSelect language={language} setLanguage={(lang) => setLanguage(lang as Language)} />

            {/* Buttons */}
            <div className="flex gap-3 mt-1 mb-4">
            <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
                >
                    💾 Save
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
      onMount={handleEditorDidMount} // Attach the blur event on mount
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
