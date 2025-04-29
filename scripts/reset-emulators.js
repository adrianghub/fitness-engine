#!/usr/bin/env node

/**
 * This script provides a reliable way to reset Firebase emulators
 * by stopping and restarting them with a clean state.
 */

import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Configuration options
const CONFIG = {
  // Time to wait after killing processes before starting new ones (ms)
  shutdownDelay: 3000,
  // Time to wait for emulators to start (ms)
  startupDelay: 10000,
  // Firebase emulator ports
  ports: ['9099', '8080', '5001', '4000', '4001', '4400', '4401', '4500', '4501', '5000', '5002', '9150'],
  // Be verbose in output
  verbose: process.env.VERBOSE === 'true'
};

// Logging utility
const logger = {
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.log(...args),
  verbose: (...args) => CONFIG.verbose && console.log('VERBOSE:', ...args),
  success: (...args) => console.log('✅', ...args),
};

/**
 * Find and kill all Firebase emulator processes
 */
function killEmulators() {
  return new Promise((resolve) => {
    logger.info('Stopping any running Firebase emulators...');

    // Kill processes differently based on platform
    if (process.platform === 'win32') {
      // Windows
      exec('taskkill /f /im java.exe /fi "WINDOWTITLE eq Firebase Emulator*"', () => {
        // Try to kill any Node.js processes related to Firebase emulators
        exec('taskkill /f /im node.exe /fi "WINDOWTITLE eq *firebase*"', () => {
          resolve();
        });
      });
    } else {
      // macOS/Linux - use multiple patterns to catch all emulator processes
      const killCommands = [
        'pkill -f "firebase.emulators" || true',
        'pkill -f "firebase emulators" || true',
        'pkill -f "firestore-debug" || true',
        'pkill -f "pubsub-debug" || true',
        'pkill -f "java.*emulator" || true'
      ];

      exec(killCommands.join('; '), () => {
        logger.verbose('Executed kill commands for emulator processes');
        resolve();
      });
    }
  });
}

/**
 * Kill any processes using emulator ports
 */
function clearPorts() {
  return new Promise((resolve) => {
    logger.info('Clearing any processes using emulator ports...');

    // Clear each port based on platform
    if (process.platform === 'win32') {
      // Windows - using for-each since we need to wait for completion
      const killPortsSequentially = async () => {
        for (const port of CONFIG.ports) {
          await new Promise(portResolve => {
            exec(`for /f "tokens=5" %a in ('netstat -ano ^| find "LISTENING" ^| find ":${port}"') do taskkill /f /pid %a`, () => {
              portResolve();
            });
          });
        }
        resolve();
      };

      killPortsSequentially();
    } else {
      // macOS/Linux - can do this more simply
      const portKillCommands = CONFIG.ports.map(port =>
        `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`
      );

      // Execute all port kill commands and add a verification step
      exec(portKillCommands.join('; '), () => {
        logger.verbose('Executed port kill commands');

        // Verify ports are clear with an extra check
        setTimeout(() => {
          const verifyCommands = CONFIG.ports.map(port =>
            `lsof -ti:${port} 2>/dev/null || echo "Port ${port} is clear"`
          );

          exec(verifyCommands.join('; '), (error, stdout) => {
            if (error) {
              logger.warn('Error verifying ports:', error.message);
            }

            logger.verbose('Port verification results:', stdout);
            resolve();
          });
        }, 500); // Short delay for verification
      });
    }
  });
}

/**
 * Clean up firebase data directory to start fresh
 */
function cleanFirebaseData() {
  const firebaseDataDir = path.join(rootDir, 'firebase-data');

  if (fs.existsSync(firebaseDataDir)) {
    logger.info('Removing firebase-data directory for clean restart...');
    try {
      fs.rmSync(firebaseDataDir, { recursive: true, force: true });
      logger.success('Removed firebase-data directory');
    } catch (error) {
      logger.warn(`Unable to remove firebase-data directory: ${error.message}`);
    }
  }
}

/**
 * Start Firebase emulators with a fresh state
 */
function startEmulators() {
  return new Promise((resolve) => {
    logger.info(`Starting Firebase emulators with clean state (please wait ${CONFIG.startupDelay/1000}s)...`);

    // Choose a different emulator configuration depending on environment
    const emulatorArgs = ['emulators:start'];

    // Start only auth, firestore, functions by default
    emulatorArgs.push('--only', 'auth,firestore,functions');

    const emulatorProcess = spawn('firebase', emulatorArgs, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      detached: true
    });

    // Wait a reasonable time for emulators to start
    setTimeout(() => {
      logger.success('Firebase emulators should now be running');
      resolve();
    }, CONFIG.startupDelay);

    // Unref the child process so our script can exit
    emulatorProcess.unref();
  });
}

/**
 * Main function to reset emulators
 */
async function main() {
  try {
    logger.info('🔥 Firebase Emulator Reset');
    logger.info('=========================');

    // Kill any running emulator processes
    await killEmulators();

    // Wait for processes to fully terminate
    logger.info(`Waiting ${CONFIG.shutdownDelay/1000}s for processes to terminate...`);
    await new Promise(resolve => setTimeout(resolve, CONFIG.shutdownDelay));

    // Clear any processes using emulator ports
    await clearPorts();

    // Clean up firebase data directory
    cleanFirebaseData();

    // Start emulators fresh
    await startEmulators();

    logger.success('Emulator reset process completed successfully');

    // Exit with success
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting emulators:', error);
    process.exit(1);
  }
}

// Run the script
main();