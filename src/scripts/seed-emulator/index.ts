import { logger } from "../../lib/logger";
import { ADMIN_USER, TEST_USER, TEST_USER_2 } from "./constants";
import { clearExistingData } from "./data-cleaner";
import {
  createChallengeTemplates,
  createUserChallenges,
} from "./generators/generateChallenges";
import { updateLeaderboard } from "./generators/generateLeaderboard";
import { generateOpponentsForUser } from "./generators/generateOpponents";
import {
  createAdminUser,
  createTestUser,
  createTestUser2,
  signInAsUser,
} from "./generators/generateUsers";

/**
 * Main seed function that populates the emulator database with test data
 */
async function seedEmulator() {
  logger.info("Starting emulator seeding process...");

  await clearExistingData();

  // Create and sign in as admin user
  let adminUserId = "";
  try {
    try {
      adminUserId = await signInAsUser(ADMIN_USER.email, ADMIN_USER.password);
      logger.info("Admin user already exists, signed in as admin");
    } catch {
      adminUserId = await createAdminUser();
      await signInAsUser(ADMIN_USER.email, ADMIN_USER.password);
      logger.info("Created admin user and signed in");
    }
  } catch (error) {
    logger.error("Error signing in as admin:", error);
    throw new Error("Failed to sign in as admin, cannot proceed with seeding");
  }

  // Create and sign in as test user
  let testUserId = "";
  try {
    try {
      testUserId = await signInAsUser(TEST_USER.email, TEST_USER.password);
      logger.info("Test user already exists, reusing it");
    } catch {
      testUserId = await createTestUser();
    }
  } catch (error) {
    logger.error("Error with test user:", error);
    throw new Error("Failed to create or retrieve test user");
  }

  // Create and sign in as second test user
  let testUser2Id = "";
  try {
    try {
      testUser2Id = await signInAsUser(TEST_USER_2.email, TEST_USER_2.password);
      logger.info("Test user 2 already exists, reusing it");
    } catch {
      testUser2Id = await createTestUser2();
    }
  } catch (error) {
    logger.error("Error with test user 2:", error);
    throw new Error("Failed to create or retrieve test user 2");
  }

  // Sign back in as admin
  try {
    await signInAsUser(ADMIN_USER.email, ADMIN_USER.password);
  } catch (error) {
    logger.error("Error signing back in as admin:", error);
    throw new Error("Failed to sign back in as admin");
  }

  // Create challenge templates
  const challengeTemplateIds = await createChallengeTemplates();

  // Generate opponents for each user
  const testUserOpponentIds = await generateOpponentsForUser(testUserId);
  const testUser2OpponentIds = await generateOpponentsForUser(testUser2Id);
  const adminOpponentIds = await generateOpponentsForUser(adminUserId);

  // Create challenges for test user 1
  try {
    await signInAsUser(TEST_USER.email, TEST_USER.password);
  } catch (error) {
    logger.error("Error signing in as test user:", error);
    throw new Error("Failed to sign in as test user");
  }

  await createUserChallenges(testUserId, challengeTemplateIds);
  await updateLeaderboard(testUserId, testUserOpponentIds);

  // Create challenges for test user 2
  try {
    await signInAsUser(TEST_USER_2.email, TEST_USER_2.password);
  } catch (error) {
    logger.error("Error signing in as test user 2:", error);
    throw new Error("Failed to sign in as test user 2");
  }

  await createUserChallenges(testUser2Id, challengeTemplateIds);
  await updateLeaderboard(testUser2Id, testUser2OpponentIds);

  // Create challenges for admin
  try {
    await signInAsUser(ADMIN_USER.email, ADMIN_USER.password);
  } catch (error) {
    logger.error("Error signing in as admin:", error);
    throw new Error("Failed to sign in as admin");
  }

  await createUserChallenges(adminUserId, challengeTemplateIds);
  await updateLeaderboard(adminUserId, adminOpponentIds);

  logger.info("Emulator seeding completed successfully!");
  printCredentials();
}

/**
 * Print credentials for all test users
 */
function printCredentials(): void {
  logger.info("\n======================================================");
  logger.info("🎉 FitnessEngine emulator seed script completed successfully!");
  logger.info("======================================================");
  logger.info("\n📝 Test user credentials:");
  logger.info(`   Email: ${TEST_USER.email}`);
  logger.info(`   Password: ${TEST_USER.password}`);
  logger.info("\n📝 Test user 2 credentials:");
  logger.info(`   Email: ${TEST_USER_2.email}`);
  logger.info(`   Password: ${TEST_USER_2.password}`);
  logger.info("\n👑 Admin user credentials:");
  logger.info(`   Email: ${ADMIN_USER.email}`);
  logger.info(`   Password: ${ADMIN_USER.password}`);
  logger.info("\n▶️ To start the emulators and app:");
  logger.info("   npm run dev:all");
  logger.info("\n🔑 Login with the credentials above");
  logger.info("======================================================");
}

// Run the seed function
seedEmulator()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Error in emulator seed script:", error);
    process.exit(1);
  });
