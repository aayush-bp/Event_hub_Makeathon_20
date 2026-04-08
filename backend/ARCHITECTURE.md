# Event Hub Backend - Architecture Overview

## 🏗️ Architecture Summary

This is a **monolithic Node.js backend** built with Express.js and MongoDB, following the **MVC + Service Layer** pattern. The architecture prioritizes clean separation of concerns, scalability, and maintainability without microservices complexity.

## 📐 Design Patterns

### 1. MVC + Service Layer Architecture

```
Request → Route → Controller → Service → Model → Database
           ↑       Response ← Data Transformation ←
```

**Benefits:**
- Clean separation of concerns
- Easy to test (services are independent)
- Easy to reuse logic across controllers
- Simple to scale

### 2. Dependency Injection (Implicit)

Services are singletons instantiated once:
```javascript
// services/authService.js
module.exports = new AuthService();

// controllers/authController.js
const authService = require('../services/authService');
```

### 3. Event-Driven Architecture (Internal)

Using Node.js EventEmitter for notifications:
```
Event Approval → EventEmitter.emit('eventApproved') → Listener → Notification Creation
```

No external message queues needed for the notification system.

### 4. Middleware Pipeline

```
CORS → JSON Parser → Event Listeners → Routes → Error Handler
```

## 📁 Folder Structure Explained

```
/backend
├── /models              # Data layer (Mongoose schemas)
│   ├── User.js         # User with authentication
│   ├── Event.js        # Event with speaker/organizer refs
│   └── Notification.js # Notification with user/event refs
│
├── /services           # Business logic layer (no Express)
│   ├── authService.js           # Auth logic
│   ├── eventService.js          # Event CRUD + operations
│   ├── notificationService.js   # Notification operations
│   └── recommendationService.js # Recommendation algorithm
│
├── /controllers        # Request handlers layer (Express)
│   ├── authController.js           # Auth endpoints
│   ├── eventController.js          # Event endpoints
│   ├── notificationController.js   # Notification endpoints
│   └── recommendationController.js # Recommendation endpoints
│
├── /routes            # Route definitions
│   ├── authRoutes.js              # Auth routes
│   ├── eventRoutes.js             # Event routes
│   ├── notificationRoutes.js      # Notification routes
│   └── recommendationRoutes.js    # Recommendation routes
│
├── /middlewares       # Custom middleware
│   ├── auth.js        # JWT verification + role authorization
│   └── errorHandler.js # Global error handling
│
├── /utils             # Utility functions
│   ├── jwt.js         # Token operations
│   ├── response.js    # Response formatting
│   └── eventEmitter.js # Event emitter instance
│
├── /config            # Configuration
│   ├── db.js          # MongoDB connection
│   └── events.js      # Event listener setup
│
├── /seeds             # Database seeding
│   ├── seedData.js    # Seed data generator
│   └── runSeed.js     # Seed runner
│
├── app.js             # Express app setup
├── server.js          # Server entry point
├── package.json       # Dependencies
└── .env              # Environment variables
```

## 🔄 Request Flow

### Typical Request Lifecycle

```
1. HTTP Request arrives at server

2. Middleware Pipeline:
   - CORS middleware
   - JSON body parser
   - Continue to routes

3. Route Matching:
   - Find matching route
   - Apply route-specific middleware (auth, authorization)

4. Controller Layer:
   - Validate input
   - Call appropriate service method

5. Service Layer:
   - Execute business logic
   - Handle database operations
   - Emit events if needed

6. Model Layer:
   - Mongoose performs database operations
   - Returns data

7. Response:
   - Format response
   - Send back to client

8. Error Handling (if error):
   - Catch error
   - Error handler middleware
   - Format error response
   - Send back to client
```

### Example: Register User

