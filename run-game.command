#!/bin/zsh

cd "$(dirname "$0")"
PORT=8765

echo "Starting The Cabin That Watches..."
echo "Open http://127.0.0.1:$PORT/index.html in your browser."
echo "Keep this window open while you play. Press Ctrl-C to stop."

python3 -m http.server "$PORT" --bind 127.0.0.1
