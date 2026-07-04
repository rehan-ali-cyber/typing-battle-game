# Typing Battle Arena

Typing Battle Arena is a game where typing speed and coding accuracy are your weapons. You can play against AI bots or challenge friends in real-time 1v1 duels. The live game is here: https://typing-battle-game-jmjv.onrender.com/

### Why I built this
As developers, we spend hours writing code every day, but practicing typing on generic sites gets boring fast. I wanted to build something that turns standard typing practice and coding syntax training into a competitive game. Whether you want to test your raw WPM limits or practice writing code under time pressure, this project gamifies that struggle.

### The hurdles and how they were solved
Building this came with a few major roadblocks. Originally, the project was split: frontend React was on Vercel, and the backend Express server was on Render. This turned out to be a nightmare because browsers blocked cookie-based sessions due to cross-site CORS policies. Also, managing email verification and OAuth redirect pages across two hosts was tedious. To fix this, I combined everything into a monolith where Express serves the React static build from its root. This solved all CORS issues instantly and made hosting much easier.
Another issue was database deployment. When connecting Prisma to Neon PostgreSQL, the build failed in production because Render excludes devDependencies by default, breaking TypeScript compilation. I fixed this by moving all backend type-declarations directly into dependencies in package.json.
Lastly, managing custom authentication (JWTs, Passport, and SMTP emails via Resend) added unnecessary code bloat. To simplify things, I switched to Clerk Auth. This provided a secure login system and let us store global user ratings using Clerk's custom user metadata directly, avoiding extra database sync tables.

### What I learned
This project taught me that monolithic architectures are often much easier to manage for small full-stack apps than split hosting. I also learned that using services like Clerk for user accounts saves time and provides a better experience than building auth from scratch. Finally, keeping API and WebSocket paths relative makes local testing and live deployment seamless.

### Tech Stack
The frontend is built with React, Vite, TypeScript, and Vanilla CSS. The backend uses Node.js, Express, and WebSockets. Data is stored in Neon PostgreSQL using Prisma, and authentication is handled by the Clerk SDK.
