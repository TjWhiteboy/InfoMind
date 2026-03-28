const axios = require("axios");

const callAI = async (prompt, maxTokens = 300) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini", // OpenRouter model name
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.5
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000", // Required by OpenRouter
        "X-Title": "InfoMind" // Required by OpenRouter
      }
    }
  );

  return response.data.choices[0].message.content;
};

module.exports = { callAI };
