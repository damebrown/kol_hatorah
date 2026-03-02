import express from "express";
import { askOnce } from "@kol-hatorah/worker";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/ask", async (req, res) => {
  const q = req.body?.q;
  if (q == null || typeof q !== "string" || !q.trim()) {
    res.status(400).json({ error: "Missing or invalid 'q' in request body" });
    return;
  }
  const debug = !!req.body?.debug;

  try {
    const result = await askOnce({ q: q.trim(), debug });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
