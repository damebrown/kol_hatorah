import { randomUUID } from "crypto";
import { Thread, TurnSummary } from "./types";
import { CONVERSATION_MAX_TURNS } from "../config/constants";

/** In-memory store for conversation threads, scoped to one server session. */
export class ThreadStore {
  private readonly threads: Map<string, Thread> = new Map();

  /** Creates a new empty thread and returns its ID. */
  createThread(): string {
    const id = randomUUID();
    const now = Date.now();
    this.threads.set(id, { id, turns: [], createdAt: now, lastAccessedAt: now });
    return id;
  }

  /** Returns the thread for the given ID, or undefined if not found. Updates lastAccessedAt. */
  getThread(id: string): Thread | undefined {
    const thread = this.threads.get(id);
    if (thread) thread.lastAccessedAt = Date.now();
    return thread;
  }

  /** Appends a turn to the thread, dropping the oldest if the cap is exceeded. No-op for unknown IDs. */
  appendTurn(id: string, turn: TurnSummary): void {
    const thread = this.threads.get(id);
    if (!thread) return;
    thread.turns.push(turn);
    if (thread.turns.length > CONVERSATION_MAX_TURNS) {
      thread.turns = thread.turns.slice(-CONVERSATION_MAX_TURNS);
    }
    thread.lastAccessedAt = Date.now();
  }

  /** Removes the thread. No-op for unknown IDs. */
  clearThread(id: string): void {
    this.threads.delete(id);
  }
}
