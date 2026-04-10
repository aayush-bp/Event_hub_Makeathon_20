const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['ADMIN', 'ORGANIZER', 'SPEAKER', 'USER'],
      default: 'USER',
    },
    dcLocation: {
      type: String,
      required: [true, 'Please provide DC location'],
      trim: true,
    },
    preferences: {
      eventTypes: [String], // ["Tech", "Fun", etc]
      notificationFrequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'NEVER'],
        default: 'DAILY',
      },
      popupMode: {
        type: String,
        enum: ['on-return', 'scheduled', 'both', 'never'],
        default: 'on-return',
      },
      popupTimes: {
        type: [String], // e.g. ["09:00", "14:00"]
        default: ['09:00'],
      },
      awayThresholdMinutes: {
        type: Number,
        default: 60,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user data without password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
