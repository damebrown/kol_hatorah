import express from "express";
import { askOnce, ThreadStore, type TurnSummary } from "@kol-hatorah/worker";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const threadStore = new ThreadStore();

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
  const incomingThreadId = req.body?.threadId;

  // Resolve or create the conversation thread.
  let activeThreadId: string;
  let priorTurns: TurnSummary[] = [];

  if (typeof incomingThreadId === "string" && incomingThreadId.length > 0) {
    const thread = threadStore.getThread(incomingThreadId);
    if (thread) {
      activeThreadId = incomingThreadId;
      priorTurns = thread.turns;
    } else {
      // Unknown thread ID (e.g. server restarted) — start fresh.
      activeThreadId = threadStore.createThread();
    }
  } else {
    activeThreadId = threadStore.createThread();
  }

  try {
    const result = await askOnce({ q: q.trim(), debug, priorTurns });

    if (result.turnSummary) {
      threadStore.appendTurn(activeThreadId, result.turnSummary);
    }

    res.json({ text: result.text, threadId: activeThreadId, debug: result.debug });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.delete("/api/thread/:id", (req, res) => {
  threadStore.clearThread(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
