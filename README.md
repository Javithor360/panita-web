<div align="center">
  <img src="public/assets/logo_white.svg" alt="Panitacraft Logo" width="200" height="200" />
  <h1>Panitacraft Web Platform</h1>
  <p><em>A community that endures through time.</em></p>
</div>

<br />

Panitacraft Web is the official platform designed to immortalize and manage the history of the Panitacraft community. Built with a focus on user experience and a modern architecture, the project consolidates past server editions, multimedia content, and member progression within a centralized ecosystem.

## Core Features (End-User)

* **Interactive Multimedia Gallery:** A centralized viewer to explore photos and videos from different server editions. It features native support for multiple media formats, providing a smooth and immersive browsing experience through the community's memories.
* **User Profiles & Progression:** Every member has a detailed profile showcasing their journey. This includes a history of their participation across editions, acquired roles, and commemorative emblems that act as a digital resume within the ecosystem.
* **Discord Integration:** Seamless connection for fetching avatars and linking identities, unifying the experience between the game server, the chat platform, and the web environment.
* **"Panita of the Month" Recognition:** Periodically highlights outstanding community members. Interacting with the featured profile displays detailed information about their achievements and contributions.
* **Intuitive Administration Panel:** A dedicated graphical interface for the staff, focused on managing users, ranks, and emblems. It includes proactive data-loss prevention systems to alert against unsaved changes.
* **Personal Account Management:** Self-service capabilities allowing users to edit their posts, update security credentials, and customize their public information.

## Technical Architecture

The project is built upon a cutting-edge technology stack, ensuring high performance, security, and a scalable development experience.

* **Core Framework:** Next.js (App Router) running on React 19, optimizing rendering performance and routing.
* **Database & ORM:** PostgreSQL managed via Prisma ORM v7. It defines robust relational schemas for linking entities (User, Edition, Photo, Emblem, Role).
* **Authentication & BaaS:** Implementation of Supabase (`@supabase/ssr` and `supabase-js`) for session validation, JWT handling, and protected routes.
* **Media Storage:** Integration with Cloudinary for hosting, dynamic optimization, and delivery of static assets and videos.
* **Design & UI:** 
  * Tailwind CSS (v4) as the utility-first styling engine.
  * Modular, accessible, and standardized components built with `shadcn/ui` and `@base-ui/react`.
  * Fluid animations powered by `tailwindcss-animate` and `tw-animate-css`.
  * Support for advanced UI interactions (such as drag-and-drop) using `@dnd-kit`.

## Data Structure (Core Models)

The underlying business logic relies on a well-normalized relational model:

* **User:** Manages identity (IGN, Discord ID, hashed passwords using `bcryptjs`) and access controls.
* **Edition:** Represents the different seasons or eras of the server, serving as an anchor to categorize content and participation.
* **Photo:** The central entity of the gallery module; relates files, descriptions, categories, and authors.
* **Emblem & Role:** A system of hierarchy and assignable achievements that grant identity and additional permissions to each account.

## Local Development & Setup

To initialize the local development environment, Node.js (v20+ recommended) and a compatible package manager are required.

1. **Clone the repository and access the directory:**
   ```bash
   git clone <repository_url>
   cd panita-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   It is strictly necessary to configure a `.env` file at the root of the project. This file must contain the following environment variables for PostgreSQL connection, Cloudinary, and Supabase integration:

   ```env
   # PostgreSQL Connection (Prisma)
   DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true"
   DIRECT_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

   # Cloudinary Keys
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   
   # Supabase Keys (if applicable)
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```

4. **Database Synchronization:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The local environment will be accessible at `http://localhost:3000`.

---
*Built with precision to preserve the legacy of Panitacraft.*
