# ⚔️ Typing Battle Arena

Welcome to **Typing Battle Arena**, a fast-paced multiplayer and single-player game where typing speed and coding accuracy are your weapons! Battle against smart AI bots or challenge your friends in real-time 1v1 duels.

## 🔗 Live Demo
**[🎮 Play Typing Battle Arena Live! (https://typing-battle-game-jmjv.onrender.com/)](https://typing-battle-game-jmjv.onrender.com/)**

---

## 📖 The Story & Purpose
As developers, we spend hours typing code every day. But practicing typing on generic training sites can get boring quickly. 
The purpose of **Typing Battle Arena** was to turn typing practice and coding syntax training into a competitive, adrenaline-fueled game. Whether you want to test your raw WPM limits or practice writing code snippets under pressure against a friend, this game gamifies that struggle.

---

## 🛠️ The Tech Hurdles We Encountered (And How We Solved Them)
Building a real-time web application always comes with surprises. Here is the journey of how we evolved this project:

### 1. The Multi-Hosting Headache (CORS & Redirection)
Originally, we split the project by hosting the frontend React client on Vercel and the backend Express server on Render. This quickly turned into configuration chaos:
* Browsers blocked cookie-based sessions due to cross-site CORS policies.
* Email verification links and oauth redirect pages had to be manually synchronized on every deploy.
* **The Solution**: We refactored the project into a **monolithic architecture**. The backend Express server now serves the built React static files directly from its root. This unified the domain, completely eliminated CORS issues, and made deployment seamless.

### 2. The Dev vs. Prod Database Settings
Connecting Prisma Client to a PostgreSQL database on Neon worked perfectly on localhost, but compiling type-declarations on Render in production mode threw errors because Render excludes `devDependencies` by default.
* **The Solution**: We moved all backend type-declarations directly into `dependencies` inside the server configuration, ensuring the TypeScript compiler builds cleanly in any production environment.

### 3. Custom Auth vs. Clerk Integration
Initially, we implemented a custom authentication system from scratch with JWTs, Passport OAuth, and SMTP email verifications (via Resend). This created database complexity and required managing user passwords, tokens, and email templates manually.
* **The Solution**: We transitioned to **Clerk Auth**. This gave the game a highly polished, secure login system with Google integration out of the box, and allowed us to sync user global ranks using Clerk's custom user metadata directly.

---

## 🧠 What I Learned
* **Simplicity Wins**: Monolithic setups are often far better for small-to-medium full-stack projects compared to managing separate frontend/backend deployments.
* **Leverage the Ecosystem**: Writing secure authentication, OAuth, and email verification workflows manually is a great exercise, but using established platforms like Clerk saves time, boosts security, and provides a premium UI.
* **Relative Configurations**: Hardcoding API URLs limits flexibility. Resolving API and WebSocket paths relatively (`/ws-multiplayer` and `/api/...`) makes local testing and live staging extremely clean.

---

## 🚀 Features
* **🤖 Local AI Duel**: Train WPM and solve coding challenges at your own pace against dynamic bots.
* **⚔️ Room 1v1 Arena**: Battle friends in real time using a synchronized WebSocket matchmaking room.
* **🔑 Clerk Authentication**: Secure, premium sign-in and sign-up with Google OAuth.
* **📊 Global Ladder Rating**: Sync and climb ranks. Your skill level updates in real-time.
* **💬 Player Reviews Slider**: Leave a rating and review in your profile, displayed dynamically on the main lobby slider.

---

## 💻 Tech Stack
* **Frontend**: React (TypeScript), Vite, CSS3 (Premium Retro-Cyberpunk grid style).
* **Backend**: Node.js, Express, WebSockets (`ws`).
* **Database**: Neon PostgreSQL, Prisma client.
* **Authentication**: Clerk React SDK.
