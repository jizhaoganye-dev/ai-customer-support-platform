# 超シンプル自動デプロイスクリプト
Write-Host "🚀 自動デプロイ開始..." -ForegroundColor Cyan

# GitHub
Write-Host "`n[1/3] GitHub..." -ForegroundColor Yellow
gh auth login
gh repo create ai-customer-support-platform --public --source=. --remote=origin --push

# Vercel
Write-Host "`n[2/3] Vercel..." -ForegroundColor Yellow  
npm install -g vercel
vercel login
vercel --prod --yes

# 完了
Write-Host "`n✅ デプロイ完了！" -ForegroundColor Green
Write-Host "🌐 公開URL: " -NoNewline
vercel inspect --json | ConvertFrom-Json | Select-Object -ExpandProperty url
