# TravelLog - Backend (Server)

TravelLog is a comprehensive travel management and booking platform. This repository contains the backend server, built with Node.js and TypeScript, designed to handle user authentication, vendor management, package scheduling, secure payments, and AI-powered features.

🔗 **Client Repository:** https://github.com/Ajithnp/Travel-Log-client.git  
🔗 **Live Link:** [https://www.thetravellog.online/](https://www.thetravellog.online/)
---

## 💡 About the Project

TravelLog is a **travel booking application** focused on **short-term and weekend trips** across India. The platform bridges the gap between passionate travelers and creative local tour operators, enabling users to discover and book unique, handcrafted travel packages centered around Indian destinations — from hidden hill stations and coastal escapes to heritage towns and adventure trails.

The core idea is simple: make **weekend travel effortless** by connecting users with **verified local vendors** who design creative, affordable, and memorable short-trip packages.

---

## 👥 Application Roles

The platform operates with three distinct roles, each with a dedicated interface and set of capabilities:

| Role | Description |
|---|---|
| **User** | Travelers who browse, discover, and book travel packages. They can manage their bookings, chat with vendors, and receive AI-powered travel suggestions. |
| **Vendor (Tour Operator)** | Local travel operators who register, get verified, and publish their own creative travel packages and trip schedules. They manage bookings, handle payouts via Stripe, and interact with users through the platform. |
| **Admin** | Platform administrators who oversee vendor verification, manage categories, monitor financials, handle disputes, and maintain the health of the platform. |

---

## 🏗 Architecture & Design Principles

The backend is engineered with scalability, maintainability, and enterprise-grade patterns in mind:

- **OOPs + SOLID Principles:** The codebase strictly adheres to Object-Oriented Programming concepts and SOLID principles to ensure decoupled, testable, and robust code.
- **Repository Layer Architecture:** Implements a clear separation of concerns by utilizing the Repository Pattern. Controllers handle HTTP requests, Services contain business logic, and Repositories manage data access, making the database layer easily interchangeable.
- **Dependency Injection:** Utilizes TSyringe (or similar DI container) for efficient dependency management and easier unit testing.

## 🚀 Key Features & Modules

- **Authentication & Authorization:** Secure JWT-based authentication with role-based access control (Admin, User, Vendor) and Google OAuth integration.
- **Vendor Management:** Comprehensive onboarding, verification, and dashboard analytics for travel vendors.
- **Package & Schedule Management:** Vendors can create travel packages and schedule trips.
- **Booking Engine & Payments:** Seamless booking flow integrated with **Stripe** for secure payment processing and payout management.
- **Real-time Communications:** WebSockets (Socket.io) integration for live chats and real-time notifications.
- **AI Implementations (Powered by LangChain & Google GenAI):**
  - **RAG Chatbot:** Intelligent conversational agent utilizing Retrieval-Augmented Generation to answer queries based on platform data.
  - **AI Travel Suggestions:** Smart, personalized travel recommendations driven by generative AI.
- **File Management:** Robust file uploads and management using **AWS S3** with pre-signed URLs.

## 🛠 Tech Stack & Tools

- **Core:** Node.js, Express.js, TypeScript
- **Database:** MongoDB (Mongoose) with **Mongo Transactions** to ensure data integrity during complex multi-document operations (e.g., bookings and payments).
- **Caching & Performance:** **Redis** for high-speed data caching, session management, and optimizing repetitive database queries.
- **Payment Gateway:** Stripe API
- **AI / ML:** LangChain, Google GenAI
- **Storage:** AWS S3, Cloudinary (Fallback/Image processing)
- **Security:** `rate-limiter-flexible` for **API Rate Limiting**, Helmet, CORS, bcrypt for password hashing.
- **Real-time:** Socket.io
- **PDF Generation:** PDFKit for generating invoices and booking tickets.

## 🚢 DevOps & Deployment

- **Containerization:** **Dockerized** environments for consistent development and production deployments.
- **CI/CD Pipelines:** Automated testing and deployment workflows to ensure code quality and rapid iteration.
- **Version Control:** Strict **GitHub Workflow** enforcing Pull Requests (PRs), branch protections, and peer reviews before merging to the main branch.
- **Infrastructure:** Deployed on **AWS EC2** instances.
- **Web Server / Reverse Proxy:** **Nginx** configured for load balancing, SSL termination, and serving as a robust reverse proxy.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Redis Server
- AWS Account (for S3)
- Stripe Account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TravelLog/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and configure the necessary keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_url
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_BUCKET_NAME=your_bucket_name
   GOOGLE_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```



