# Pre-Study App Backend

This is the backend server for the Pre-Study App, built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Postman (for API testing)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create environment file:
   ```
   node createEnvFile.js
   ```
   This will create a default `.env` file with development settings.

3. Start the server:
   ```
   npm run dev
   ```

### Production-Ready Setup

For a clean production-ready setup without test data:

1. Install dependencies:
   ```
   npm install
   ```

2. Clean the database and set up environment:
   ```
   npm run reset-to-production
   ```

3. Add real data using Postman (see "Adding Data via Postman" section below)

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Categories
- `GET /api/category` - Get all categories
- `GET /api/category/byType?type=exam` or `type=course` - Get categories by type
- `GET /api/category/tree` - Get category hierarchical tree
- `POST /api/category` - Create new category
- `PUT /api/category/:categoryId` - Update category
- `DELETE /api/category/:categoryId` - Delete category

### Quizzes
- `GET /api/category/:categoryId/quizzes` - Get quizzes for a category
- `GET /api/category/quiz/:quizId` - Get a specific quiz
- `POST /api/category/:categoryId/quizzes` - Create a new quiz
- `POST /api/category/quiz/:quizId/submit` - Submit quiz answers

### Other APIs
- `GET /api/leaderboard` - Get leaderboard data
- `POST /api/feedback` - Submit feedback
- `GET /api/notification` - Get notifications

## Development Login

In development mode, you can use any 6-digit OTP to log in.

1. Request OTP:
   ```
   POST /api/auth/request-otp
   {
     "phoneNumber": "9876543210"
   }
   ```

2. Verify OTP:
   ```
   POST /api/auth/verify-otp
   {
     "phoneNumber": "9876543210",
     "otp": "123456"
   }
   ```

The response will include a token you can use for authenticated requests.

## Adding Data via Postman

### Create Categories
```
POST http://localhost:3000/api/category
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "name": "Mathematics",
  "type": "course",
  "description": "Learn mathematics concepts",
  "image": "https://example.com/math.jpg",
  "order": 1
}
```

### Create Quiz
```
POST http://localhost:3000/api/category/CATEGORY_ID/quizzes
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "name": "Basic Math Quiz",
  "description": "Test your basic math skills",
  "duration": 30,
  "totalQuestions": 5,
  "questions": [
    {
      "text": "What is 2+2?",
      "options": [
        {"id": "A", "text": "3"},
        {"id": "B", "text": "4"},
        {"id": "C", "text": "5"},
        {"id": "D", "text": "6"}
      ],
      "correctOptionId": "B",
      "explanation": "2+2 equals 4"
    }
  ],
  "price": 0,
  "isLocked": false
}
```

## Database Management

### Cleaning the Database
To remove all test data and start fresh:

```
npm run clean-db
```

This will clean all collections while keeping the structure intact.

## Troubleshooting

If you encounter issues:

1. Check MongoDB connection:
   - Ensure MongoDB is running
   - Verify connection string in `.env` file

2. API Connection Issues:
   - Verify server is running on correct port (default 3000)
   - Check CORS settings if connecting from a different origin

3. Reset Everything:
   - Remove the `.env` file
   - Run `node createEnvFile.js` to create a new one
   - Restart the server with `npm run dev`
   - Clean the database with `npm run clean-db`

## License
ISC