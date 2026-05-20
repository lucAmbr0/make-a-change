# Make-A-Change

[![wakatime](https://wakatime.com/badge/github/lucAmbr0/make-a-change.svg)](https://wakatime.com/badge/github/lucAmbr0/make-a-change)
![Status](https://img.shields.io/badge/status-maintained-green)
![License](https://img.shields.io/badge/license-GNU%20GPL%20v3.0-yellow)
![Lines of Code](https://img.shields.io/badge/lines-19.2k-blue)
<!-- cloc src scripts -->
![GitHub repo size](https://img.shields.io/github/repo-size/lucAmbr0/make-a-change)
![GitHub commit activity](https://img.shields.io/github/commit-activity/t/lucAmbr0/make-a-change)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y71DD2GE)

Your ideas matter. Make A Change.

**Make-A-Change** is a civic engagement platform that allows people to create, support, and spread proposals for change.  
The goal is to make public initiatives easier to start, easier to discover, and easier to amplify.

Instead of ideas disappearing in small circles, this platform helps them reach the people who can support them.


---

# Table of Contents

- [About the Project](#-about-the-project)
- [Goals](#-goals)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [Screenshots](#-screenshots)
- [Tech Stack](#️-tech-stack)
- [Technical Architecture](#️-technical-architecture)
- [Design Process](#-design-process)
- [Backend Architecture](#️-backend-architecture)
- [Project Status](#-project-status)

---

# 📖 About the Project

Many people have ideas that could improve communities, institutions, or everyday life.  
However, transforming an idea into a visible and supported initiative is often difficult.

**Make-A-Change** provides a structured platform where users can:

- propose initiatives
- gather support
- share ideas with a wider audience
- discover causes worth supporting

The goal is not only to host petitions, but to create a **space where ideas resonate and grow through collective support**.

---

# 🎯 Goals

The project focuses on a few core objectives:

### Accessibility
The platform should be usable by anyone, regardless of technical knowledge.

### Visibility
Ideas should reach people who might support them.

### Simplicity
Publishing and supporting initiatives should take only a few steps.

### Transparency
Information about initiatives should be clearly structured and easy to understand.

---

# ✨ Key Features

###  Create Campaigns
Users can publish proposals describing a change they want to promote.

### Support Initiatives
Other people can support campaigns they believe in.

### Join organizations
People living in a community such as schools, hobby clubs or sports teams can create organizations to group their ideas together and keep updated.

### Scale your initiatives
Comments, favorites and social media integrations make it easy for you to reach a wide target of people.


---

# 📐 Getting Started

Follow these steps to set up and run Make-A-Change locally.

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **MariaDB Server** (or MySQL 5.7+)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/lucAmbr0/make-a-change.git
cd make-a-change
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

Create a `.env.local` file in the project root and add your database credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/make_a_change"
```

Adjust the credentials and database name according to your MariaDB setup.

### Database Setup

1. **Start the MariaDB server:**

On Windows:
```bash
mysqld --datadir="C:\Users\YourUsername\Documents\mariadb\data"
```

On macOS/Linux:
```bash
mysql.server start
```

2. **Connect to MariaDB and create the database:**

```bash
mariadb -u root -p
```

3. **Build the database schema and seed demo data:**

```bash
source scripts/dump-structure.sql;
source scripts/seed_demo.sql;
```

4. **Hash seed passwords** (required if using demo data):

```bash
node scripts/hash_seed_passwords.js
```

### Build and Run

1. **Build the application:**

```bash
npm run build
```

2. **Start the development server:**

```bash
npm run dev
```

Or for production:

```bash
npm run start
```

3. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

# 📸 Screenshots

Below are a few UI screenshots (click any image to view full size).

<table>
    <tr>
        <td><img src="public/screenshots/desktop-1.png" alt="Screenshot 1" width="320" style="border-radius:8px;"/></td>
        <td><img src="public/screenshots/desktop-2.png" alt="Screenshot 2" width="320" style="border-radius:8px;"/></td>
        <td><img src="public/screenshots/desktop-3.png" alt="Screenshot 3" width="320" style="border-radius:8px;"/></td>
    </tr>
    <tr>
        <td><img src="public/screenshots/desktop-4.png" alt="Screenshot 4" width="320" style="border-radius:8px;"/></td>
        <td><img src="public/screenshots/desktop-5.png" alt="Screenshot 5" width="320" style="border-radius:8px;"/></td>
        <td><img src="public/screenshots/desktop-6.png" alt="Screenshot 6" width="320" style="border-radius:8px;"/></td>
    </tr>
</table>


---

# 🛠️ Tech Stack

### Core Technologies

- **Node.js**
- **Next.js**
- **TypeScript**
- **MariaDB / MySQL**

### Frontend

- React (via Next.js)
- Focus on Design and Accessiblity
- Modern responsive UI

### Backend

- Next.js API Routes
- Service-based backend structure
- Zod schema validation
- JWT authentication

### Database

- MariaDB / MySQL
- Relational schema

---

# 🏗️ Technical Architecture

Make-A-Change is built as a **modern full-stack web application**.

The project prioritizes:

- Maintenability and Scalability
- Secure data handling
- Strong typing
- Solid API reliability
- Readable backend flow

The application follows a structured architecture where each layer has a specific responsibility.

```
Client (Next.js React UI)
        │
        ▼
API Endpoint (Next.js route)
        │
        ▼
Validation Schema (Zod)
        │
        ▼
Service Layer (Business logic)
        │
        ▼
Database Access Layer
        │
        ▼
MariaDB Database
```


This structure keeps logic organized and prevents mixing responsibilities across the codebase.

---

# 🎨 Design Process

The project was designed in multiple stages before implementation.

### 1. Conceptual Architecture

Initial ideas were translated into simple diagrams to define:

- Platform goals
- Data relationships
- User flows
- System structure

### 2. Interface Design

The user interface was designed in **Figma** with attention to:

- UX clarity
- Intuitive navigation
- Accessibility
- Visual hierarchy

### 3. Development

After the design phase, the application structure was implemented using a modular architecture to keep the codebase maintainable.

---

# ⚙️ Backend Architecture

The backend follows an easily understandable flow that separates concerns between validation, logic, and data access.

```
User interaction
    │
    ▼
API Route
    │
    ▼
Input Validation (Schema)
    │
    ▼
Service Layer
    │
    ▼
Database Layer
    │
    ▼
Database
```

---

### Database structure:

<p style="text-align: center;">
<img src="public/db-schema.svg" width="100%">
<p>

---

### API routes:

<!-- cd src/app/api && ls -TD -->

```
.
├── auth
│   ├── devlogin
│   ├── login
│   ├── logout
│   ├── me
│   └── signup
├── campaign
│   ├── [id]
│   │   ├── access
│   │   ├── can-edit
│   │   ├── comments
│   │   │   └── [commentId]
│   │   │       ├── can-delete
│   │   │       └── moderation
│   │   └── signature
│   └── reposts
├── notification
│   └── create
└── organization
    ├── [id]
    │   ├── approval_requests
    │   ├── invite_codes
    │   └── member
    │       └── me
    ├── join
    └── lookup
```

---

# 📊 Project Status

The project is currently **in development**.

Planned improvements include:

- campaign discovery algorithms
- moderation tools
- additional UI refinements

---

# Vision

Ideas should not disappear.

With the right tools, a single idea can resonate, spread, and grow into real change.

**Make-A-Change exists to make that possible.**
