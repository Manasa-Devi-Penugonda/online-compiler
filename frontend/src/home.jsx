import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./home.css";

function Home() {
  const { id } = useParams();
  const [code, setCode] = useState(
    `import sys\nuser_input = sys.stdin.read().strip()\nprint(f'Hello, {user_input}')`
  );
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [submitResult, setSubmitResult] = useState(null);
  const [question, setQuestion] = useState(null);
  const [hiddenTestCases, setHiddenTestCases] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3333/problems/${id}`);
        setQuestion(data);
        setHiddenTestCases(data.hiddenTestCases || []);
        if (data.sampleInputs?.length > 0) {
          setInput(data.sampleInputs[0]);
        }
      } catch (err) {
        console.error("Error fetching problem:", err);
      }
    };

    fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (language === 'python') {
      setCode(`import sys\nuser_input = sys.stdin.read().strip()\nprint(f'Hello, {user_input}')`);
    } else {
      setCode('');
    }
  }, [language]);

  const runUserCode = async (inputVal) => {
    const payload = {
      language,
      code,
      input: inputVal,
    };

    const { data } = await axios.post(`http://localhost:3333/run`, payload);
    return data.output;
  };

  const handleRun = async () => {
    setSubmitResult(null);
    setIsRunning(true);
    setOutput("");

    try {
      const outputResult = await runUserCode(input);
      setOutput(outputResult);
      setSubmitResult(null);
    } catch (error) {
      console.log(error.response);
      setOutput("⚠️ Error while running your code.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitResult(null);
    setIsSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:3333/submit`, {
        code,
        language,
        problemId: question._id,
      });

      const { result } = response.data;
      if (result === "pass") {
        setSubmitResult("✅ All Test Cases Passed!");
      } else {
        setSubmitResult("❌ Some Test Cases Failed.");
      }
    } catch (err) {
      setSubmitResult("❌ Error while running hidden tests");
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!question) return <p className="p-6 text-center">Loading problem...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-screen bg-gray-100">
      {/* Left Panel */}
      <div className="bg-white p-5 rounded shadow-md space-y-4 border-l-4 border-blue-400">
        <h1 className="text-2xl font-bold text-blue-600">{question.title}</h1>

        <section className="bg-blue-50 p-3 rounded">
          <h2 className="font-semibold">Explanation</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {question.description}
          </p>
        </section>

        <section className="bg-green-50 p-3 rounded">
          <h2 className="font-semibold">Input Format</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {question.inputFormat}
          </p>
        </section>

        <section className="bg-yellow-50 p-3 rounded">
          <h2 className="font-semibold">Output Format</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {question.outputFormat}
          </p>
        </section>

        <section className="bg-gray-50 p-3 rounded">
          <h2 className="font-semibold">Sample Input</h2>
          <div className="text-sm text-gray-700 space-y-1">
            {question.sampleInputs?.map((input, idx) => (
              <div key={idx}>
                {idx + 1}. {input}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Center Panel */}
      <div className="bg-white p-5 rounded shadow-md flex flex-col border-l-4 border-purple-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Code Editor</h2>
          <div className="text-sm">
            <label className="mr-2 font-medium">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              {/* Add more as needed */}
            </select>
          </div>
        </div>

        <Editor
          height="400px"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-light"
          options={{
            fontSize: 12,
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            autoIndent: "advanced",
          }}
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex-1 py-2 rounded text-white ${
              isRunning ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isRunning ? "Running..." : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded text-white ${
              isSubmitting ? "bg-green-300" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {submitResult && (
          <div className="mt-3 text-center text-sm font-semibold text-gray-700">
            {submitResult}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="bg-white p-5 rounded shadow-md space-y-4 border-l-4 border-teal-400">
        <div>
          <h2 className="text-lg font-semibold mb-2">Input</h2>
          <textarea
            rows="6"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input here"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <div className="bg-gray-100 rounded p-3 text-sm font-mono min-h-[100px] whitespace-pre-wrap">
            {isRunning ? "Running..." : output || "Output will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