```javascript
// 1. REQUEST: POST /api/auth/register
{
  "name": "John",
  "email": "john@example.com",
  "password": "pass123"
}

// 2. ROUTE: authRoutes.js
router.post('/register', authController.register);

// 3. CONTROLLER: authController.js
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  sendSuccess(res, 201, 'User registered', result);
};

// 4. SERVICE: authService.js
async register(userData) {
  let user = await User.create(userData);
  const token = generateToken(user._id);
  return { user, token };
}

// 5. MODEL: User.js
// Mongoose pre-save hook hashes password
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 6. RESPONSE: Sent back to client
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id": "...", "name": "John", ... },
    "token": "eyJhbGc..."
  }
}
```

## 🔐 Authentication Flow

### Registration & Login

```
User Input
    ↓
Validation (in controller)
    ↓
Check if user exists (in service)
    ↓
Hash password with bcrypt (in Model pre-save hook)
    ↓
Save to MongoDB
    ↓
Generate JWT token
    ↓
Return user + token
```

### Protected Routes

```
Request with Authorization header
    ↓
Extract token from header
    ↓
Verify token with JWT_SECRET
    ↓
Get user ID from decoded token
    ↓
Fetch user from database
    ↓
Assign req.user = user object
    ↓
Continue to route handler
```

### Role-Based Authorization

```
Check req.user.role
    ↓
If role matches allowed roles
    ↓
Continue to route handler
    ↓
Otherwise: 403 Forbidden error
```

## 📢 Notification System Architecture

### Event-Driven Notifications (No External Queue)

```
User Action (e.g., approve event)
    ↓
Service emits event
    ↓
EventEmitter triggers listeners (in config/events.js)
    ↓
Listener calls notificationService
    ↓
Notification created in database
    ↓
User fetches notification via API
```

### Notification Flow Example

```
1. Organizer calls approveEvent()
   ↓
2. eventService.approveEvent()
   ├─ Update event.status = 'APPROVED'
   └─ notificationEmitter.emit('eventApproved', event)
   ↓
3. EventListener (in config/events.js)
   └─ On 'eventApproved' → notificationService.sendEventApprovedNotification()
   ↓
4. notificationService creates Notification document
   ↓
5. User calls GET /api/notifications
   ↓
6. User receives notification in response
```

### Triggered Notifications

1. **Event Approved** - Sent to speaker
   - Type: APPROVAL
   - Trigger: Event status changed to APPROVED

2. **Event Rejected** - Sent to speaker
   - Type: REJECTION
   - Trigger: Event status changed to REJECTED

3. **Registration Confirmed** - Sent to user
   - Type: REGISTRATION
   - Trigger: User registers for event

## 💡 Recommendation Algorithm

### Simple Filtering Logic (No ML)

```
Get User Preferences (eventTypes, frequency)
    ↓
Query Events matching criteria:
├─ type in user.preferences.eventTypes
├─ status = APPROVED
├─ dateTime >= now (future events)
└─ user not already registered
    ↓
Sort by dateTime ascending
    ↓
Return top N results
```

### Recommendation Types

1. **Personalized** - Based on user preferences
2. **Upcoming** - All future approved events
3. **Similar** - Events of same type as viewed event
4. **Popular** - Events with most participants

## 🔄 Data Flow Diagrams

### Event Approval Workflow

```
┌─────────────────────┐
│  Organizer Portal   │
│  Click "Approve"    │
└──────────┬──────────┘
           │
           ↓
┌──────────────────────────────┐
│  PUT /api/events/:id/approve │
│  Authorization: Bearer token │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│  eventController.approveEvent │
│  - Validate input            │
│  - Check authorization       │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────┐
│  eventService.approveEvent
│  - Update event.status   │
│  - Emit event signal     │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│  Event Listener Triggered │
│  'eventApproved'         │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────────┐
│  notificationService         │
│  .sendEventApprovedNotification
│  - Create Notification       │
│  - Save to MongoDB           │
└──────────┬────────────────────┘
           │
           ↓
┌──────────────────────┐
│  Speaker's app       │
│  GET /notifications  │
│  Receives update     │
└──────────────────────┘
```

## 📊 Database Schema Relationships

