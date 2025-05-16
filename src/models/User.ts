import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stats: {
    totalPlaylists: {
      type: Number,
      default: 0
    },
    totalRaces: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/users/${this._id}`;
});

// Method to update user stats
userSchema.methods.updateStats = async function() {
  const Playlist = mongoose.model('Playlist');
  const playlists = await Playlist.find({ user: this._id });
  
  this.stats.totalPlaylists = playlists.length;
  this.stats.totalRaces = playlists.reduce((acc, playlist) => acc + playlist.races.length, 0);
  
  const allScores = playlists.flatMap(playlist => 
    playlist.races.map(race => race.score || 0)
  );
  
  this.stats.averageScore = allScores.length > 0 
    ? allScores.reduce((acc, score) => acc + score, 0) / allScores.length 
    : 0;
    
  await this.save();
};

// Create and export the model
export default mongoose.models.User || mongoose.model('User', userSchema); 