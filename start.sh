#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# SkinScan AI — Unified Startup Script
# Starts both the Flask ML API (port 5001) and the frontend server (port 3000)
# Usage:  bash start.sh
# ────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$SCRIPT_DIR/venv/bin/python"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           SkinScan AI — Starting Services            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Kill any stale processes on our ports ─────────────────────────────────────
echo "→ Freeing ports 3000 and 5001…"
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
sleep 0.5

# ── Start Flask API (background) ─────────────────────────────────────────────
echo "→ Starting Flask ML API on http://localhost:5001 …"
PORT=5001 "$VENV_PYTHON" "$SCRIPT_DIR/backend/flask_api.py" &
FLASK_PID=$!

# Wait for Flask to be ready
echo "   Waiting for Flask API to load model…"
for i in {1..30}; do
  if curl -sf http://localhost:5001/health > /dev/null 2>&1; then
    echo "   ✓ Flask API is ready (PID $FLASK_PID)"
    break
  fi
  sleep 1
done

# ── Start frontend static server (background) ─────────────────────────────────
echo "→ Starting Frontend on http://localhost:3000 …"
node "$FRONTEND_DIR/server.js" &
NODE_PID=$!
sleep 1
echo "   ✓ Frontend is ready (PID $NODE_PID)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  SkinScan AI is running!                            ║"
echo "║                                                      ║"
echo "║  Frontend  →  http://localhost:3000                  ║"
echo "║  Flask API →  http://localhost:5001                  ║"
echo "║  Health    →  http://localhost:5001/health           ║"
echo "║                                                      ║"
echo "║  Press Ctrl+C to stop both servers.                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Open browser
open http://localhost:3000 2>/dev/null || true

# Wait and propagate Ctrl+C to both processes
trap "echo ''; echo 'Stopping SkinScan AI…'; kill $FLASK_PID $NODE_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait $FLASK_PID $NODE_PID
