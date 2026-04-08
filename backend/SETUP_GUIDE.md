# Event Hub Backend - Setup & Development Guide

## 🎯 Quick Start

### 1. Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
# Windows: Start MongoDB from Services
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
Update `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/event_hub
```

### 3. Configure Environment Variables

Update `.env` file:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/event_hub
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Seed Database (Optional but Recommended)

```bash
npm run seed
```

This creates:
- 8 sample users with different roles
- 6 sample events
- 3 sample notifications

### 5. Start Development Server

```bash
# With auto-reload on file changes
npm run dev

# Or for production
npm start
```

Server starts at `http://localhost:5000`

---

## 🧪 Testing the API

### Option 1: Using cURL

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get events (no auth required)
curl http://localhost:5000/api/events

# Get current user (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

### Option 2: Using Postman

Import the Postman collection: [event-hub-collection.json](./event-hub-collection.json)

### Option 3: Using Insomnia

Similar to Postman - import the collection

### Option 4: Using VS Code REST Client

Create a `.http` file:

```http
### Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

### Get Current User
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📚 Common Tasks

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Speaker",
    "email": "alice@example.com",
    "password": "securepass123",
    "role": "SPEAKER"
  }'
```

Roles: `ADMIN`, `ORGANIZER`, `SPEAKER`, `USER`

### Create an Event (as SPEAKER)

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Workshop",
    "description": "Learn React from basics",
    "type": "Tech",
    "dateTime": "2024-03-01T10:00:00Z",
    "duration": 120,
    "location": "Tech Center",
    "maxParticipants": 50
  }'
```

### Get All Events

```bash
curl http://localhost:5000/api/events
```

With filters:
```bash
curl "http://localhost:5000/api/events?status=APPROVED&type=Tech"
```

### Register for an Event

```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID/register \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve an Event (as ORGANIZER)

```bash
curl -X PUT http://localhost:5000/api/events/EVENT_ID/approve \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

### Get Notifications

```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Recommendations

```bash
curl http://localhost:5000/api/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Debugging

### Enable Detailed Logging

The app logs main events automatically. To add more:

```javascript
// In any service file
console.log('Event created:', event);
console.error('Error:', err);
```

### Check MongoDB Connection

```bash
# Open MongoDB shell
mongosh

# List databases
show dbs

# Use event_hub database
use event_hub

# Check collections
show collections

# View sample document
db.users.findOne()
```

### View Error Details

Check `server.js` error handlers - they log detailed stack traces in development

### Use Chrome DevTools

If making requests from frontend in browser:
1. Open DevTools (F12)
2. Go to Network tab
3. Check request/response headers and body

---

## 🏗️ Project Structure Walkthrough

### Models (`/models`)
- **User.js** - User schema with roles and preferences
- **Event.js** - Event schema with speaker/organizer references
- **Notification.js** - Notification schema with event references

### Services (`/services`)
- **authService.js** - Register/login logic
- **eventService.js** - Event CRUD and management
- **notificationService.js** - Notification creation and retrieval
- **recommendationService.js** - Event recommendations

### Controllers (`/controllers`)
- **authController.js** - Auth endpoint handlers
- **eventController.js** - Event endpoint handlers
- **notificationController.js** - Notification endpoint handlers
- **recommendationController.js** - Recommendation endpoint handlers

### Middleware (`/middlewares`)
- **auth.js** - JWT verification and role checking
- **errorHandler.js** - Global error handling

### Utils (`/utils`)
- **jwt.js** - Token generation/verification
- **response.js** - Standardized response formatting
- **eventEmitter.js** - Notification event emitter

### Config (`/config`)
- **db.js** - MongoDB connection setup
- **events.js** - Event listener initialization

---

## 🚀 Deployment Checklist

- [ ] Environment variables set for production
- [ ] JWT_SECRET changed to strong value
- [ ] NODE_ENV set to production
- [ ] MongoDB connection string configured for production
- [ ] CORS origins restricted to frontend domain
- [ ] Error messages don't expose sensitive info
- [ ] Database indices created
- [ ] Logging configured
- [ ] Rate limiting added (if needed)
- [ ] Backup strategy for MongoDB

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Try restarting MongoDB service

### Token Expired Error

```
Error: Token expired
```

**Solution:**
- User needs to login again to get new token
- Check token expiration time in jwt.js (currently 7 days)

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Kill the process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # Linux/Mac
```

### CORS Issues

If frontend gets CORS error, update in `app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
```

---

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Server running without errors
- [ ] Can register a new user
- [ ] Can login and receive JWT
- [ ] Can create a new event
- [ ] Can fetch events
- [ ] Can register for an event
- [ ] Can fetch notifications
- [ ] Can get recommendations
- [ ] Error handling works (try invalid email)
- [ ] Role-based access works (try accessing admin-only endpoint as USER)

---

**Happy Coding! 🚀**
