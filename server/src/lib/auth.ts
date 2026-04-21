import { betterAuth } from 'better-auth';
// @ts-ignore - ESM-only type declarations, runtime resolves fine
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit');
client.connect();

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ['http://localhost:3000', 'http://localhost:3005'],
});
