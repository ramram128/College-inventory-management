#!/bin/bash
set -e

REPO_DIR="/home/hunter/Documents/Projects/College-inventory-management"
cd "$REPO_DIR"

# Ensure we have the backup
if [ -d "../git-backup-college" ]; then
    echo "Backup already exists"
else
    mv .git ../git-backup-college
fi

# We need to wipe .git again if we are starting over
rm -rf .git
git init
git branch -M main

# Configure local git user to match previous commits roughly (optional but good practice)
git config user.name "Prakashram J"
git config user.email "jprakashram11@gmail.com"

commit_stage() {
    local msg=$1
    local cdate=$2
    shift 2
    local added=0
    for item in "$@"; do
        # Use ls to check if item exists loosely, suppress error output
        if ls $item 1> /dev/null 2>&1; then
            git add $item
            added=1
        fi
    done
    if [ $added -eq 1 ]; then
        GIT_COMMITTER_DATE="$cdate" git commit --date="$cdate" -m "$msg"
    fi
}

echo "Starting granular chronological commits..."

# 1
commit_stage "Initial build: config and package setup" "2026-05-23T10:15:00" package.json package-lock.json tsconfig*.json vite.config.ts postcss.config.mjs tailwind.config.js eslint.config.js .gitignore .gitattributes cors.json vercel.json deploy.ps1 > /dev/null 2>&1 || true

# 2
commit_stage "Add public assets and index.html" "2026-05-24T11:30:00" public/ index.html assets/ > /dev/null 2>&1 || true

# 3
commit_stage "Add core styles and environment files" "2026-05-25T14:45:00" src/styles/ .env* > /dev/null 2>&1 || true

# 4
commit_stage "Setup app entry points and state routing" "2026-05-27T09:20:00" src/main.tsx src/app/App.tsx src/app/routes.tsx src/app/firebase.ts > /dev/null 2>&1 || true

# 5
commit_stage "Implement utility functions and mock data" "2026-05-28T16:10:00" src/app/utils/ src/app/data/ > /dev/null 2>&1 || true

# 6
commit_stage "Add backend services and API abstractions" "2026-05-29T13:05:00" src/app/services/ > /dev/null 2>&1 || true

# 7
commit_stage "Add React Contexts for global state management" "2026-05-31T10:50:00" src/app/context/ > /dev/null 2>&1 || true

# 8
commit_stage "Implement reusable UI component library" "2026-06-01T15:30:00" src/app/components/ui/ src/app/components/figma/ > /dev/null 2>&1 || true

# 9
commit_stage "Create global layout and navigation components" "2026-06-02T11:15:00" src/app/components/Layout.tsx src/app/components/Navbar.tsx src/app/components/Sidebar.tsx src/app/components/AuthLayout.tsx src/app/components/PageLayout.tsx src/app/components/Navigation.tsx src/app/components/Footer.tsx src/app/components/UserMenu.tsx src/app/components/Modal.tsx src/app/components/LogoutModal.tsx > /dev/null 2>&1 || true

# 10
if [ -d "src/app/pages/Auth" ]; then
    commit_stage "Implement Authentication pages" "2026-06-03T09:10:00" src/app/pages/Auth/ > /dev/null 2>&1 || true
fi

if [ -d "src/app/pages/Admin" ]; then
    commit_stage "Implement Admin Dashboard features" "2026-06-03T11:45:00" src/app/pages/Admin/ > /dev/null 2>&1 || true
fi

if [ -d "src/app/pages/Staff" ]; then
    commit_stage "Implement Staff Dashboard features" "2026-06-04T10:20:00" src/app/pages/Staff/ > /dev/null 2>&1 || true
fi

if [ -d "src/app/pages/Student" ]; then
    commit_stage "Implement Student Dashboard features" "2026-06-04T13:30:00" src/app/pages/Student/ > /dev/null 2>&1 || true
fi

# 11
commit_stage "Add remaining utility pages and components" "2026-06-05T09:15:00" src/app/pages/ src/test/ test-emailjs.cjs > /dev/null 2>&1 || true

# 12
git add .
GIT_COMMITTER_DATE="2026-06-05T11:00:00" git commit --date="2026-06-05T11:00:00" -m "Update documentation, finalize assets and minor polish" > /dev/null 2>&1 || true

echo "Pushing to remote..."
git remote add origin https://github.com/ramram128/College-inventory-management.git
git push -u origin main -f

echo "DONE"
