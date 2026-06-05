# Mahendra R&D Hub: Lab Inventory & Facility Management

**Live Demo**: [https://college-inventory-management-one.vercel.app/](https://college-inventory-management-one.vercel.app/)

A premium, state-of-the-art laboratory management system designed for the Mahendra R&D Center. This platform streamlines the process of discovering research facilities, checking equipment availability, and managing laboratory bookings for researchers and administrators.

---

## 🚀 Key Features

### For Researchers
- **Facility Discovery**: Browse through categorized research areas (Chemistry, Biomedical, EEE, ECE, Physics, Computer Science).
- **Equipment Catalog**: Search a detailed inventory of research instruments with real-time status tracking (Available, In Use, Maintenance).
- **Smart Booking System**: Seamless laboratory and equipment reservation flow with instant validation and status updates.
- **Personal Dashboard**: Track all your past and upcoming bookings with professional status tracking.

### For Administrators
- **Executive Dashboard**: High-level overview of total bookings, pending approvals, facility counts, and equipment status.
- **Resource Management**: Comprehensive tools to add, edit, or remove laboratories and instruments.
- **Request Workflow**: Approve or reject booking requests with a single click.
- **Self-Healing Database**: Automatic "Auto-Seed" technology that restores core data if the database is detected as empty.

---

## 🛠️ Tech Stack

- **Core Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: React Context API with persistent Firestore synchronization.
- **Backend/database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Authentication](https://firebase.google.com/docs/auth).
- **Styling**: Vanilla CSS with modern Glassmorphism aesthetics and [Tailwind CSS](https://tailwindcss.com/) utilities.
- **Icons & UI**: [Lucide React](https://lucide.dev/) & radix-ui components.
- **Deployment**: [Vercel](https://vercel.com/) (Frontend) & Firebase (Security Rules).

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajkrish63/College-inventory-management.git
   cd College-inventory-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🔒 Security & Deployment

### Firestore Rules
The project uses specific security rules to allow public read access for facilities while protecting user data.
Deploy rules using:
```bash
firebase deploy --only firestore:rules
```

### Routing on Vercel
Configuration is handled via `vercel.json` to ensure Single Page Application (SPA) routing works correctly on refresh.

---

Designed and developed for the **Mahendra Research & Development Center**.