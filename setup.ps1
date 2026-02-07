# ============================================================================
# AI Customer Support Platform - Automated Setup Script
# ============================================================================

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🤖 AI Customer Support Platform - Setup Wizard            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/7] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Check Python
Write-Host "[2/7] Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found. Please install Python >= 3.11" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Install Frontend Dependencies
Write-Host "[3/7] Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install Backend Dependencies
Write-Host "[4/7] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
python -m venv venv
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠️  Virtual environment created but activation script not found" -ForegroundColor Yellow
}
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup Environment Variables
Write-Host "[5/7] Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local (please configure with your API keys)" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env (please configure with your API keys)" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env already exists" -ForegroundColor Green
}
Write-Host ""

# Initialize Git
Write-Host "[6/7] Initializing Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit: AI Customer Support Platform

Features:
- RAG-based FAQ chatbot
- Harassment detection system
- Real-time analytics dashboard
- Enterprise-grade security
- Full CI/CD pipeline"
    git branch -M main
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}
Write-Host ""

# Setup Complete
Write-Host "[7/7] Setup complete!" -ForegroundColor Yellow
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Setup Complete!                                         ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure environment variables:" -ForegroundColor White
Write-Host "   - Edit .env.local (frontend)" -ForegroundColor Gray
Write-Host "   - Edit backend/.env (backend)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up Supabase:" -ForegroundColor White
Write-Host "   - Create a Supabase project at https://supabase.com" -ForegroundColor Gray
Write-Host "   - Run database/schema.sql in SQL Editor" -ForegroundColor Gray
Write-Host "   - Add Supabase URL and keys to .env files" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Add OpenAI API key:" -ForegroundColor White
Write-Host "   - Get API key from https://platform.openai.com" -ForegroundColor Gray
Write-Host "   - Add to backend/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start development servers:" -ForegroundColor White
Write-Host "   Frontend:  npm run dev" -ForegroundColor Gray
Write-Host "   Backend:   cd backend && uvicorn app.main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy to production:" -ForegroundColor White
Write-Host "   - Frontend: vercel --prod" -ForegroundColor Gray
Write-Host "   - Backend:  railway up" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md - Complete project documentation" -ForegroundColor Gray
Write-Host "   - ARCHITECTURE.md - System architecture details" -ForegroundColor Gray
Write-Host "   - database/schema.sql - Database schema" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Quick Start:" -ForegroundColor Cyan
Write-Host "   npm run dev          # Start frontend (http://localhost:3000)" -ForegroundColor Gray
Write-Host "   cd backend && uvicorn app.main:app --reload  # Start backend (http://localhost:8000)" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy coding! 💻✨" -ForegroundColor Magenta
