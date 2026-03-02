# Kol HaTorah UI

Minimal React chat UI for querying Kol HaTorah, with RTL support for Hebrew.

## How to run

From the repo root:

```bash
npm install
npm run build   # Build worker first (required for web to import it)
npm run dev     # Starts web API (port 3000) + UI (port 5173)
```

Then open http://localhost:5173 in your browser.

## Features

- RTL layout for Hebrew (direction, unicode-bidi, text-align)
- User messages on the right, assistant on the left
- Enter to send, Shift+Enter for newline
- Debug toggle: shows raw JSON from the server in a collapsible section
- New chat button to clear and start over
