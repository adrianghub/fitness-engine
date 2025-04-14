import {
  BEGINNER_USER,
  INTERMEDIATE_USER,
  UBER_DUPER_USER,
} from "@/scripts/seed-emulator/constants";
import { logger } from "../../lib/logger";
import { clearExistingData } from "./clearData";
import {
  createBeginnerUser,
  createIntermediateUser,
  createUberDuperUser,
} from "./generateUsers";

/**
 * Main seed function that populates the emulator database with test data
 */
async function seedEmulator() {
  logger.info("Starting emulator seeding process...");

  await clearExistingData();

  try {
    await createUberDuperUser();
  } catch (error) {
    logger.error("Error with Uber user:", error);
    throw new Error("Failed to create Uber user");
  }

  try {
    await createBeginnerUser();
  } catch (error) {
    logger.error("Error with beginner user:", error);
    throw new Error("Failed to create beginner user");
  }

  try {
    await createIntermediateUser();
  } catch (error) {
    logger.error("Error with intermediate user:", error);
    throw new Error("Failed to create intermediate user");
  }

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
