# AI Outlook

AI Outlook is a read-mode Outlook add-in that drafts an editable response to the message you have open. You choose a concise, warm, or formal tone, review the result in the task pane, then copy it or open a prefilled Outlook reply form.

## How it works

1. Office.js reads the open message after you press **Generate reply**.
2. The task pane sends bounded message text and the selected tone to the local server.
3. The server calls OpenRouter with a server-side API key.
4. You edit the returned draft before opening Outlook's reply form.

The add-in never sends mail automatically.

## Privacy

Generating a reply sends the selected message text to the model provider configured on the server. The application does not store email bodies or generated replies, and the server does not log them.

## Local setup

Requirements:

- Node.js 22 or newer
- Outlook or Outlook on the web with add-in sideloading enabled
- An OpenRouter API key

```bash
npm install
cp .env.example .env
npm start
```

Set `OPENROUTER_API_KEY` in `.env`. The default model is `openrouter/free`, which OpenRouter provides for low-volume experiments. Free capacity and rate limits can change.

The first `npm start` run may ask permission to install a trusted localhost development certificate. The task pane runs at `https://localhost:5051/taskpane.html`.

Sideload `manifest.xml` through Outlook's add-in management interface, open a message, then choose **Draft reply** from the add-in command.

## Tests

```bash
npm run check
npm test
npm audit --omit=dev
```

Tests cover request limits, tone prompts, provider failures, Office message access, reply-form creation, API errors, and manifest consistency. Provider tests use mock responses and do not consume API credits.

## Structure

```text
app.js                 Express application factory
server.js              Local HTTPS startup
manifest.xml           Outlook add-in manifest
src/taskpane.*         Task-pane interface
src/office-adapter.js  Office.js callback wrapper
src/openrouter.js      Model-provider client
src/prompt.js          Reply instructions
test/                  Node tests
```

## Verification boundary

The task pane, server, provider boundary, and Office adapter can be tested without mailbox access. Final sideload verification requires a Microsoft account whose Outlook client permits custom add-ins.

## License

MIT
