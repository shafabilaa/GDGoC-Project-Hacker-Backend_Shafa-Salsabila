**Movie Watchlist API**

A backend application for managing movie collections, watchlists, and watched history. This project also integrates Google Gemini AI to provide personalized movie recommendations based on user preferences, grounded in the local movie database.

**1. Features**
   - user registration and login
   - password hashing using bcrypt
   - JWT-based authentication and authorization
   - browse all available movies
   - view movie details
   - add and remove movies from a personal watchlist
   - record watched movies with ratings and reviews
   - AI-powered movie recommendations using Google Gemini
   - input validation and structured error handling
     
**2. Technologies Used**
  - runtime: Node.js
  - backend framework: Express.js
  - database: MySQL
  - authentication: JSON Web Token (JWT)
  - password hashing: bcryptjs
  - AI integration: Google Gemini API
  - database driver: mysql2
  - API testing: Postman

**3. Prerequisites**
  - Node.js
  - npm
  - MySQL
  - Git
  - Postman (API Testing)

**4. Installation**

clone the repository: https://github.com/bimoar07/movie-watchlist-starter

navigate to the backend directory: cd movie-watchlist-starter/bacend

install the required dependencies: npm install

**5. Environment Variables**

create a .env file inside the backend directory and add the:

  DB_HOST=localhost -> MySQL server host
 
  DB_USER=root -> database username
  
  DB_PASSWORD= -> database password
  
  DB_NAME=movie -> database name
  
  DB_PORT=3306 -> database port

  JWT_SECRET= -> secret key used for JWT authentication
 
  GEMINI_API_KEY= -> API key for Google Gemini integration

**6. Database Setup**

start your MySQL server and create the database: 
 
  create database movie;
  
  use movie;

create the following tables in the specified order

**7. Database Seeding**

After creating the database and all required tables, run the following command from the backend directory: node seed.js

this script inserts the initial movie dataset into the movies table and the expected output is: Berhasil memasukkan data film!

Notes: The original data/seed.sql file is not used in this setup because its schema and SQL syntax differ from the MySQL database structure used by this backend

**8. Running the Application**

Make sure: MySQL/MariaDB is running, The .env file is properly configured, The database and required tables have been created, and the movie dataset has been seeded.

Start the backend server: node server.js

If successful, the terminal will display: Server berjalan di http://localhost:3000

The API base URL is: http://localhost:3000

Use Postman to send requests and test the available endpoints.

**9. API Endpoints**
  - Authentication

    POST /api/auth/register -> register a new user (no need authentication)

    POST /api/auth/login -> login and receive JWT (no need authentication)
  - Movies

    GET /api/movies -> retrieve all movies (no need authentication)

    GET /api/movies/:id -> retrieve more details (no need authentication)

    POST /api/movies/recommend -> get AI-powered movie recommendations (no need authentication)
  - Watchlist
    
    GET /api/watchlist -> retrieve user's watchlist (need authentication)

    POST /api/watchlist -> add a movie to watchlist (need authentication)

    DELETE /api/watchlist/:id -> remove a movie from watchlist (need authentication)
  - Watched History and Reviews

    GET /api/watched -> retrieve watched movie history (need authentication)

    POST /api/watched -> record a watched movie & review (need authentication)

For protected endpoints, include the JWT token in the request header: Authorization: Bearer token

**10. AI Movie Recommendation**

The application integrates Google Gemini API to recommend movies based on the user's mood and description

Endpoint: POST /api/movies/recommend
  - Local Database Grounding
    To ensure recommendations are based on actual movies in the database:
    1. The backend retrieves the available movie list from the local database.
    2. The movie data is included in the prompt sent to Gemini.
    3. Gemini is instructed to select only one movie from the provided dataset.
    4. Gemini returns the selected movie ID and recommendation reasoning in JSON format.
    5. The backend validates the returned movie ID against the local database before sending the response.

This approach helps reduce hallucinations and ensures that the recommended movie exists in the application's database.

**11. Project Structure**
backend/
  middleware/
    authMiddleware.js
  routes/
    auth.js
    movies.js
    watchlist.js
    watched.js
  .env
  .gitignore
  db.js
  seed.js
  server.js
  package.json
  package-lock.json

data/
  movies.json
  seed.sql

frontend/

**12. Security Considerations**
  - Passwords are hashed using bcryptjs before being stored in the database
  - JWT is used to authenticate users and protect private endpoints
  - Protected routes validate JWT tokens through authentication middleware
  - SQL queries use parameterized statements to reduce SQL injection risks
  - Input validation and error handling are implemented to handle invalid requests
  - Environment variables are used to store sensitive configuration values
