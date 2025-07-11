import mongoose from 'mongoose'

// Website Profile Schema
const websiteProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  favicon: String,
  category: String,
  tags: [String],
  firstSeen: {
    type: Date,
    default: Date.now,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    language: String,
    charset: String,
    robots: String,
    viewport: String,
  },
}, {
  timestamps: true,
})

// Check History Schema
const checkHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteProfile',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    required: true,
  },
  statusCode: Number,
  responseTime: Number,
  lastModified: Date,  sslInfo: {
    valid: Boolean,
    expiry: Date,
    daysRemaining: Number,
  },
  error: String,
  checkTime: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Performance Metrics Schema
const performanceMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteProfile',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  uptime: {
    percentage: Number,
    totalChecks: Number,
    successfulChecks: Number,
  },
  avgResponseTime: Number,
  minResponseTime: Number,
  maxResponseTime: Number,
  totalDowntime: Number, // in minutes
  incidents: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    reason: String,
  }],
}, {
  timestamps: true,
})

// Website Analytics Schema
const websiteAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteProfile',
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  totalChecks: {
    type: Number,
    default: 0,
  },
  overallUptime: {
    type: Number,
    default: 100,
  },
  avgResponseTime: {
    type: Number,
    default: 0,
  },
  lastStatus: {
    type: String,
    enum: ['online', 'offline'],
  },
  consecutiveDowntime: {
    type: Number,
    default: 0,
  },
  longestDowntime: {
    type: Number,
    default: 0,
  },
  sslStatus: {
    valid: Boolean,
    expiry: Date,
    daysRemaining: Number,
  },
  lastIncident: {
    date: Date,
    duration: Number,
    reason: String,
  },
}, {
  timestamps: true,
})

// Create indexes for better performance
// Note: url index per user for uniqueness
websiteProfileSchema.index({ userId: 1, url: 1 }, { unique: true })
websiteProfileSchema.index({ userId: 1, domain: 1 })
websiteProfileSchema.index({ userId: 1, lastChecked: 1 })
websiteProfileSchema.index({ userId: 1, isActive: 1 })

checkHistorySchema.index({ userId: 1, websiteId: 1, checkTime: -1 })
checkHistorySchema.index({ userId: 1, url: 1, checkTime: -1 })
checkHistorySchema.index({ userId: 1, checkTime: -1 })

performanceMetricsSchema.index({ userId: 1, websiteId: 1, period: 1, date: -1 })
performanceMetricsSchema.index({ userId: 1, date: -1 })

websiteAnalyticsSchema.index({ userId: 1, websiteId: 1 }, { unique: true })
// Note: url index per user for uniqueness
websiteAnalyticsSchema.index({ userId: 1, url: 1 }, { unique: true })

// Export models
export const WebsiteProfile = mongoose.models.WebsiteProfile || mongoose.model('WebsiteProfile', websiteProfileSchema)
export const CheckHistory = mongoose.models.CheckHistory || mongoose.model('CheckHistory', checkHistorySchema)
export const PerformanceMetrics = mongoose.models.PerformanceMetrics || mongoose.model('PerformanceMetrics', performanceMetricsSchema)
export const WebsiteAnalytics = mongoose.models.WebsiteAnalytics || mongoose.model('WebsiteAnalytics', websiteAnalyticsSchema)
