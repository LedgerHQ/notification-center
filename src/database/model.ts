import mongoose from 'mongoose';

// Define the schema for the user collection
const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    channels: {
      telegram: [String],
      ifttt: [String],
    },
  },
  {
    strict: true,
    strictQuery: true, // Turn off strict mode for query filters
  }
);

// Create the model
export const Users = mongoose.model('User', userSchema);
