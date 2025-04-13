import {
  BEGINNER_USER,
  INTERMEDIATE_USER,
  UBER_DUPER_USER,
} from "@/scripts/seed-emulator/constants";
import { logger } from "../../lib/logger";
import { clearExistingData } from "./data-cleaner";
import {
  createChallengeTemplates,
  createUserChallenges,
} from "./generators/generateChallenges";
import { updateLeaderboard } from "./generators/generateLeaderboard";
import { generateOpponentsForUser } from "./generators/generateOpponents";
import {
  createIntermediateUser,
  createTestUser,
  createUberDuperUser,
  signIn,
} from "./generators/generateUsers";

/**
 * Main seed function that populates the emulator database with test data
 */
async function seedEmulator() {
  logger.info("Starting emulator seeding process...");

  await clearExistingData();

  let duperUserId = "";
  try {
    try {
      duperUserId = await signIn(
        UBER_DUPER_USER.email,
        UBER_DUPER_USER.password
      );
      logger.info("Admin user already exists, signed in as admin");
    } catch {
      duperUserId = await createUberDuperUser();
      await signIn(UBER_DUPER_USER.email, UBER_DUPER_USER.password);
      logger.info("Created admin user and signed in");
    }
  } catch (error) {
    logger.error("Error signing in as admin:", error);
    throw new Error("Failed to sign in as admin, cannot proceed with seeding");
  }

  let beginnerUserId = "";
  try {
    try {
      beginnerUserId = await signIn(
        BEGINNER_USER.email,
        BEGINNER_USER.password
      );
      logger.info("Beginner user already exists, reusing it");
    } catch {
      beginnerUserId = await createTestUser();
    }
  } catch (error) {
    logger.error("Error with beginner user:", error);
    throw new Error("Failed to create or retrieve beginner user");
  }

  let intermediateUserId = "";
  try {
    try {
      intermediateUserId = await signIn(
        INTERMEDIATE_USER.email,
        INTERMEDIATE_USER.password
      );
      logger.info("Intermediate user already exists, reusing it");
    } catch {
      intermediateUserId = await createIntermediateUser();
    }
  } catch (error) {
    logger.error("Error with intermediate user:", error);
    throw new Error("Failed to create or retrieve intermediate user");
  }

  try {
    await signIn(UBER_DUPER_USER.email, UBER_DUPER_USER.password);
  } catch (error) {
    logger.error("Error signing back in as Uber user:", error);
    throw new Error("Failed to sign back in as Uber user");
  }

  const challengeTemplateIds = await createChallengeTemplates();
  const beginnerOpponentIds = await generateOpponentsForUser(beginnerUserId);
  const intermediateOpponentIds =
    await generateOpponentsForUser(intermediateUserId);
  const adminOpponentIds = await generateOpponentsForUser(duperUserId);

  try {
    await signIn(BEGINNER_USER.email, BEGINNER_USER.password);
  } catch (error) {
    logger.error("Error signing in as beginner user:", error);
    throw new Error("Failed to sign in as beginner user");
  }

  await createUserChallenges(beginnerUserId, challengeTemplateIds);
  await updateLeaderboard(beginnerUserId, beginnerOpponentIds);

  try {
    await signIn(INTERMEDIATE_USER.email, INTERMEDIATE_USER.password);
  } catch (error) {
    logger.error("Error signing in as intermediate user:", error);
    throw new Error("Failed to sign in as intermediate user");
  }

  await createUserChallenges(intermediateUserId, challengeTemplateIds);
  await updateLeaderboard(intermediateUserId, intermediateOpponentIds);

  try {
    await signIn(UBER_DUPER_USER.email, UBER_DUPER_USER.password);
  } catch (error) {
    logger.error("Error signing in as Uber user:", error);
    throw new Error("Failed to sign in as Uber user");
  }

  await createUserChallenges(duperUserId, challengeTemplateIds);
  await updateLeaderboard(duperUserId, adminOpponentIds);

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
  logger.info("\n📝 Beginner user credentials:");
  logger.info(`   Email: ${BEGINNER_USER.email}`);
  logger.info(`   Password: ${BEGINNER_USER.password}`);
  logger.info("\n📝 Intermediate user credentials:");
  logger.info(`   Email: ${INTERMEDIATE_USER.email}`);
  logger.info(`   Password: ${INTERMEDIATE_USER.password}`);
  logger.info("\n👑 Uber user credentials:");
  logger.info(`   Email: ${UBER_DUPER_USER.email}`);
  logger.info(`   Password: ${UBER_DUPER_USER.password}`);
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
