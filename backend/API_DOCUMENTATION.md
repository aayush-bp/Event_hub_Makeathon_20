# Event Hub Backend API

A robust, scalable backend for an event management platform with role-based access control, notifications, and smart recommendations.

## 📋 Features

✅ **User Authentication & Authorization**
- JWT-based authentication
- Role-based access control (ADMIN, ORGANIZER, SPEAKER, USER)
- Secure password hashing with bcryptjs

✅ **Event Management**
- Create, read, update events
- Approve/reject events
- User registration for events
- Event status tracking (PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED)

✅ **Notification System**
- Event-driven notifications using Node.js EventEmitter
- Real-time updates (Event approved, rejected, registration confirmation)
- Notification read/unread status
- No external message queues

✅ **Smart Recommendations**
- Personalized event recommendations based on user preferences
- Upcoming events
- Similar events
- Popular events by participant count

✅ **User Preferences**
- Preferred event types
- Notification frequency settings
- Preference updates

## 📁 Project Structure

```
/backend
├── models/               # MongoDB Schemas
│   ├── User.js          # User model with roles
│   ├── Event.js         # Event model
│   └── Notification.js  # Notification model
│
├── services/            # Business Logic Layer
│   ├── authService.js          # Authentication logic
│   ├── eventService.js         # Event management logic
│   ├── notificationService.js  # Notification logic
│   └── recommendationService.js # Recommendation logic
│
├── controllers/         # Request Handlers
│   ├── authController.js           # Auth endpoints
│   ├── eventController.js          # Event endpoints
│   ├── notificationController.js   # Notification endpoints
│   └── recommendationController.js # Recommendation endpoints
│
├── routes/              # API Routes
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── notificationRoutes.js
│   └── recommendationRoutes.js
│
├── middlewares/         # Custom Middleware
│   ├── auth.js          # JWT verification
│   └── errorHandler.js  # Global error handling
│
├── utils/               # Utility Functions
│   ├── jwt.js           # JWT token operations
│   ├── response.js      # Standardized responses
│   └── eventEmitter.js  # Event emitter for notifications
│
├── config/              # Configuration
│   ├── db.js            # MongoDB connection
│   └── events.js        # Event listeners
│
├── seeds/               # Database Seeding
│   ├── seedData.js      # Sample data
│   └── runSeed.js       # Seed runner
│
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Edit .env file
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/event_hub
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## 🔐 Authentication

### Get JWT Token

Register and login to get a JWT token:

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"  // ADMIN, ORGANIZER, SPEAKER, or USER
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using JWT in Requests

Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/preferences` | Update user preferences | Yes |

### Event Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---|---|
| POST | `/api/events` | Create event | Yes | SPEAKER, ADMIN |
| GET | `/api/events` | Get all events | No | - |
| GET | `/api/events/:id` | Get event by ID | No | - |
| PUT | `/api/events/:id` | Update event | Yes | SPEAKER, ADMIN |
| PUT | `/api/events/:id/approve` | Approve event | Yes | ORGANIZER, ADMIN |
| PUT | `/api/events/:id/reject` | Reject event | Yes | ORGANIZER, ADMIN |
| POST | `/api/events/:id/register` | Register for event | Yes | USER |
| POST | `/api/events/:id/unregister` | Unregister from event | Yes | USER |
| GET | `/api/events/user/registered` | Get user's registered events | Yes | - |
| GET | `/api/events/speaker/:speakerId` | Get events by speaker | No | - |

#### Query Parameters (GET /api/events)

```
?status=APPROVED
?type=Tech
?startDate=2024-01-01
?endDate=2024-12-31
```

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/notifications` | Get user notifications | Yes |
| GET | `/api/notifications/unread/count` | Get unread count | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

#### Query Parameters (GET /api/notifications)

```
?unreadOnly=true  // Get only unread notifications
```

### Recommendation Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/recommendations` | Get personalized recommendations | Yes |
| GET | `/api/recommendations/upcoming` | Get upcoming events | No |
| GET | `/api/recommendations/similar/:eventId` | Get similar events | No |
| GET | `/api/recommendations/popular` | Get popular events | No |

#### Query Parameters

```
?limit=5  // Number of results (default: 5)
```

## 📝 Request/Response Examples

### Create Event

```bash
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Web Development Workshop",
  "description": "Learn modern web technologies",
  "type": "Tech",
  "dateTime": "2024-02-15T10:00:00Z",
  "duration": 120,
  "location": "Convention Center",
  "maxParticipants": 50
}
```

