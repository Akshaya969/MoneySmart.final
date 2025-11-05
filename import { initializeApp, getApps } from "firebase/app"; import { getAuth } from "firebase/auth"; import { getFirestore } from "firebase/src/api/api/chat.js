export default async function handler(req, res) {
  const { question } = req.body || {};
  if (!question)
    return res.status(400).json({ error: "Missing question" });

  // Only answer finance/business/economics topics
  const forbidden = ["personal", "love", "health", "password", "romance"];
  const validTopics = ["finance", "business", "economics", "money", "budget"];
  const lower = question.toLowerCase();
  const valid = validTopics.some((v) => lower.includes(v));
  const invalid = forbidden.some((f) => lower.includes(f));

  if (!valid || invalid) {
    return res.json({
      answer:
        "MoneySmart only answers questions related to finance, business, or economics. Please rephrase your question.",
    });
  }

  // Placeholder response (replace later with OpenAI API call)
  const answer = `Here's a helpful insight about ${question}: Stay focused on budgeting, investments, and smart decision-making!`;

  res.json({ answer });
}