### User Schema
```
User {
  _id: ObjectId
  name: String
  email: String (unique)
  password: String (hashed)
  role: Enum [ADMIN, ORGANIZER, SPEAKER, USER]
  preferences: {
    eventTypes: Array<String>
    notificationFrequency: Enum
  }
}
```

### Event Schema
```
Event {
  _id: ObjectId
  title: String
  description: String
  type: String
  dateTime: Date
  duration: Number
  location: String
  speakerId: ObjectId → User    (ref)
  organizerId: ObjectId → User  (ref)
  status: Enum [PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED]
  participants: Array<ObjectId → User> (ref)
}
```

### Notification Schema
```
Notification {
  _id: ObjectId
  userId: ObjectId → User       (ref)
  eventId: ObjectId → Event     (ref - optional)
  type: Enum [REMINDER, RECOMMENDATION, APPROVAL, REJECTION, REGISTRATION]
  title: String
  message: String
  isRead: Boolean
  metadata: Object (flexible)
}
```

### Relationships
```
           ┌─────────┐
           │  User   │
           │  _id    │
           └────┬────┘
                │
         ┌──────┴──────┐
         │             │
         ↓             ↓
    ┌────────┐   ┌──────────────┐
    │ Event  │   │Notification  │
    │_id     │   │_id           │
    └────────┘   └──────────────┘
       │  │              │
   Speaker Organizer    User
```

## ⚡ Performance Considerations

### Database Indexing
- Email (unique) - for fast user lookup
- userId, eventId - for notification queries
- status, type, dateTime - for event filtering

### Population Strategy
- Events auto-populate speaker/organizer on query
- Notifications auto-populate user/event on query
- Prevents N+1 query problems

### Async Operations
- All I/O operations are async/await
- No blocking operations
- Proper error handling throughout

## 🔒 Security Features

### Authentication
- JWT tokens with 7-day expiration
- Passwords hashed with bcryptjs (10 salt rounds)
- Token verification on protected routes

### Authorization
- Role-based access control middleware
- Resource ownership validation
- 403 Forbidden for unauthorized access

### Input Validation
- Schema-level validation in Mongoose
- Custom validation in controllers
- Clear error messages without exposing system details

### Error Handling
- Global error handler middleware
- No stack traces in production responses
- Detailed logging for debugging

## 🚀 Scalability Notes

### Horizontal Scaling
- Stateless design (JWT-based)
- Can run multiple server instances
- MongoDB handles concurrent connections
- Load balancer needed for traffic distribution

### Vertical Scaling
- Optimize database queries
- Add indexes for hot paths
- Cache frequently accessed data
- Consider Redis for sessions/cache

### Future Optimizations
- Add caching layer (Redis)
- Implement rate limiting
- Add API request queuing
- Use database connection pooling
- Implement pagination
- Add search indexing

## 🧪 Testing Strategy

### Unit Tests (Services)
- Test business logic in isolation
- Mock database calls
- Test error scenarios

### Integration Tests
- Test full request flow
- Use test database
- Verify database state changes

### API Tests
- Test all endpoints
- Verify response formats
- Check authorization

### Load Tests
- Verify performance under load
- Check error handling
- Monitor resource usage

## 📚 Code Quality

### Best Practices Implemented
✅ Async/await (no callbacks)
✅ Global error handling
✅ Standardized response format
✅ Environment variable configuration
✅ Proper logging
✅ Clean, readable code
✅ Well-commented code
✅ Separation of concerns
✅ DRY principle
✅ Security by default

---

## 🎯 Summary

This architecture provides:
- **Clarity** - Clear separation of concerns
- **Maintainability** - Easy to understand and modify
- **Scalability** - Can handle growth without major refactoring
- **Testability** - Services can be tested independently
- **Security** - Multi-layered security approach
- **Performance** - Optimized queries and async operations
- **Flexibility** - Services can be extracted to microservices later if needed

The monolithic approach is perfect for MVP/startup stage and can evolve as the project grows.
