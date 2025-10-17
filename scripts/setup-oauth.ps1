# OAuth Setup Commands

# Run these commands in order to set up OAuth authentication

Write-Host "🚀 Setting up OAuth Authentication..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing missing dependencies..." -ForegroundColor Yellow
npm install @auth/prisma-adapter

Write-Host ""
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Step 2: Generate Prisma Client
Write-Host "🔧 Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npm run postinstall

Write-Host ""
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green
Write-Host ""

# Step 3: Push database changes
Write-Host "🗄️ Step 3: Updating database schema..." -ForegroundColor Yellow
Write-Host "Choose an option:" -ForegroundColor Cyan
Write-Host "  1. Create migration (recommended for production)" -ForegroundColor White
Write-Host "  2. Push directly (faster for development)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "1") {
    $migrationName = Read-Host "Enter migration name (e.g., add_oauth_support)"
    npx prisma migrate dev --name $migrationName
}
else {
    npx prisma db push
}

Write-Host ""
Write-Host "✅ Database updated!" -ForegroundColor Green
Write-Host ""

# Step 4: Environment variables
Write-Host "🔐 Step 4: Setting up environment variables..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists" -ForegroundColor Yellow
}
else {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Generating NEXTAUTH_SECRET..." -ForegroundColor Yellow
$secret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Write-Host ""
Write-Host "Add this to your .env.local:" -ForegroundColor Cyan
Write-Host "NEXTAUTH_SECRET=$secret" -ForegroundColor White
Write-Host ""

# Step 5: Next steps
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update .env.local with:" -ForegroundColor Yellow
Write-Host "   - NEXTAUTH_SECRET (generated above)" -ForegroundColor White
Write-Host "   - DATABASE_URL (your database connection)" -ForegroundColor White
Write-Host "   - GOOGLE_CLIENT_ID (from Google Console)" -ForegroundColor White
Write-Host "   - GOOGLE_CLIENT_SECRET (from Google Console)" -ForegroundColor White
Write-Host ""
Write-Host "2. Follow the Google OAuth setup guide:" -ForegroundColor Yellow
Write-Host "   docs/authentication/google_oauth_setup.md" -ForegroundColor White
Write-Host ""
Write-Host "3. Start the development server:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. Visit http://localhost:3000/auth/signin to test!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Authentication Guide: docs/authentication/authentication.md" -ForegroundColor White
Write-Host "   - Schema Documentation: docs/schema/schema_explanation.md" -ForegroundColor White
Write-Host "   - All Docs: docs/README.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green
