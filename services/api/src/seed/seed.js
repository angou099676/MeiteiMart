import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { ROLES, DEFAULT_ROLE_PERMISSIONS, ROLE_PORTALS, DEFAULT_CATEGORIES } from "@meiteimart/shared";
import { Role } from "../modules/roles/role.model.js";
import { User } from "../modules/users/user.model.js";
import { Category } from "../modules/categories/category.model.js";
import { env } from "../config/env.js";

async function seedRoles() {
  const roles = {};
  for (const roleName of Object.values(ROLES)) {
    const role = await Role.findOneAndUpdate(
      { name: roleName },
      {
        name: roleName,
        permissions: DEFAULT_ROLE_PERMISSIONS[roleName],
        portals: ROLE_PORTALS[roleName],
        isSystem: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    roles[roleName] = role;
    console.log(`[seed] Role ready: ${roleName} (${role.permissions.length} permissions)`);
  }
  return roles;
}

async function seedSuperAdmin(roles) {
  if (!env.superAdmin.email && !env.superAdmin.phone) {
    console.log("[seed] Skipping Super Admin — set SUPER_ADMIN_EMAIL or SUPER_ADMIN_PHONE in .env");
    return;
  }
  const existing = await User.findOne({
    $or: [{ email: env.superAdmin.email }, { phone: env.superAdmin.phone }],
  });
  if (existing) {
    console.log("[seed] Super Admin already exists, skipping");
    return;
  }
  await User.create({
    name: env.superAdmin.name,
    email: env.superAdmin.email || undefined,
    phone: env.superAdmin.phone || undefined,
    role: roles[ROLES.SUPER_ADMIN]._id,
    isSuperAdmin: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  });
  console.log(`[seed] Super Admin created: ${env.superAdmin.email || env.superAdmin.phone}`);
}

async function seedCategories() {
  for (const cat of DEFAULT_CATEGORIES) {
    const parent = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { name: cat.name, slug: cat.slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    for (const sub of cat.subcategories) {
      const subSlug = `${cat.slug}-${sub.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      await Category.findOneAndUpdate(
        { slug: subSlug },
        { name: sub, slug: subSlug, parent: parent._id },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }
  console.log(`[seed] Seeded ${DEFAULT_CATEGORIES.length} top-level categories with subcategories`);
}

async function run() {
  await connectDB();
  const roles = await seedRoles();
  await seedSuperAdmin(roles);
  await seedCategories();
  await disconnectDB();
  console.log("[seed] Done.");
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
