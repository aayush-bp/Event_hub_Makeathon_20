# 🚀 Quick Start Guide - Event Hub Backend

Get the Event Hub backend running in < 5 minutes!

## ⚡ TL;DR Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB
# Windows: Run MongoDB from Services
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb-community

# 3. Seed database (optional but recommended)
npm run seed

# 4. Start server
npm run dev
```

**Done!** Server running at `http://localhost:5000`

---

## 🧪 Quick Test

### Option 1: Using cURL (Windows PowerShell)

```powershell
# Register
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "USER"
} | ConvertTo-Json

curl -Method POST `
  -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body $body

# Get Events
curl "http://localhost:5000/api/events"
```

### Option 2: Using VS Code REST Client Extension

Create `test.http` file:

```http
### Register User
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

### Get Events
GET http://localhost:5000/api/events
```

Press "Send Request" above each request to test.

### Option 3: Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `event-hub-postman-collection.json`
4. Set `{{baseUrl}}` to `http://localhost:5000`
5. Run requests

---

## 📚 Sample Credentials (After Seed)

```
Admin User:
Email: admin@eventhub.com
Password: password123

Organizer:
Email: alice@eventhub.com
Password: password123

Speaker:
Email: john@eventhub.com
Password: password123

Regular User:
Email: alex@eventhub.com
Password: password123
```

---

## 🔑 Get JWT Token

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "alex@eventhub.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Copy the token and use in header for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Essential Endpoints

### Auth
```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Get JWT token
GET    /api/auth/me                - Get current user (auth required)
PUT    /api/auth/preferences       - Update preferences (auth required)
```

### Events
```
GET    /api/events                 - List all events
POST   /api/events                 - Create event (auth required, SPEAKER role)
GET    /api/events/:id             - Get one event
PUT    /api/events/:id/approve     - Approve event (auth required, ORGANIZER role)
POST   /api/events/:id/register    - Register for event (auth required)
```

### Notifications
```
GET    /api/notifications          - Get notifications (auth required)
PUT    /api/notifications/:id/read - Mark as read (auth required)
```

### Recommendations
```
GET    /api/recommendations        - Get personalized recommendations (auth required)
GET    /api/recommendations/upcoming - Upcoming events
```

---

## 🧪 Complete Test Flow

### 1. Register A New User

```json
POST http://localhost:5000/api/auth/register

{
  "name": "Alice Speaker",
  "email": "alice.speaker@example.com",
  "password": "securepass123",
  "role": "SPEAKER"
}
```

**Save the token from response!**

### 2. Create An Event (as SPEAKER)

```json
POST http://localhost:5000/api/events
Authorization: Bearer <your_token>

{
  "title": "React Advanced Course",
  "description": "Learn React hooks, context, and performance optimization",
  "type": "Tech",
  "dateTime": "2024-03-15T10:00:00Z",
  "duration": 120,
  "location": "Tech Hub, Room 101",
  "maxParticipants": 50
}
```

**Save the event ID!**

### 3. Get All Events

```
GET http://localhost:5000/api/events
```

You should see your newly created event with status "PENDING".

### 4. Approve Event (as ORGANIZER)

First, register an ORGANIZER:

```json
POST http://localhost:5000/api/auth/register

{
  "name": "Bob Organizer",
  "email": "bob.organizer@example.com",
  "password": "securepass123",
  "role": "ORGANIZER"
}
```

Then approve the event:

```
PUT http://localhost:5000/api/events/<event_id>/approve
Authorization: Bearer <organizer_token>
```

### 5. Register for Event (as USER)

Register a regular user:

```json
POST http://localhost:5000/api/auth/register

{
  "name": "Carol User",
  "email": "carol.user@example.com",
  "password": "securepass123",
  "role": "USER"
}
```

Register for the event:

```
POST http://localhost:5000/api/events/<event_id>/register
Authorization: Bearer <user_token>
```

### 6. Check Notifications (as SPEAKER)

The speaker should have a notification:

