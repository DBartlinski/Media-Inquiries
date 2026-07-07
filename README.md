# Media Inquiries Dashboard

A Kanban-style dashboard for tracking VHA Communications media inquiries, built with React + Vite. Data is stored as `data.json` in a GitHub repository and synced via the GitHub API — no backend required.

---

## Quick Start (Shared Team Token)

### Setup Overview
- **GitHub user**: `dbartlinski`
- **Data repo**: `Media Inquiries` (shared team data)
- **Dashboard app**: https://dbartlinski.github.io/Media-Inquiries/
- **Access**: All team members use the **same Personal Access Token**

### For Team Members (30 Seconds)
1. **Open the dashboard**: https://dbartlinski.github.io/Media-Inquiries/
2. **Enter these credentials** (same for everyone):
   - **Personal Access Token**: `[ask your admin for the shared token]`
   - **Owner**: `dbartlinski`
   - **Repository**: `Media Inquiries`
   - **Branch**: `main`
   - **Data file path**: `data.json` (default)
3. Click **Connect to GitHub** → done!

✅ **All team members see the same data.** When you save, everyone else sees it instantly (after refreshing).

---

## Admin Setup (One-Time)

If you're the **admin** setting this up for your team:

### Step 1: Verify the repositories

✅ **Data repo** (`Media Inquiries`): Should exist on GitHub with a `main` branch and `data.json` file  
✅ **App repo** (this one): Should be deployed to GitHub Pages at `https://dbartlinski.github.io/Media-Inquiries/`

### Step 2: Generate a shared Personal Access Token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. **Token name**: "Media Inquiries Dashboard - Team"
4. **Scope**: Check **`repo`** (full control)
5. **Expiration**: No expiration (or set to 90 days for rotation)
6. Click **Generate token**
7. **Copy the token immediately** — you won't see it again

### Step 3: Share the token with your team

Give team members:
- The **shared Personal Access Token** (from Step 2) — via email, password manager, or team wiki
- The **dashboard URL**: `https://dbartlinski.github.io/Media-Inquiries/`
- These credentials (same for everyone):
  ```
  Owner: dbartlinski
  Repository: Media Inquiries
  Branch: main
  Data file path: data.json
  ```

### Step 4: Team members open the app

They paste the shared token and credentials → click **Connect** → done!

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
