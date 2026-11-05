# Local Appwrite as the backend

Record against a local Appwrite so the footage is deterministic, fast, and free of real customer data. Two things can be on screen: the real Appwrite Console (for Console features) or a small demo app you build that calls local Appwrite (for SDK/API features). Often both.

## Start Appwrite

Check first: `curl -s http://localhost/v1/health/version`. If it answers, Appwrite is already up. Otherwise:

```bash
mkdir -p ~/appwrite-local && cd ~/appwrite-local
docker run -it --rm \
  --publish 20080:20080 \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
  --entrypoint="install" \
  appwrite/appwrite:latest
```

Open `http://localhost:20080`, finish the wizard (hostname `localhost`, HTTP, PostgreSQL default), create the admin account. The Console is then at `http://localhost/console`, API at `http://localhost/v1`. Non-Linux hosts take a couple of minutes to come up. A colleague who works on Appwrite itself may instead have the dev stack from the `appwrite/appwrite` repo (`docker compose up -d`) on port 80 as well. The feature being trailered may only exist on a branch; if so, build that branch's image and point the Console at it. Ask.

Manage: `docker compose stop|start` in `~/appwrite-local/appwrite`, `docker compose down -v` wipes everything.

Self-hosted allows one organization; the Console creates it with the first sign-in. Email verification is off by default locally.

## Seed realistic data with the CLI

Empty tables look like a demo. Fill them with plausible, boring data before recording (real-looking names, dates spread over weeks, a few statuses). Use the CLI in non-interactive mode so the seed is a script you can rerun:

```bash
npm i -g appwrite-cli   # or brew install appwrite
appwrite login --endpoint http://localhost/v1
appwrite init project                      # writes appwrite.config.json
appwrite init tables                       # or write the JSON by hand
appwrite push tables
appwrite tables-db create-row --database-id main --table-id orders \
  --row-id unique() --data '{"customer":"Lena Fischer","total":129.9,"status":"paid"}'
```

For 20-50 rows, loop in bash or use the Node SDK (`node-appwrite`) with an API key from Console → Project → Settings → API keys. Keep the seed script next to the recording script in the trailer project so re-recording is one command.

Tips for footage:
- Name resources like a real project would: `prod-db`, `orders`, `invoices-2026`, not `test`, `demo`, `asdf`.
- Pick a project name that fits the story (a shop, a SaaS, a game). It appears in the Console header in every shot.
- Create enough rows to fill a table past the fold so scrolling is possible.
- Avoid your own email and real names of colleagues. Use the fixtures in `assets/templates/fixtures.json`.

## Recording the Console itself

Sign in once with Playwright, save `storageState`, reuse it for every take. The Console's own E2E suite does exactly this (`e2e/auth.setup.ts` in appwrite/appwrite). Login form selectors: `input[name="email"]`, `input[name="password"]`, button `Login`. After login the URL lands on `/console/organization-...` or `/console/account`.

Set the theme explicitly: the Console stores `theme` in localStorage (`dark`, `light`, `system`). Set it with `addInitScript` so every take matches. Default is dark.

If the feature is only in a development build of the Console (`apps/console` in the appwrite/appwrite repo): `bun install && bun run dev` serves it on `http://localhost:3000` and `VITE_APPWRITE_ENDPOINT=http://localhost/v1` in `.env` points it at the local API. Set `VITE_CONSOLE_PROFILE=self-hosted` to hide billing and marketing.

## Recording a demo app

When the feature is an SDK or API capability (a new query, realtime, a storage transform), the Console alone will not show it. Build a one-page demo app with Vite + React + Tailwind styled with `design-tokens.md`, using the `appwrite` web SDK against `http://localhost/v1`. Add `localhost` as a Web platform in the project (Console → Overview → Add platform) or requests fail with CORS. Keep the app to one screen with one clear interaction. It should feel like a tab in the Console, not a different product.

Pair it with a code slide (see `layouts.md`, layout "Code reveal") showing the 5-10 lines that make the feature work. Footage shows the result, the slide shows the cause.
