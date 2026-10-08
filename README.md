# Secure User Data App — Task 04

## Project
An authenticated web application where users register, log in securely, and access only their own stored data.

## Features
- User registration
- Password hashing with bcrypt
- Login authentication
- Session-based access control
- User-scoped data
- SQLite database
- Add and delete personal data
- Input validation
- Logout
- Responsive interface

## Requirements
- Node.js 18+
- npm

## Run locally
1. Open this project folder in VS Code.
2. Open Terminal.
3. Run:
   `npm install`
4. Start:
   `npm start`
5. Open:
   `http://localhost:3000/register.html`

## Security notes
- Passwords are never stored as plain text; bcrypt hashes are stored.
- SQL queries use parameters.
- API routes require a signed-in session.
- User data queries include the current session user's ID.
- `.env` and the SQLite database are excluded from Git.

## Deployment note
For production, set a strong `SESSION_SECRET` environment variable and use a persistent database/storage solution supported by the deployment platform. The included SQLite setup is intended for local demonstration unless the host provides persistent storage.
