import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];
const role = process.argv[3]; // admin, agent, traffic, driver (reset), all
const action = process.argv[4] || 'add'; // add or remove

if (!email || !role) {
  console.log('Usage: node scripts/set_user_role.js <email> <role> [add|remove]');
  console.log('Roles: admin, agent, traffic, driver (reset), all');
  console.log('Example: node scripts/set_user_role.js user@example.com admin add');
  process.exit(1);
}

const updateRole = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    const value = action === 'add';

    let updated = false;

    if (role === 'admin' || role === 'all') { user.isAdmin = value; updated = true; }
    if (role === 'agent' || role === 'all') { user.isAgent = value; updated = true; }
    if (role === 'traffic' || role === 'all') { user.isTraffic = value; updated = true; }
    
    if (role === 'driver') { // Reset all special perms
        user.isAdmin = false;
        user.isAgent = false;
        user.isTraffic = false;
        updated = true;
    }

    if (updated) {
        await user.save();
        console.log(`User ${user.email} updated successfully!`);
        console.log('Current Permissions:');
        console.log(`- isAdmin: ${user.isAdmin}`);
        console.log(`- isAgent: ${user.isAgent}`);
        console.log(`- isTraffic: ${user.isTraffic}`);
        console.log(`- Role (legacy): ${user.role}`);
    } else {
        console.log('No valid role specified or no changes made.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

updateRole();
