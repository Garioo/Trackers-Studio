import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'mission' | 'heist' | 'race' | 'business' | 'other';
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  rewards: {
    money: number;
    rp: number;
    items: string[];
  };
  location?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  participants: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['mission', 'heist', 'race', 'business', 'other'],
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  rewards: {
    money: {
      type: Number,
      default: 0,
    },
    rp: {
      type: Number,
      default: 0,
    },
    items: [{
      type: String,
    }],
  },
  location: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very_hard'],
    default: 'medium',
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
activitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure the model is registered only once
const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema);

export default Activity; 