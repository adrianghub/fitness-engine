#!/usr/bin/env node

/**
 * Firebase Emulator HTTP Seeding Script
 *
 * Seeds Firestore emulator data by calling the deployed HTTP Cloud Function endpoints.
 * The functions themselves check if data already exists.
 *
 * Requirements:
 * - Firebase emulators (specifically Functions and Firestore) must be running.
 *
 * Environment variables:
 * - ADMIN_SECRET_KEY: The secret key required by the seeding endpoints.
 * - VITE_FIREBASE_PROJECT_ID: Your Firebase project ID.
 * - FUNCTIONS_EMULATOR_HOST: Host for the functions emulator (default: 127.0.0.1).
 * - FUNCTIONS_EMULATOR_PORT: Port for the functions emulator (default: 5001).
 * - FUNCTIONS_REGION: Region where functions are deployed (default: europe-central2).
 * - LOG_LEVEL: Set to 'verbose', 'info', 'warn', or 'error' (default: 'info')
 */

import dotenv from 'dotenv';
dotenv.config();

// --- Configuration ---
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const FUNCTIONS_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1';
const FUNCTIONS_PORT = process.env.FUNCTIONS_EMULATOR_PORT || 5001;
const FUNCTIONS_REGION = process.env.FUNCTIONS_REGION || 'europe-central2';

// --- Logging Utility ---
const logger = {
  error: (...args) => console.error('❌ ERROR:', ...args),
  warn: (...args) => (LOG_LEVEL !== 'error') && console.warn('⚠️ WARN:', ...args),
  info: (...args) => (['info', 'verbose'].includes(LOG_LEVEL)) && console.log('ℹ️ INFO:', ...args),
  verbose: (...args) => (LOG_LEVEL === 'verbose') && console.log('🔎 VERBOSE:', ...args),
  success: (...args) => console.log('✅ SUCCESS:', ...args),
};

// --- Validation ---
if (!ADMIN_KEY) {
  logger.error('ADMIN_SECRET_KEY environment variable is not set.');
  logger.error('Please ensure it is available, e.g., via a .env file or export.');
  process.exit(1);
}
if (!PROJECT_ID) {
  logger.error('VITE_FIREBASE_PROJECT_ID environment variable is not set.');
  process.exit(1);
}

// --- Helper Function ---
/**
 * Calls a seeding endpoint.
 * @param {string} functionName The name of the function to call.
 * @param {string} description Human-readable description for logging.
 */
async function callSeedEndpoint(functionName, description) {
  const url = `http://${FUNCTIONS_HOST}:${FUNCTIONS_PORT}/${PROJECT_ID}/${FUNCTIONS_REGION}/${functionName}`;
  logger.info(`Attempting to trigger ${description} seeding via endpoint: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'x-admin-key': ADMIN_KEY,
        'Content-Type': 'application/json',
      },
    });

    const responseBody = await response.text(); // Read body even for errors

    if (response.ok) {
      // Log success, the function itself will log if it skipped or seeded.
      logger.success(`Successfully requested ${description} seeding.`);
      logger.verbose(`Response from ${functionName}: ${response.status} - ${responseBody}`);
      return true;
    } else {
      logger.error(`Failed to trigger ${description} seeding. Endpoint returned status ${response.status}.`);
      logger.error(`Response body: ${responseBody}`);
      if (response.status === 401) {
        logger.error('Got 401 Unauthorized. Is the ADMIN_SECRET_KEY correct?');
      }
      if (response.status === 404) {
           logger.error('Got 404 Not Found. Are emulators running? Is the Project ID, Region, and Function Name correct?');
      }
      return false;
    }
  } catch (error) {
    logger.error(`Network or other error occurred while calling ${functionName}:`, error.message);
    logger.error(`Check if Functions Emulator is running at http://${FUNCTIONS_HOST}:${FUNCTIONS_PORT}`);
    return false;
  }
}

// --- Main Execution ---
async function main() {
  logger.info('🌱 Starting Firebase Emulator HTTP Seeding Script...');
  logger.info('=================================================');
  logger.info(`Target Project ID: ${PROJECT_ID}`);
  logger.info(`Functions Host: ${FUNCTIONS_HOST}:${FUNCTIONS_PORT}`);
  logger.info(`Functions Region: ${FUNCTIONS_REGION}`);

  let success = true;

  // Call both endpoints. The functions handle idempotency.
  success &&= await callSeedEndpoint('seedChallengeTemplates', 'Challenge Templates');
  success &&= await callSeedEndpoint('seedUniversalChallenges', 'Universal Challenges');

  logger.info('=================================================');
  if (success) {
    logger.success('Seeding script trigger requests completed.');
    process.exit(0);
  } else {
    logger.error('Seeding script finished with errors triggering endpoints.');
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Fatal error during script execution:', error);
  process.exit(1);
});