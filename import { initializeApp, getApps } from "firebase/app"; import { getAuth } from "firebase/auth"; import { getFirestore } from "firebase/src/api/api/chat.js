export default async function handler(req, res) {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: "Missing question" });

  // Basic topic filter
  const forbidden = ["personal", "password", "love", "sex", "health"];
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

  // Replace this with your actual OpenAI call
  // Example placeholder
  const answer = `This is where your AI reply would go for: "${question}"`;

  res.json({ answer });
}
