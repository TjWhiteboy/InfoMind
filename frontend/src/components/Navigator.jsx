import React, { useState } from "react";
import { navigatorAI } from "../services/api";

const Navigator = ({ articles }) => {
  const [data, setData] = useState(null);

  const handleAnalyze = async () => {
    try {
      const res = await navigatorAI(articles);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 border mt-4">
      <button
        onClick={handleAnalyze}
        className="bg-green-500 text-white px-4 py-2"
      >
        Analyze Trends
      </button>

      {data && (
        <div className="mt-4">
          <h2 className="font-bold">Summary</h2>
          <p>{data.summary}</p>

          <h3 className="mt-3 font-bold">Insights</h3>
          {data.insights.map((i, idx) => (
            <p key={idx}>• {i}</p>
          ))}

          <h3 className="mt-3 font-bold">Questions</h3>
          {data.questions.map((q, idx) => (
            <p key={idx}>• {q}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navigator;
