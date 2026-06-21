# 🗺️ Where To? — Frontend

> React + Vite client for the **Where To?** platform — a real-time collaborative platform where users can explore nearby places solo or connect in group lobbies to chat, vote on games, discover movies, and sync Pomodoro study timers.

---

## ✨ Features

- 🔐 **JWT Auth integration** — Secure logins and signups with token persistence in localStorage and React Router route guards (Protected vs Guest routes).
- 🧭 **Explore Mode (Solo Place Finder)** — Browser geolocation capturing, mood filter selectors, radius indicator sliders, debounced location search autocomplete suggestions dropdown, visual category gradients for placeholder photos, and Google Maps direction integrations.
- 👤 **Saved Places Collection** — Profile page displaying personal user details and a list of saved venues with links and removal buttons.
- 🏠 **Lobby Join & Create** — Lobbies created with name inputs and copy-to-clipboard buttons, alongside OTP-styled 6-character room code entry boxes.
- 💬 **Socket Chat & Presence** — Sidebar tracking active room members, host tags, online indicators, and group text chat with system join/leave notices.
- 🎮 **Game Lounge & Live Voting** — Lists of browser games with live voting panels (yes, no, maybe progress bars and host early end overrides).
- 🎬 **Watch Lounge (TMDB & Streaming providers)** — Filter filters (moods, genres, languages), movie list summaries, movie proposals, and custom victory cards calling API to display logo shortcuts of streaming providers (Netflix, Prime Video, Disney+).
- 📚 **Study Lounge (Pomodoro & Tasks)** — Synced circular SVG countdown timers for Work/Break phases, alongside personal local Todo checklists.
- 📍 **Outing Lounge (midpoint planning)** — Geolocation submissions, submission status rosters, midpoint centroid search aggregations, and results place voting.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Frontend packaging and dev server |
| React Router v7 | Client routing management |
| Tailwind CSS v3 | Utility-first CSS styling |
| Socket.io Client | Real-time connection client |
| Axios | HTTP request interceptors |
| React Toastify | Toast alerts and error warnings |
| React Icons | Curated modern icon sets (Lucide/Fi) |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/               # Static icons and logos
│   ├── components/           # Reusable view components
│   │   ├── common/           # Custom standard buttons / forms
│   │   ├── layout/           # Navbar component
│   │   ├── games/            # GameList, GameVoting modules (Phase 4)
│   │   ├── movies/           # MovieFilters, MovieCard, WatchLounge (Phase 5)
│   │   ├── outing/           # OutingFilters, OutingResults, OutingLounge (Phase 6)
│   │   └── places/           # PlaceCard list items (Phase 2)
│   ├── context/
│   │   ├── AuthContext.jsx   # User authentication provider
│   │   └── SocketContext.jsx # Socket.io-client provider
│   ├── hooks/
│   │   └── useGeolocation.js # Navigator geolocation hook
│   ├── pages/
│   │   ├── Home.jsx          # Mode selector landing page
│   │   ├── Login.jsx         # Login form
│   │   ├── Register.jsx      # Registration form
│   │   ├── Explore.jsx       # Solo place finder explorer
│   │   ├── CreateRoom.jsx    # Room creator & code copy
│   │   ├── JoinRoom.jsx      # OTP room code input
│   │   ├── Profile.jsx       # User details & favorites list
│   │   └── Room.jsx          # Synced collaborative room panels
│   ├── services/
│   │   ├── api.js            # Axios request configurations
│   │   ├── authService.js    # Register/Login requests
│   │   ├── placeService.js   # Save/Load place requests
│   │   └── roomService.js    # Create/Join/Get room endpoints
│   ├── App.jsx               # Protected/Guest Route routing wraps
│   ├── main.jsx              # React mounting root
│   └── index.css             # Component style layers & animations
├── index.html
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend API running locally or hosted (see [where-to-BE](https://github.com/aartisingh07/where-to-BE))

### Installation

```bash
# Clone the repository
git clone https://github.com/aartisingh07/where-to-FE.git
cd where-to-FE

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run Locally

```bash
npm run dev
```

The app will launch at `http://localhost:5173`.

---

## 📦 Build for Production

```bash
npm run build
```

The production assets will be built into the `dist/` directory.

---

## 🔗 Related

- 🔧 **Backend Repo**: [where-to-BE](https://github.com/aartisingh07/where-to-BE)

---

## 👩‍💻 Author

**Aarti Singh** — [@aartisingh07](https://github.com/aartisingh07)
