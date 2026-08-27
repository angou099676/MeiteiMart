import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";

// One-off maintenance script to promote an existing user (found by email or phone) to a
// different role — mainly useful to bootstrap the very first Admin/Super Admin account
// when you'd rather reuse an already-registered phone/email than the seeded placeholder.
//
// Usage: node src/seed/promote.js <email-or-phone> <ROLE_NAME>
// Example: node src/seed/promote.js 8546899676 SUPER_ADMIN

async function run() {
  const [, , identifier, roleName] = process.argv;
  if (!identifier || !roleName) {
    console.error("Usage: node src/seed/promote.js <email-or-phone> <ROLE_NAME>");
    process.exit(1);
  }

  await connectDB();

  const role = await Role.findOne({ name: roleName.toUpperCase() });
  if (!role) {
    console.error(`Role "${roleName}" not found. Run the seed script first.`);
    await disconnectDB();
    process.exit(1);
  }

  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
  if (!user) {
    console.error(`No user found with email/phone "${identifier}".`);
    await disconnectDB();
    process.exit(1);
  }

  user.role = role._id;
  user.isSuperAdmin = role.name === "SUPER_ADMIN";
  await user.save();

  console.log(`[promote] ${user.name} (${identifier}) is now ${role.name}`);
  await disconnectDB();
}

run().catch((err) => {
  console.error("[promote] Failed:", err);
  process.exit(1);
});
