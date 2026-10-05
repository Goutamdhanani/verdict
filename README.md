# VERDICT

VERDICT is a local, provider-agnostic multi-model reasoning workbench. It connects to any OpenAI-compatible chat-completions endpoint, including FreeInference and local Ollama endpoints, and runs an explicit deliberation protocol:

1. Compile the task into goals, constraints, ambiguities, and acceptance checks.
2. Collect independent proposals without showing panelists one another's answers.
3. In Full mode, rotate a targeted falsification attempt across each selected model.
4. Turn material disagreements into evidence requests with pass/fail conditions.
5. Adjudicate the arguments without a vote, preserving unresolved claims and a minority report.

Evidence requests are plans, not evidence. This version does not execute shell commands, benchmarks, or web research. An open request forces the final label to **PROVISIONAL — evidence checks remain open**; the judge's original recommendation and confidence are retained as unverified metadata. Claim labels remain `UNKNOWN` until evidence is independently checked. A matching quote from another model is only a traceability check, never factual support. A human can run a proposed check and use **Appeal with new evidence** to trigger a fresh deliberation. Appeals must supply new evidence, identify a flaw in existing evidence, or name an ignored constraint.

## Run locally

Requires Node.js 18 or later. From the repository root:

```powershell
node verdict/server.mjs
```

Then open <http://localhost:4177>. The app has no package install step. Keep the terminal running while you use it.

Choose **FreeInference** and enter an API key in the password field, or create `verdict/.env` with:

```text
FREEINFERENCE_API_KEY=put-your-rotated-key-here
```

The server loads this file on startup. Restart the server after editing it. `.env` is ignored by Git. Keys entered in the UI are sent only to the local server for provider requests and are not stored in browser storage or written to disk. Do not paste a key into source code or commit it.

For a local OpenAI-compatible server, choose its endpoint in the provider selector or enter a URL such as `http://localhost:11434/v1`; a key is optional when the server does not require one. Load its model catalog, select generation models, then choose the in-flight request limit. The default is **1** to work with FreeInference accounts limited to one concurrent request. Calls are queued to honor that cap; selecting all models does not send them all at once. Increase the limit only when the provider allows it.

The FreeInference catalog is loaded live using the key you configure. If it is temporarily unavailable, VERDICT displays its documented dashboard model IDs as a fallback. Embedding-only `bge-m3` is displayed but cannot be selected for chat deliberation. FreeInference is hard-capped at one request in flight, across runs and model-catalog refreshes, regardless of the submitted UI value. The local server serializes calls; the selector is locked to 1 for this provider. Local providers can use a higher configured cap.

## Modes and call count

- **Fast verdict:** requirement compiler + one blind proposal per selected model + evidence planner + adjudicator.
- **Full:** Fast stages + one targeted attack per selected model, each attacking the next panelist's proposal.
- Max in-flight calls is user-controlled (1–8; default 1). Each phase waits for its calls to finish before the next phase starts. Token use and latency rise with panel size and Full mode. Free-tier quota is limited; check the provider's current dashboard before large runs.
- If a model returns malformed JSON, VERDICT asks that same model to repair the response once; this adds a call to the run.

The adjudicator's confidence is a model estimate, not a calibrated probability. A different model may be selected as judge. In Full mode, each proposal is challenged by another model with a distinct rotating lens (assumption, constraint, feasibility, implementation, risk, alternative, counterexample, or evidence). A model never critiques its own proposal. Verdicts are advisory and should not replace expert review for high-impact decisions.

## Provider and data notes

Provider compatibility currently means `/v1/models` (catalog) and `/v1/chat/completions` with JSON responses. Other APIs require a compatible gateway. Prompts and replies are sent to the configured endpoint. FreeInference states that requests are logged for research and that anonymized data may be open-sourced; do not send credentials, confidential client material, private business information, or unpublished invention details there. Use a local model for sensitive material, and check the local runtime's data behavior.

## Research trace

Every run can be exported as JSON and includes the selected models, judge, execution mode, concurrency cap, stage list, requirement compilation, independent proposals, attacks, proposed evidence requests, ruling, dissent, elapsed time, and provider-reported token counts when available. Provider usage/cost reporting varies, so VERDICT does not invent price estimates. Run history is held in the current browser view only; it is not stored by the app.
