import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../modules/users/user.model.js";

// Manually drops and recreates the email/phone indexes as unique+sparse, bypassing
// Mongoose's syncIndexes() diffing (which can get confused comparing existing options
// and previously errored with "existing index has the same name as the requested index").
async function run() {
  await connectDB();
  const collection = User.collection;

  // Explicit `null` values (as opposed to a genuinely missing field) are NOT excluded by a
  // sparse index, so clean those up first or the unique index rebuild will fail/re-break.
  const emailCleanup = await collection.updateMany({ email: null }, { $unset: { email: "" } });
  const phoneCleanup = await collection.updateMany({ phone: null }, { $unset: { phone: "" } });
  console.log(`[fix-indexes] cleaned up ${emailCleanup.modifiedCount} email:null and ${phoneCleanup.modifiedCount} phone:null docs`);

  const existing = await collection.indexes();
  for (const name of ["email_1", "phone_1"]) {
    if (existing.some((idx) => idx.name === name)) {
      await collection.dropIndex(name);
      console.log(`[fix-indexes] dropped ${name}`);
    }
  }

  await collection.createIndex({ email: 1 }, { unique: true, sparse: true, name: "email_1" });
  await collection.createIndex({ phone: 1 }, { unique: true, sparse: true, name: "phone_1" });
  console.log("[fix-indexes] recreated email_1 and phone_1 as unique+sparse");

  await disconnectDB();
}

run().catch((err) => {
  console.error("[fix-indexes] Failed:", err);
  process.exit(1);
});
