import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function QuestionsList() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:3333/problems");
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions", error);
      }
    };
    fetchQuestions();
  }, []);

  // ✅ Pass the ID
  const goToCompiler = (id) => {
    navigate(`/home/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Questions</h1>
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          {questions.map((q) => (
            <div
              key={q._id}
              onClick={() => goToCompiler(q._id)} 
              className="flex justify-between items-center p-4 rounded-md cursor-pointer hover:bg-gray-100 transition"
            >
              <span className="font-medium text-lg">{q.title}</span>
              <span
                className={`px-2 py-1 text-sm rounded ${
                  q.level === "Easy"
                    ? "bg-green-100 text-green-700"
                    : q.level === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {q.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
