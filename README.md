# 🗺️ Where To? — Frontend

> A real-time collaborative room platform where users can create or join rooms, explore destinations, and connect with others — built with React + Vite.

---

## ✨ Features

- 🔐 **Authentication** — Register & Login with JWT-based auth
- 🏠 **Rooms** — Create or join rooms with unique room IDs
- 🔍 **Explore** — Browse and discover available rooms
- 💬 **Real-time** — Live updates powered by Socket.io
- 👤 **Profile** — View and manage your user profile
- 🔒 **Protected Routes** — Authenticated-only access for sensitive pages
- 📱 **Responsive Design** — Works across all screen sizes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS | Styling |
| Socket.io Client | Real-time communication |
| Axios | HTTP requests |
| React Toastify | Toast notifications |
| React Icons | Icon library |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Navbar.jsx        # Navigation bar
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Profile.jsx           # User profile
│   │   ├── Explore.jsx           # Browse rooms
│   │   ├── CreateRoom.jsx        # Create a new room
│   │   ├── JoinRoom.jsx          # Join by room ID
│   │   └── Room.jsx              # Live room page
│   ├── services/
│   │   ├── api.js                # Axios instance & interceptors
│   │   └── authService.js        # Auth API calls
│   ├── App.jsx                   # Routes & route guards
│   ├── main.jsx                  # App entry point
│   └── index.css                 # Global styles
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend server running (see [where-to-BE](https://github.com/aartisingh07/where-to-BE))

### Installation

```bash
# Clone the repo
git clone https://github.com/aartisingh07/where-to-FE.git
cd where-to-FE

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run Locally

```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🔗 Related

- 🔧 **Backend Repo**: [where-to-BE](https://github.com/aartisingh07/where-to-BE)

---

## 👩‍💻 Author

**Aarti Singh** — [@aartisingh07](https://github.com/aartisingh07)
