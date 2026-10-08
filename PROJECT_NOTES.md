# Task 04 Submission Notes

Project: Secure User Data App

Objective:
Build an authenticated app with hashed passwords, user-scoped data, and a deployed public URL.

Implemented:
1. Registration with bcrypt password hashing.
2. Login with session authentication.
3. Protected dashboard.
4. User-specific data stored using user_id.
5. Input validation.
6. Add/delete data.
7. Logout.
8. README with setup instructions.

Testing:
- Registered two separate users.
- Logged in as each user.
- Confirmed each account can access only its own data.
- Confirmed protected API redirects/rejects unauthenticated access.
- Confirmed data remains in the local SQLite database after server restart.

Submission:
- Public GitHub repository URL: add after GitHub upload.
- Deployed public URL: add after deployment.
