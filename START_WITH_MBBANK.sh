#!/bin/bash

echo "🚀 Starting Vyron Fashion E-commerce with MB Bank Payment"
echo "=========================================================="
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Please create from backend/.env.example"
    exit 1
fi

if [ ! -f "backend/mb-service/.env" ]; then
    echo "⚠️  backend/mb-service/.env not found. Please create from backend/mb-service/.env.example"
    exit 1
fi

echo "1️⃣  Starting MB Bank Service (Node.js)..."
cd backend/mb-service
npm start &
MB_PID=$!
echo "   MB Service PID: $MB_PID"
echo ""

sleep 3

echo "2️⃣  Starting Backend API (Python FastAPI)..."
cd ..
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo ""

sleep 2

echo "3️⃣  Starting Frontend (Next.js)..."
cd ../vyronfashion
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo ""

echo "=========================================================="
echo "✅ All services started!"
echo ""
echo "📍 Frontend:        http://localhost:3000"
echo "📍 Backend API:     http://localhost:8000"
echo "📍 API Docs:        http://localhost:8000/docs"
echo "📍 MB Service:      http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================================="

# Trap Ctrl+C and cleanup
trap "echo ''; echo '🛑 Stopping all services...'; kill $MB_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait
wait
