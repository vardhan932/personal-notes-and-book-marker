# Personal Notes & Bookmark Manager

A full-stack application to manage your personal notes and bookmarks, built with Node.js, Express, MongoDB (Atlas), and React (Vite) + Tailwind CSS.

## Features

- **Notes**: Create, read, update, and delete text notes with tags.
- **Bookmarks**: Save links with titles and descriptions.
- **Search**: Fast search by title or content.
- **Modern UI**: Dark-themed, responsive interface using Tailwind CSS.

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for cloud database).

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```
4. `npm run dev` (Runs on `http://localhost:5000` with nodemon)

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Start development: `npm run dev`
4. Access at `http://localhost:5173`

## Deployment

This project is optimized for **Vercel** deployment.
- **Backend**: Configure `MONGO_URI` in Vercel environment variables.
- **Frontend**: Configure `VITE_API_URL` (pointing to your deployed backend API) in Vercel environment variables.

## Technologies
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB Atlas (Cloud)
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios
