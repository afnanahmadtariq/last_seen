import mongoose from 'mongoose'

// User Schema for Authentication
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: String,
  emailVerified: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', userSchema)