### Register for Event

```bash
POST /api/events/64a9c7f8b9c1d2e3f4g5h6i7/register
Authorization: Bearer <token>
Content-Type: application/json
```

### Update Preferences

```bash
PUT /api/auth/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventTypes": ["Tech", "Business"],
  "notificationFrequency": "DAILY"
}
```

## 🗄️ Database Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "ADMIN" | "ORGANIZER" | "SPEAKER" | "USER",
  preferences: {
    eventTypes: Array<String>,
    notificationFrequency: "DAILY" | "WEEKLY" | "NEVER"
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String (Tech, Fun, Business, Educational, Sports, Other),
  dateTime: Date,
  duration: Number (minutes),
  location: String,
  speakerId: ObjectId (ref: User),
  organizerId: ObjectId (ref: User),
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED",
  participants: Array<ObjectId> (ref: User),
  maxParticipants: Number,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  type: "REMINDER" | "RECOMMENDATION" | "APPROVAL" | "REJECTION" | "REGISTRATION",
  title: String,
  message: String,
  isRead: Boolean,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔔 Notification System

The notification system uses Node.js EventEmitter for internal event handling.

### Triggered Notifications

1. **Event Approved** - When organizer approves an event
   - Sent to: Event speaker
   - Type: APPROVAL

2. **Event Rejected** - When organizer rejects an event
   - Sent to: Event speaker
   - Type: REJECTION

3. **Registration Confirmed** - When user registers for event
   - Sent to: Registered user
   - Type: REGISTRATION

### Event Listeners (in config/events.js)

The system automatically listens for:
- `eventApproved` - Triggers approval notification
- `eventRejected` - Triggers rejection notification
- `userRegistered` - Triggers registration confirmation

## 🤖 Recommendation Algorithm

Recommendations are based on:

1. **User Preferences** - Events matching user's preferred types
2. **Event Status** - Only approved events
3. **Future Events** - Only upcoming events not yet registered
4. **Similar Events** - Events of same type as viewed event
5. **Popular Events** - Events with most participants

## 🧪 Seed Data

The seed script creates sample data including:

- 1 Admin user
- 2 Organizer users
- 2 Speaker users
- 3 Regular users
- 5 Approved events
- 1 Pending event
- 3 Sample notifications

**Default Credentials:**
```
Admin: admin@eventhub.com / password123
Organizer: alice@eventhub.com / password123
Speaker: john@eventhub.com / password123
User: alex@eventhub.com / password123
```

## 🛠️ Error Handling

All errors follow a standard format:

```json
{
  "success": false,
  "message": "Error message"
}
```

### Common Error Codes

| Code | Message |
|------|---------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Not Found |
| 500 | Server Error |

## ⚙️ Configuration

### Environment Variables

```bash
PORT              # Server port (default: 5000)
MONGO_URI         # MongoDB connection string
JWT_SECRET        # Secret key for JWT signing
NODE_ENV          # Environment (development/production)
```

### CORS Configuration

Currently allows all origins. For production, update in `app.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## 📊 Architecture Patterns

### MVC + Service Layer

- **Models**: Data structure and MongoDB schemas
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data operations
- **Routes**: Endpoint definitions

### Middleware Stack

1. CORS middleware
2. JSON body parser
3. Event listeners initialization
4. Route handlers
5. Error handler (last middleware)

## 🔒 Security Features

✅ Password hashing with bcryptjs
✅ JWT token-based authentication
✅ Role-based access control
✅ Error handling without exposing sensitive info
✅ Input validation
✅ Protected routes with auth middleware

## 📈 Performance Optimization

- Database indexing on frequently queried fields
- Efficient population of referenced documents
- Async/await for non-blocking operations
- Proper error handling to prevent memory leaks

## 🚧 Future Enhancements

- [ ] Email notifications
- [ ] SMS reminders
- [ ] Real-time WebSocket notifications
- [ ] Event categories with tags
- [ ] Advanced search and filtering
- [ ] User ratings and reviews
- [ ] Event analytics
- [ ] Integration with calendar services
- [ ] File upload for event images
- [ ] Payment integration

## 📞 Support

For issues or questions:
1. Check error messages for details
2. Review the API documentation
3. Check the seed data structure
4. Review middleware error handling

## 📄 License

ISC

---

**Created:** 2024
**Version:** 1.0.0
**Maintainer:** AIGINEERS
