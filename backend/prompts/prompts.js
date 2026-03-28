exports.summaryPrompt = (article) => `
Summarize this news into exactly 4 bullet points.
Each point must be short and clear.
No extra text.

${article}
`;

exports.impactPrompt = (article) => `
Explain why this news matters in real life.
Give 3-4 simple sentences.
Be specific and clear.

${article}
`;

exports.chatPrompt = (article, question) => `
You are an AI assistant helping a user understand a news article.

Article:
${article}

Question:
${question}

Rules:
- Answer clearly
- Only use article info
- If not in article, say "Not mentioned in the article"
- No markdown formatting in JSON
`;

exports.navigatorPrompt = (articles) => {
  const combinedText = articles
    .map((a, i) => `${i + 1}. ${a.title}: ${a.content}`)
    .join("\n");

  return `
You are an AI news intelligence system.

Analyze the following multiple news articles and provide:

1. A combined summary (3-4 lines)
2. 5 key insights (bullet points)
3. 3 important questions users should think about

Articles:
${combinedText}

Respond in JSON format:
{
  "summary": "...",
  "insights": ["...", "...", "...", "...", "..."],
  "questions": ["...", "...", "..."]
}
`;
};
