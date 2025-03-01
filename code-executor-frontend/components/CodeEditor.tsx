'use client'
import React, { useState, useEffect } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";
import { executeCode, getCodeSuggestion } from '@/lib/api';
import LanguageSelect from './LanguageSelect';
import { RxResume } from "react-icons/rx";
import { VscCopilot } from "react-icons/vsc";

const defaultCode = {
    python: "print('Hello, World!')",
    javascript: "console.log('Hello, World!');",
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
} as const;

type Language = keyof typeof defaultCode;

const CodeEditor = () => {
    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState<string>(defaultCode[language]);
    const [output, setOutput] = useState<string>("");
    const monaco = useMonaco();

    useEffect(() => {
        setCode(defaultCode[language]); // Update code when language changes
    }, [language]);

    useEffect(() => {
        if (!monaco) return;

        // Enable IntelliSense for JavaScript/TypeScript
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
        });

        // Register language features
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

        // Python suggestions
        registerCompletions("python", [
            { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print()" },
            { label: "for loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "for i in range():\n\t" },
            { label: "while loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "while condition:\n\t" },
            { label: "def function", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "def function_name():\n\t" },
            { label: "len()", kind: monaco.languages.CompletionItemKind.Function, insertText: "len()" },
        ]);

        // Go suggestions
        registerCompletions("go", [
            { label: "fmt.Println", kind: monaco.languages.CompletionItemKind.Function, insertText: "fmt.Println()" },
            { label: "for loop", kind: monaco.languages.CompletionItemKind.Snippet, insertText: "for i := 0; i < n; i++ {\n\t\n}" },
        ]);

    }, [monaco]);

    const handleRun = async () => {
        const result = await executeCode(code, language);
        setOutput(result);
    };

    const handleSuggest = async () => {
        const aiSuggestion = await getCodeSuggestion(language, code);
        setCode(prevCode => `${prevCode}\n${aiSuggestion}`);
    };

    return (
        <div className="w-[90%] mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col">
            {/* Language Selector */}
            <LanguageSelect language={language} setLanguage={(lang) => setLanguage(lang as "python" | "javascript" | "go")} />


            {/* Buttons */}
            <div className="flex gap-3 mt-1 mb-4">
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
                options={{
                    fontSize: 14,
                    suggest: { showWords: true, showFunctions: true, showVariables: true },
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
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
