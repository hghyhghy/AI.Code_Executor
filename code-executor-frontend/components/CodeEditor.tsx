'use client'
import React, { useState, useEffect } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";
import { executeCode, getCodeSuggestion } from '@/lib/api';
import LanguageSelect from './LanguageSelect';
import { RxResume } from "react-icons/rx";
import { VscCopilot } from "react-icons/vsc";

const CodeEditor = () => {
    const [code, setCode] = useState<string>("print('Hello, World')");
    const [language, setLanguage] = useState<string>("python");
    const [output, setOutput] = useState<string>("");
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // Enable IntelliSense for JavaScript and TypeScript
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
            });

            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ESNext,
                allowNonTsExtensions: true,
            });

            // Enable IntelliSense for Python, Go, and other languages
            if (monaco && language === "python") {
                // Load Python language features
                monaco.languages.register({ id: "python" });
    
                // Register completion provider for basic Python suggestions
                monaco.languages.registerCompletionItemProvider("python", {
                    provideCompletionItems: (model, position) => {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };
                        return {
                            suggestions: [
                                { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print()", detail: "Python built-in function", range: range },
                                { label: "for loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "for i in range():\n\t", detail: "Python loop", range: range },
                                { label: "while loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "while condition:\n\t", detail: "Python loop", range: range },
                                { label: "def function", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "def function_name():\n\t", detail: "Python function", range: range },
                                { label: "list append", kind: monaco.languages.CompletionItemKind.Method, insertText: "list.append(value)", detail: "List method", range: range },
                                { label: "dict get", kind: monaco.languages.CompletionItemKind.Method, insertText: "dict.get(key, default)", detail: "Dictionary method", range: range },
                                { label: "len()", kind: monaco.languages.CompletionItemKind.Function, insertText: "len()", detail: "Get length of an object", range: range },
                            ],
                        };
                    },
                });
            }

            if (language === "go") {
                monaco.languages.registerCompletionItemProvider("go", {
                    provideCompletionItems: (model, position) => {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };
                        return {
                            suggestions: [
                                {
                                    label: "fmt.Println",
                                    kind: monaco.languages.CompletionItemKind.Function,
                                    insertText: "fmt.Println()",
                                    detail: "Go built-in function",
                                    range: range,
                                },
                                {
                                    label: "for",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "for i := 0; i < n; i++ {\n\t\n}",
                                    detail: "Go loop",
                                    range: range,
                                },
                            ],
                        };
                    },
                });
            }
        }
    }, [monaco, language]);

    const handleRun = async () => {
        const result = await executeCode(code, language);
        setOutput(result);
    };

    const handleSuggest = async () => {
        const aiSuggestion = await getCodeSuggestion(language, code);
        setCode((prevCode) => prevCode + "\n" + aiSuggestion);
    };

    return (
        <div className="w-[90%] mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
            {/* Language Selector */}
            <LanguageSelect language={language} setLanguage={setLanguage} />

            {/* Code Editor */}
            <Editor
                height="500px"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                    fontSize: 14,
                    suggest: { showWords: true, showFunctions: true, showVariables: true }, // Enable auto-suggestions
                    quickSuggestions: true, // Show suggestions while typing
                    parameterHints: { enabled: true }, // Show function parameter hints
                    autoClosingBrackets: "always", // Auto-close brackets
                    autoClosingQuotes: "always", // Auto-close quotes
                    tabCompletion: "on", // Enable tab completion
                }}
            />

            {/* Buttons */}
{/* Buttons */}
{/* Buttons */}
<div className="flex gap-3 mt-4">
    <button
        onClick={handleRun}
        className="flex items-center gap-2 cursor-pointer bg-gray-100  hover:bg-gray-200 text-black font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
    >
        <RxResume className="text-lg" /> Run
    </button>

    <button
        onClick={handleSuggest}
        className="flex items-center gap-2 cursor-pointer bg-black hover:bg-black-50 text-white font-medium py-2 px-5 rounded-lg shadow-md transition duration-200"
    >
        <VscCopilot className="text-lg" /> Code Copilot
    </button>
</div>



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
