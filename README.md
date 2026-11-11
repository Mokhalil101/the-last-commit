# THE LAST COMMIT — Save the Repository
*Powered by GDG Assiut* · Debug. Commit. Merge. Deploy.

A browser game that teaches Git, debugging, code review, testing and CI/CD. You are the last Software Recovery Engineer restoring PROJECT ZERO.

## Run
Open `index.html`, or run `python3 -m http.server` here and visit http://localhost:8000.

## Deploy to GitHub Pages
Push this folder to a repo → Settings → Pages → Deploy from branch `main` / root. No build step, no backend, no external assets.

## Structure
```
index.html
css/main.css
js/storage.js            save/load, ranks, achievements
js/repository-engine.js  simulated Git engine, test runner, CI pipeline
js/missions.js           all missions and challenges
js/app.js                screens, terminal, editor, PR review
```

## Content
- Campaign: 10 worlds, 18 missions (2–3 per key world), in SRS order.
- Git Challenges (stash, cherry-pick), Debugging Challenges, Free Developer Mode, Daily Challenge.
- 4 pull requests from virtual developers (Frontend, Backend, QA): approve good work, request changes on bad work.
- Line-level merge conflicts with a side-by-side Current/Incoming view and Accept current/incoming/both.
- Syntax highlighting, line numbers, test-runner panel (passed/failed/skipped), CI/CD pipeline panel.
- DP, 7 ranks, 16 achievements, sound, local leaderboard, mid-mission Continue, reset with confirmation.
- Mobile layout with Mission / Code / Repo tabs.

## Safety
The terminal is a parser over a JavaScript data model. It never runs a shell, never uses `eval`, and never touches real repositories. Code fixes are checked with fixed pattern tests.

## Real code execution (safe)
Debugging missions run your code for real, but only inside a terminable Web Worker (no DOM, storage or network, 1.5 s time limit), never in the page. Regex tests are the fast path; if they fail, the behavior check still accepts any valid fix (for example `!(age < 18)`). Config/YAML missions and the Python-style missions use pattern checks, because Python is not executed in the browser.

## Data
`data/missions.json` holds mission text (titles, stories, goals, hints, par, test messages). When served over http(s) (GitHub Pages) the game loads it and overrides the built-in text; when opened from disk it uses the built-in copy. Mission logic stays in `js/missions.js`.

## Testing done
Node logic tests solve all 26 missions and challenges, check PR penalties, rebase, save/restore mid-conflict and hostile input. Headless Chromium (file:// and http://) verified: mission completion and resume at 1280px and 390px, alternative valid fixes accepted by the sandbox, an infinite loop contained in 1.5 s, red conflict markers, zero console errors.

## Known limitations
- No online leaderboard (needs a backend); the leaderboard is per device.
- Python-style and YAML missions use pattern checks; only JavaScript is executed.
- `git rebase` replays non-conflicting commits only; practice conflicts with merge.
- Not covered: interactive rebase (`-i`), `git bisect`, real GitHub integration.
