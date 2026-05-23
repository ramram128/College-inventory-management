# --------------------------------------------------------------
# 1️⃣  CONFIGURATION – EDIT THESE VALUES BEFORE RUNNING
# --------------------------------------------------------------

# ----- Project folder (absolute path) -----
$projectRoot = "C:\Users\rajkr\Downloads\files\Rental website"

# ----- GitHub -------------------------------------------------
# Your GitHub username / organization
$githubUser = "<YOUR_GITHUB_USERNAME>"
# Desired repository name (must be available on GitHub)
$repoName = "rental-website"
# Full HTTPS remote URL (GitHub will prompt for credentials/token)
$remoteUrl = "https://github.com/$githubUser/$repoName.git"

# ----- Firebase config (add to hosting env vars later) ---------
# Replace the placeholders with the values from your Firebase console.
$env:VITE_FIREBASE_API_KEY = "<YOUR_FIREBASE_API_KEY>"
$env:VITE_FIREBASE_AUTH_DOMAIN = "<YOUR_FIREBASE_AUTH_DOMAIN>"
$env:VITE_FIREBASE_PROJECT_ID = "<YOUR_FIREBASE_PROJECT_ID>"
$env:VITE_FIREBASE_STORAGE_BUCKET = "<YOUR_FIREBASE_STORAGE_BUCKET>"
$env:VITE_FIREBASE_MESSAGING_SENDER_ID = "<YOUR_FIREBASE_MESSAGING_SENDER_ID>"
$env:VITE_FIREBASE_APP_ID = "<YOUR_FIREBASE_APP_ID>"

# --------------------------------------------------------------
# 2️⃣  PRE‑REQUISITES – make sure they are installed
# --------------------------------------------------------------
# Node (>=18) & npm – already present if you can run `npm run dev`
# Git – required for version control
# Optional: Firebase CLI (`npm i -g firebase-tools`) if you pick Firebase Hosting

# --------------------------------------------------------------
# 3️⃣  INITIALIZE GIT & PUSH TO GITHUB
# --------------------------------------------------------------
Set-Location $projectRoot

# Initialise repo (skip if already a git repo)
if (-not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit – ready for deployment"
}
else {
    Write-Host "Git repo already exists – skipping init."
}

# Add remote (replace if it already exists)
git remote remove origin 2>$null
git remote add origin $remoteUrl

# Push to GitHub (you will be prompted for credentials or a PAT)
git branch -M main
git push -u origin main

# --------------------------------------------------------------
# 4️⃣  BUILD THE APP (production bundle)
# --------------------------------------------------------------
npm install          # ensure dependencies are present
npm run build        # creates the `dist` folder

# --------------------------------------------------------------
# 5️⃣  DEPLOY – pick ONE of the following sections
# --------------------------------------------------------------

# ------------------- VERCEL -------------------
# 1️⃣ Install Vercel CLI (once)
# npm i -g vercel
# 2️⃣ Login (once) → `vercel login`
# 3️⃣ Deploy
# vercel --prod --confirm

# ------------------- NETLIFY -------------------
# 1️⃣ Install Netlify CLI (once)
# npm i -g netlify-cli
# 2️⃣ Login (once) → `netlify login`
# 3️⃣ Deploy
# netlify deploy --prod --dir=dist

# ------------------- FIREBASE HOSTING -------------------
# 1️⃣ Initialise hosting (run once)
# firebase login
# firebase init hosting   # choose existing project, set `public` = dist, SPA = Yes
# 2️⃣ Deploy
# firebase deploy --only hosting

# ------------------- GITHUB PAGES -------------------
# 1️⃣ Ensure `vite.config.js` has the correct base (repo name)
#    // vite.config.js
#    export default defineConfig({ base: "/rental-website/", ... })
# 2️⃣ Build (already done) → contents are in `dist`
# 3️⃣ Create/checkout the `gh-pages` branch and push the built files
git checkout -b gh-pages
Copy-Item -Path "$projectRoot\dist\*" -Destination $projectRoot -Recurse -Force
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# --------------------------------------------------------------
# 6️⃣  ADD FIREBASE CONFIG TO YOUR HOST (environment vars)
# --------------------------------------------------------------
# Vercel / Netlify:
#   - Open the project dashboard → Settings → Environment Variables.
#   - Add each `VITE_FIREBASE_…` key with the value you set above.
#   - Redeploy (the CLI commands already trigger a fresh deploy).

# Firebase Hosting:
#   - No extra step needed – the config lives in [src/firebase.ts](cci:7://file:///c:/Users/rajkr/Downloads/files/Rental%20website/src/firebase.ts:0:0-0:0).
#   - Just make sure the values are correct before you run `firebase deploy`.

# --------------------------------------------------------------
# 7️⃣  VERIFY THE DEPLOYMENT
# --------------------------------------------------------------
Write-Host "`n=== VERIFICATION STEPS ==="
Write-Host "1️⃣ Open the URL that your host gave you (Vercel/Netlify/Firebase/GitHub Pages)."
Write-Host "2️⃣ Log in using a Firebase Auth account (or the admin account you created)."
Write-Host "3️⃣ Navigate to the Admin → Bookings page – you should see real data from Firestore."
Write-Host "4️⃣ Approve a booking and confirm that the facility/equipment status updates automatically."
Write-Host "5️⃣ If anything looks off, open the browser console for errors and double‑check the Firebase env vars."

# --------------------------------------------------------------
# DONE
# --------------------------------------------------------------
Write-Host "`nAll steps completed! 🎉"