```
GET http://localhost:5000/api/notifications
Authorization: Bearer <speaker_token>
```

You should see an "APPROVAL" notification.

### 7. Get Recommendations (as USER)

```
GET http://localhost:5000/api/recommendations
Authorization: Bearer <user_token>
```

---

## 🖥️ Local Development Setup

### MongoDB Local Installation

**Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run installer
3. Check "Install MongoDB as a Service"
4. MongoDB will start automatically at `localhost:27017`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### Verify MongoDB Connection

```bash
# Open MongoDB shell
mongosh

# You should see:
# Current Mongosh Log ID: ...
# > _

# List databases
> show dbs

# Use event_hub database
> use event_hub

# Check collections
> show collections

# View sample document
> db.users.findOne()
```

---

## 🔧 Environment Configuration

Modify `.env` if needed:

```bash
# .env file
PORT=5000                                          # Server port
MONGO_URI=mongodb://localhost:27017/event_hub     # MongoDB connection
JWT_SECRET=your_secret_key_change_in_production  # JWT secret
NODE_ENV=development                              # Environment
```

For remote MongoDB (Atlas):
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/event_hub
```

---

## 📊 Check Server Startup

After `npm run dev`, you should see:

```
╔━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╗
║     EVENT HUB API SERVER STARTED  ║
║                                  ║
║  🚀 Server running on port: 5000 ║
║  📍 Environment: development     ║
║  🗄️  Connected to MongoDB        ║
╚━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╝
```

If you see errors, check:
1. MongoDB is running
2. Port 5000 is not in use
3. `.env` file exists
4. `npm install` completed successfully

---

## 🚨 Common Issues & Solutions

### "Cannot connect to MongoDB"
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Start MongoDB service
- Windows: Check Services → MongoDB Community Server
- Linux: `sudo systemctl start mongod`
- macOS: `brew services start mongodb-community`

### "Port 5000 already in use"
```
Error: listen EADDRINUSE :::5000
```
**Fix:** Kill process using port 5000
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

### "jwt malformed" error
**Fix:** Make sure token is included correctly:
```
Authorization: Bearer <token_here>
```

Not:
```
Authorization: <token_here>
Authorization: Bearer
```

### "Event not found" when registering
**Fix:** Event must be APPROVED first
- Only APPROVED events show in public list
- Only APPROVED events can be registered
- Use `/approve` endpoint as ORGANIZER

---

## 📈 Next Steps

1. **Explore all endpoints** - Try all API methods in collection
2. **Read API Documentation** - Check `API_DOCUMENTATION.md`
3. **Understand Architecture** - Read `ARCHITECTURE.md`
4. **Integrate with Frontend** - Connect React/Vue app
5. **Deploy** - Follow deployment checklist

---

## 🎓 Learning Path

1. ✅ Run server locally (you are here)
2. 📖 Read API Documentation
3. 🧪 Test all endpoints
4. 🏗️ Understand Architecture
5. 💻 Connect Frontend
6. 🚀 Deploy to Production

---

## 💬 API Response Format

All responses follow standard format:

```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": { /* response data */ }
}
```

**Success Example:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "_id": "...",
      "title": "Web Dev Workshop",
      "status": "APPROVED"
    }
  ]
}
```

**Error Example:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Can create event as SPEAKER
- [ ] Can approve event as ORGANIZER
- [ ] Can register for event as USER
- [ ] Can fetch notifications
- [ ] Can get recommendations
- [ ] Error responses work (try invalid data)
- [ ] Role-based access works (unauthorized requests return 403)

---

## 🎉 You're All Set!

Your Event Hub backend is ready to go! 

**Next: Connect your frontend and start building!**

📚 For detailed information, check:
- `API_DOCUMENTATION.md` - Full API reference
- `ARCHITECTURE.md` - System design
- `SETUP_GUIDE.md` - Detailed setup
- `event-hub-postman-collection.json` - Postman collection

---

**Questions?** Check the docs or review the code comments!
