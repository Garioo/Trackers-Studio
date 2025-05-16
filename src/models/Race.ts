import mongoose from 'mongoose';

const raceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Race name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Race type is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    required: [true, 'Race difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
  },
  bestTime: {
    type: String,
    trim: true,
  },
  // GTA job data fields
  title: {
    type: String,
    trim: true,
  },
  creator: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 100,
  },
  players: {
    min: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: 16,
    },
  },
  gameMode: {
    type: String,
    trim: true,
  },
  routeType: {
    type: String,
    trim: true,
  },
  routeLength: {
    type: Number,
  },
  url: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'races'
});

console.log('Creating Race model with collection name:', raceSchema.get('collection'));

export default mongoose.models.Race || mongoose.model('Race', raceSchema); 