# Quick Test Commands

## Start Server
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

## Test Register (PowerShell)
$body = @{username="testuser"; email="test@example.com"; password="Password123!"; name="Test User"; dateOfBirth="1990-01-01"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method Post -Body $body -ContentType "application/json"

## Test Login (PowerShell)
$body = @{username="testuser"; password="Password123!"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method Post -Body $body -ContentType "application/json"

## Test Register (cURL)
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Password123!\",\"name\":\"Test User\",\"dateOfBirth\":\"1990-01-01\"}"

## Test Login (cURL)
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"Password123!\"}"

## Swagger UI
http://localhost:8000/docs

