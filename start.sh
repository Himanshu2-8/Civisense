#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Starting CiviSense Platform"
echo "=========================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Start Backend
echo "Starting Backend on http://localhost:8000..."
cd "$ROOT_DIR/backend"
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv .venv
    uv pip install -r requirements.txt
fi
.venv/bin/uvicorn app.main:app --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!

# 2. Start Frontend
echo "Starting Frontend on http://localhost:3000..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

echo ""
echo " Backend running at:  http://localhost:8000"
echo " API Docs at:         http://localhost:8000/docs"
echo " Frontend running at: http://localhost:3000"
echo "=========================================="
echo "Press Ctrl+C to stop all services."

wait
