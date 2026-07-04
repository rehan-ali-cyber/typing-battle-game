# Typing Battle Arena

Typing Battle Arena is a fast-paced multiplayer and single-player game where typing speed and coding accuracy are your weapons. You can battle against dynamic AI bots or challenge friends in real-time 1v1 duels.

You can play the live game here: https://typing-battle-game-jmjv.onrender.com/

---

### The Story & Why I Built This

As developers, we spend hours writing code every single day, but practicing syntax on generic training sites gets boring fast. I wanted to build something that turns standard typing practice and coding syntax practice into an engaging, competitive game. Whether you want to test your raw WPM limits or write code snippets under time pressure against a friend, this project gamifies that struggle.

---

### The Tech Hurdles and How We Solved Them

Building a real-time web application comes with its fair share of challenges. Here is the journey of how this project evolved and the roadblocks we hit along the way.

**The Multi-Hosting Nightmare**
Originally, the project had a split architecture: the frontend React client was hosted on Vercel, and the backend Express server was on Render. This turned out to be a configuration nightmare. Browsers blocked cookie-based sessions due to cross-site CORS policies, and email verification links or OAuth redirect pages had to be manually synced on every single deployment. 

To solve this, we refactored the project into a monolith architecture. The backend Express server now serves the built React static files directly from its root. This unified the domain, completely eliminated CORS issues, and made deployment seamless.

**Type-Declarations and Production Builds**
When connecting Prisma Client to PostgreSQL, everything worked perfectly on localhost, but compiling type-declarations on Render in production mode threw errors because Render excludes devDependencies by default. We resolved this by moving all backend type-declarations directly into dependencies in the package.json file, ensuring the TypeScript compiler builds cleanly in any production environment.

**Custom Auth vs Clerk**
Initially, we implemented a custom authentication system from scratch with JWTs, Passport OAuth, and SMTP email verifications via Resend. This added database complexity and required managing user passwords, tokens, and email templates manually. 

To clean up the bloat, we transitioned to Clerk Auth. This gave the game a highly polished, secure login system with Google integration out of the box. We also utilized Clerk's custom user metadata to store and sync user global ratings without needing a separate database synchronization table.

---

### What I Learned

* Monolithic setups are often far better and easier to manage for small-to-medium full-stack projects compared to running separate frontend and backend hosts.
* Writing authentication workflows from scratch is a great exercise, but utilizing established platforms like Clerk saves time, boosts security, and provides a polished UI.
* Keeping API and WebSocket paths relative (like /ws-multiplayer and /api/ratings) instead of hardcoding absolute URLs makes local testing and live deployment much cleaner.

---

### Tech Stack
* Frontend: React, Vite, TypeScript, Vanilla CSS
* Backend: Node.js, Express, WebSockets (ws)
* Database: Neon PostgreSQL, Prisma
* Authentication: Clerk SDK
