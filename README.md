# Media Inquiries Dashboard

A Kanban-style dashboard for tracking VHA Communications media inquiries, built with React + Vite. Data is stored as `data.json` in a GitHub repository and synced via the GitHub API — no backend required.

---

## Quick Start (For dbartlinski)

### Your Setup
- **GitHub user**: `dbartlinski`
- **Data repo**: `Media Inquiries` (where task data lives)
- **Dashboard app**: Deploy this project to GitHub Pages

### 5-Minute Setup
1. **Generate Personal Access Token** ([go here](https://github.com/settings/tokens/new?scopes=repo&description=Media+Inquiries+Dashboard))
   - Copy the token immediately
2. **Deploy this app** to GitHub Pages (enable Actions in Settings → Pages)
3. **Open your deployed app URL** → enter your token + `dbartlinski` / `Media Inquiries` → click **Connect**
4. **Import your CSV** → drop `Media Inquiries.csv` → done! 🎉

---

## One-Time Setup (First Use)

### Step 1: Create the data repository

You already have: **GitHub user `dbartlinski`** and **data repo `Media Inquiries`**

✅ Just make sure your `Media Inquiries` repo on GitHub is initialized with a `main` branch (it has a README or initial commit)

### Step 2: Generate a GitHub Personal Access Token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Set a name (e.g., "Media Inquiries Dashboard")
4. Select scope: **`repo`** (full control)
5. Click **Generate token** — copy it immediately

### Step 3: Deploy the app to GitHub Pages

1. Create a new GitHub repo named `media-inquiries-dashboard` (or any name)
2. Push this project code to `main`
3. Go to **Settings → Pages**
4. Under **Source**, select **GitHub Actions**
5. The workflow in `.github/workflows/deploy.yml` will auto-deploy on push

Note the deployed GitHub Pages URL (e.g., `https://dbartlinski.github.io/media-inquiries-dashboard/`)

### Step 4: Connect the app

1. Open the deployed GitHub Pages URL
2. Enter:
   - **Personal Access Token** (from Step 2)
   - **Owner**: `dbartlinski`
   - **Repository**: `Media Inquiries`
   - **Branch**: `main`
   - **Data file path**: `data.json` (default)
3. Click **Connect to GitHub**

---

## Import Your Existing Data

1. Export your Planner data as CSV (in Microsoft Planner: **… → Export plan to Excel/CSV**)
2. In the dashboard, click **Import CSV**
3. Drop or browse to your `.csv` file
4. Review the preview (new vs. updated vs. unchanged)
5. Click **Confirm Import**

The data is parsed and committed to your `data.json` file in the data repository.

---

## Daily Use

| Action | How |
|--------|-----|
| Add new inquiry | Click **New Inquiry** button (top right) |
| Edit an inquiry | Click any card → edit inline → **Save Changes** |
| Check off workflow steps | Click any card → check boxes in Checklist section |
| Search | Type in the sidebar search box — searches title + description |
| Filter by priority | Check priority boxes in sidebar |
| Filter by status | Check status boxes in sidebar |
| View archived | Enable **Include Archive** in sidebar |
| Archive an inquiry | Open card → click **Archive** button |
| Re-import updated CSV | Click **Import CSV** — smart merge preserves local edits |
| Refresh from GitHub | Click the refresh icon in the header |

---

## Data Storage

- All data is stored as `data.json` in your GitHub data repository
- Every save (edit, new entry, checklist toggle) commits directly to GitHub
- A local browser cache is kept as a fallback if GitHub is unreachable
- Importing a new CSV **merges** data: adds new rows, updates existing ones, preserves local edits to status and checklist state

---

## Development (Local)

```bash
npm install
npm run dev        # starts dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

---

## Architecture

```
Browser (React SPA)
  ↕ GitHub REST API v3
GitHub Repo (data.json)  ← source of truth
```

- **No backend**: Everything runs in the browser
- **GitHub as database**: `data.json` stores all task data
- **Smart merge**: CSV imports add new rows and update fields, preserving in-app edits
- **Token security**: Your GitHub token is stored only in your browser's localStorage

---

## Your Next Steps

1. **Commit this dashboard code to GitHub** (new repo or existing)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Media Inquiries Dashboard"
   git branch -M main
   git remote add origin https://github.com/dbartlinski/media-inquiries-dashboard.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repo **Settings → Pages**
   - Source: **GitHub Actions**
   - Workflow will auto-deploy on push

3. **In your `Media Inquiries` data repo**, create an empty `data.json`:
   ```json
   {
     "version": 1,
     "lastImported": "2026-07-07T00:00:00.000Z",
     "tasks": []
   }
   ```
   Commit this file to `main`.

4. **Open your deployed dashboard URL** and follow the "Quick Start" above!
