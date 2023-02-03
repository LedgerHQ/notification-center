import mongoose from 'mongoose';

// Define the schema for the user collection
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  channels: {
    telegrams: [String],
    emails: [String],
    ifttts: [String],
  },
});

// Create the model
export const Users = mongoose.model('User', userSchema);
