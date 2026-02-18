CLINIC APP

Clinic App is a modern management system for medical clinics designed to streamline healthcare workflows. The application enables efficient coordination between doctors and patients, handling everything from appointment scheduling to prescription management.

TECH STACK

The backend is built on .NET 9.0 (ASP.NET Core API) using SQLite and Entity Framework Core. It follows Clean Architecture principles (Domain, Application, Infrastructure, API layers) and implements JWT Authentication and FluentValidation. The frontend uses React with TypeScript, built with Vite and linted using ESLint.

GETTING STARTED

Prerequisites: .NET 9.0 SDK, Node.js, and npm.

Backend Setup:

1. Navigate to the Clinic.API folder.
2. Run "dotnet ef database update" to set up the database.
3. Run "dotnet run" to start the server (http://localhost:5026/Swagger/index.html).

Frontend Setup:

1. Navigate to the client-app folder and run CMD.
2. Run "npm install" to get dependencies.
3. Run "npm run dev" to start the development server.

Test credentials:
  email: test@gmail.com
  password: ZAQ!2wsx
