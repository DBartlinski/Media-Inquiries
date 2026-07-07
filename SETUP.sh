#!/bin/bash
# Quick setup script for deploying Media Inquiries Dashboard

echo "📋 Media Inquiries Dashboard - Setup Guide"
echo "=========================================="
echo ""

echo "Step 1: Generate GitHub Personal Access Token"
echo "👉 Visit: https://github.com/settings/tokens/new?scopes=repo&description=Media+Inquiries+Dashboard"
echo "   Copy the token and keep it safe"
echo ""

read -p "Press Enter when you have your token ready..."

echo ""
echo "Step 2: Push this code to GitHub"
echo "   Create a repo named 'media-inquiries-dashboard' on GitHub"
echo "   Then run:"
echo ""
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit: Media Inquiries Dashboard'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/dbartlinski/media-inquiries-dashboard.git"
echo "   git push -u origin main"
echo ""

read -p "Press Enter when code is pushed to GitHub..."

echo ""
echo "Step 3: Enable GitHub Pages"
echo "   1. Go to: https://github.com/dbartlinski/media-inquiries-dashboard"
echo "   2. Settings → Pages"
echo "   3. Source: GitHub Actions"
echo "   4. Wait ~2 minutes for deploy"
echo ""

read -p "Press Enter when GitHub Pages is enabled..."

echo ""
echo "Step 4: Create data.json in your Media Inquiries repo"
echo "   Visit: https://github.com/dbartlinski/Media%20Inquiries"
echo "   Create new file: data.json"
echo "   Paste this:"
echo ""
echo "   {"
echo '     "version": 1,'
echo '     "lastImported": "2026-07-07T00:00:00.000Z",'
echo '     "tasks": []'
echo "   }"
echo ""
echo "   Commit to main"
echo ""

read -p "Press Enter when data.json is created..."

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your dashboard is live at:"
echo "👉 https://dbartlinski.github.io/media-inquiries-dashboard/"
echo ""
echo "Next: Open it, enter your GitHub token, and import your Media Inquiries.csv!"
echo ""
