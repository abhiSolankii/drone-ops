# Drone Survey Management System

A web application for managing drone surveys, including mission planning, monitoring, reporting, and a chatbot for user assistance. Built with React (frontend) and Express with Socket.IO (backend).

---

## Setup and Running Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (running locally or via a cloud provider like MongoDB Atlas)
- **Google Generative AI API Key** (for chatbot functionality)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/drone-survey
   GEMINI_API_KEY=your-google-generative-ai-key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

## Functionalities Available

- **Dashboard**: View overall stats (active missions, fleet status, survey sites, alerts), mission statistics, drone statistics, active missions, and drone fleet details.
- **Mission Planning**: Create and schedule new missions with survey area, parameters (altitude, speed, overlap, pattern), and scheduling options.
- **Mission Monitoring**: Monitor in-progress missions, view drone positions on a map, control missions (pause, resume, abort), update mission details, and delete missions.
- **Reports**: Generate, view, and delete survey reports. Visualize mission and drone statistics with bar charts.
- **Chatbot**: A floating chatbot bubble on all pages for user assistance. Supports checking drone/mission status, scheduling missions, and general help via natural language.

---

## Design Decisions and Architectural Choices

### Frontend

- **React with React Router**: Used for a single-page application (SPA) with client-side routing to navigate between Dashboard, Mission Planning, Mission Monitoring, and Reports pages.
- **Socket.IO Client**: Integrated for real-time communication with the backend, enabling live drone position updates and chatbot interactions.
- **OpenLayers**: Used for map visualization in Mission Monitoring to display drone positions dynamically.
- **Recharts**: Utilized for bar charts in the Reports page to visualize mission and drone statistics.
- **Lucide-React Icons**: Chosen for a consistent and modern icon set across the UI.
- **Toast Notifications**: Implemented with `react-hot-toast` for user feedback on actions (e.g., errors, success messages).
- **Modular Components**: Created reusable components like `MissionCard`, `ReportCard`, and `Chatbot` to maintain a clean and maintainable codebase.

### Backend

- **Express with Socket.IO**: Used for the API and real-time communication. Socket.IO handles drone position updates and chatbot messages.
- **MongoDB with Mongoose**: Chosen for the database to store missions, drones, and reports, with geospatial indexing for survey areas.
- **Google Generative AI**: Integrated for the chatbot to process natural language queries and provide intelligent responses.
- **Rate Limiting**: Added with `express-rate-limit` to prevent abuse of API endpoints.
- **Winston Logger**: Implemented for logging server events and errors to both console and file (`server.log`).
- **Error Handling**: Global error handler to catch unhandled errors and return a 500 response, with detailed logging.

### Architectural Choices

- **Client-Server Architecture**: Separated frontend and backend for scalability and maintainability. The frontend communicates with the backend via REST API (`/api/missions`, `/api/drones`, `/api/reports`) and WebSocket for real-time features.
- **Real-Time Features**: Used Socket.IO for live updates (drone positions, chatbot responses) to enhance user experience in Mission Monitoring and Chatbot.
- **Chatbot Integration**: Placed the chatbot at the root level in `AppRouter.jsx` to ensure the floating bubble is available on all pages, providing seamless user assistance.
- **Modular Routes**: Backend routes are split into `missions.js`, `drones.js`, and `reports.js` for better organization and scalability.

---

## AI Tools Integrated

### Google Generative AI (Gemini 1.5 Flash)

- **Integration**: Used in the backend (`chatbotHandler`) to process natural language queries for the chatbot. It handles commands like "drone status <id>", "mission status <id>", and "schedule mission <name> at <time>".
- **Impact on Workflow**:
  - **Enhanced User Interaction**: Enabled natural language support for the chatbot, allowing users to interact conversationally (e.g., "schedule mission TestMission at 2025-03-26T10:00:00.000Z").
  - **Dynamic Responses**: The AI fetches data from the database (e.g., drone/mission details) and generates context-aware responses, improving usability.
  - **Development Efficiency**: Reduced the need for hardcoding complex response logic by leveraging AI to interpret user intents and generate replies.
  - **Limitations**: Requires an API key and is subject to quota limits, which are handled with error messages in the chatbot.

---

## Notes

- Ensure MongoDB is running before starting the backend.
- Replace `your-google-generative-ai-key` in the `.env` file with a valid Google Generative AI API key.
- The chatbot currently uses simulated data for some responses; extend the `chatbotHandler` to integrate more backend logic as needed.
