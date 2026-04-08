const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

/**
 * Seed database with sample data
 */
const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Notification.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventhub.com',
      password: 'password123',
      role: 'ADMIN',
      preferences: {
        eventTypes: ['Tech', 'Business'],
        notificationFrequency: 'DAILY',
      },
    });

    // Create organizer users
    const organizer1 = await User.create({
      name: 'Alice Organizer',
      email: 'alice@eventhub.com',
      password: 'password123',
      role: 'ORGANIZER',
      preferences: {
        eventTypes: ['Tech', 'Educational'],
        notificationFrequency: 'DAILY',
      },
    });

    const organizer2 = await User.create({
      name: 'Bob Organizer',
      email: 'bob@eventhub.com',
      password: 'password123',
      role: 'ORGANIZER',
      preferences: {
        eventTypes: ['Fun', 'Sports'],
        notificationFrequency: 'WEEKLY',
      },
    });

    // Create speaker users
    const speaker1 = await User.create({
      name: 'John Speaker',
      email: 'john@eventhub.com',
      password: 'password123',
      role: 'SPEAKER',
      preferences: {
        eventTypes: ['Tech'],
        notificationFrequency: 'DAILY',
      },
    });

    const speaker2 = await User.create({
      name: 'Jane Speaker',
      email: 'jane@eventhub.com',
      password: 'password123',
      role: 'SPEAKER',
      preferences: {
        eventTypes: ['Business', 'Educational'],
        notificationFrequency: 'DAILY',
      },
    });

    // Create regular users
    const user1 = await User.create({
      name: 'Alex User',
      email: 'alex@eventhub.com',
      password: 'password123',
      role: 'USER',
      preferences: {
        eventTypes: ['Tech', 'Fun'],
        notificationFrequency: 'WEEKLY',
      },
    });

    const user2 = await User.create({
      name: 'Sara User',
      email: 'sara@eventhub.com',
      password: 'password123',
      role: 'USER',
      preferences: {
        eventTypes: ['Educational', 'Business'],
        notificationFrequency: 'DAILY',
      },
    });

    const user3 = await User.create({
      name: 'Mike User',
      email: 'mike@eventhub.com',
      password: 'password123',
      role: 'USER',
      preferences: {
        eventTypes: ['Sports', 'Fun'],
        notificationFrequency: 'NEVER',
      },
    });

    console.log('✓ Users created');

    // Create approved events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const event1 = await Event.create({
      title: 'Web Development Workshop',
      description: 'Learn the latest in web development technologies',
      type: 'Tech',
      dateTime: tomorrow,
      duration: 120,
      location: 'Convention Center, Room A',
      speakerId: speaker1._id,
      organizerId: organizer1._id,
      status: 'APPROVED',
      maxParticipants: 50,
      participants: [user1._id, user2._id],
    });

    const event2 = await Event.create({
      title: 'AI and Machine Learning Seminar',
      description: 'Advanced topics in AI/ML with live demonstrations',
      type: 'Tech',
      dateTime: nextWeek,
      duration: 180,
      location: 'Tech Hub, Main Hall',
      speakerId: speaker2._id,
      organizerId: organizer1._id,
      status: 'APPROVED',
      maxParticipants: 100,
      participants: [user1._id],
    });

    const event3 = await Event.create({
      title: 'Business Networking Dinner',
      description: 'Connect with industry leaders and entrepreneurs',
      type: 'Business',
      dateTime: nextWeek,
      duration: 120,
      location: 'Downtown Hotel, Ballroom',
      speakerId: speaker2._id,
      organizerId: organizer2._id,
      status: 'APPROVED',
      maxParticipants: 75,
      participants: [user2._id, user3._id],
    });

    const event4 = await Event.create({
      title: 'Fun Sports Day',
      description: 'Outdoor sports activities and team games',
      type: 'Sports',
      dateTime: nextMonth,
      duration: 240,
      location: 'Central Park, Field 1',
      speakerId: speaker1._id,
      organizerId: organizer2._id,
      status: 'APPROVED',
      maxParticipants: 200,
      participants: [user1._id, user2._id, user3._id],
    });

    const event5 = await Event.create({
      title: 'Educational Leadership Workshop',
      description: 'Develop leadership skills for the modern workplace',
      type: 'Educational',
      dateTime: nextMonth,
      duration: 90,
      location: 'Learning Center, Room B',
      speakerId: speaker2._id,
      organizerId: organizer1._id,
      status: 'APPROVED',
      maxParticipants: 40,
      participants: [user2._id],
    });

    // Create pending event
    const event6 = await Event.create({
      title: 'Virtual Reality Showcase',
      description: 'Explore the future of VR technology',
      type: 'Tech',
      dateTime: nextMonth,
      duration: 150,
      location: 'Innovation Lab',
      speakerId: speaker1._id,
      organizerId: organizer1._id,
      status: 'PENDING',
      maxParticipants: 60,
    });

    console.log('✓ Events created');

    // Create notifications
    await Notification.create({
      userId: speaker1._id,
      eventId: event1._id,
      type: 'APPROVAL',
      title: 'Event Approved',
      message: 'Your event "Web Development Workshop" has been approved!',
      isRead: false,
      metadata: {
        eventName: event1.title,
        eventDate: event1.dateTime,
      },
    });

    await Notification.create({
      userId: user1._id,
      eventId: event1._id,
      type: 'REGISTRATION',
      title: 'Registration Confirmed',
      message: 'You have successfully registered for "Web Development Workshop"',
      isRead: false,
      metadata: {
        eventName: event1.title,
        eventDate: event1.dateTime,
      },
    });

    await Notification.create({
      userId: user2._id,
      eventId: event3._id,
      type: 'RECOMMENDATION',
      title: 'Event Recommendation',
      message: 'You might like "Business Networking Dinner" based on your preferences',
      isRead: true,
      metadata: {
        eventName: event3.title,
        eventType: event3.type,
      },
    });

    console.log('✓ Notifications created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSample Credentials:');
    console.log('Admin: admin@eventhub.com / password123');
    console.log('Organizer: alice@eventhub.com / password123');
    console.log('Speaker: john@eventhub.com / password123');
    console.log('User: alex@eventhub.com / password123');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

module.exports = seedDatabase;
