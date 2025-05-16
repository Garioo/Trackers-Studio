import mongoose from 'mongoose';

const playlistRaceSchema = new mongoose.Schema({
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  stats: {
    bestTime: { type: String, default: '' },
    attempts: { type: Number, default: 0 },
    // Add more stats fields as needed
  }
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  races: {
    type: [playlistRaceSchema],
    default: []
  }
}, {
  timestamps: true,
  collection: 'playlists'
});

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);

export default Playlist; 