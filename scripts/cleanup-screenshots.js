#!/usr/bin/env node

/**
 * Screenshot Cleanup Script
 *
 * This script cleans up old screenshot files and directories generated during tests.
 *
 * Environment variables:
 * - LOG_LEVEL: Set to 'verbose', 'info', 'warn', or 'error' (default: 'info')
 * - KEEP_SCREENSHOTS: Number of recent screenshot directories/files to keep (default: 5)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const KEEP_SCREENSHOTS = parseInt(process.env.KEEP_SCREENSHOTS || '5', 10);

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Locations where screenshots might be stored
const SCREENSHOT_PATHS = [
  'e2e/screenshots',       // Custom screenshot directory
  'test-results',          // Playwright test results with screenshots
  'playwright-report',     // Playwright HTML report screenshots
  '.',                     // Root directory (for direct screenshots),
];

// Logging utility that respects LOG_LEVEL
const logger = {
  error: (...args) => console.error(...args),
  warn: (...args) => (LOG_LEVEL !== 'error') && console.warn(...args),
  info: (...args) => (['info', 'verbose'].includes(LOG_LEVEL)) && console.log(...args),
  verbose: (...args) => (LOG_LEVEL === 'verbose') && console.log(...args),
  success: (...args) => console.log('✅', ...args),
};

/**
 * Clean up screenshot files
 * @param {number} keepCount - Number of most recent screenshot directories to keep
 * @returns {number} - Number of deleted files
 */
function cleanupScreenshots(keepCount = KEEP_SCREENSHOTS) {
  logger.info(`🧹 Cleaning up screenshots (keeping ${keepCount} most recent directories/files)...`);
  let totalDeleted = 0;

  for (const screenshotPath of SCREENSHOT_PATHS) {
    const fullPath = path.join(rootDir, screenshotPath);

    // Skip if path doesn't exist
    if (!fs.existsSync(fullPath)) {
      logger.verbose(`Path does not exist: ${fullPath}`);
      continue;
    }

    // Check if it's a directory
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      logger.verbose(`Not a directory: ${fullPath}`);
      continue;
    }

    logger.info(`Processing screenshot directory/path: ${screenshotPath}`);

    try {
      // First, clean up loose screenshot files in the root directory
      if (screenshotPath === '.') {
        const files = fs.readdirSync(fullPath);
        const screenshotFiles = files.filter(file =>
          /\.(png|jpg|jpeg|webp|gif)$/i.test(file) &&
          fs.statSync(path.join(fullPath, file)).isFile()
        );

        // Keep only a few of the most recent screenshot files
        if (screenshotFiles.length > keepCount) {
          // Sort by modification time (newest first)
          const sortedFiles = screenshotFiles
            .map(file => ({
              name: file,
              mtime: fs.statSync(path.join(fullPath, file)).mtime.getTime()
            }))
            .sort((a, b) => b.mtime - a.mtime);

          // Delete older files beyond the keep count
          const filesToDelete = sortedFiles.slice(keepCount).map(f => f.name);
          for (const file of filesToDelete) {
            const filePath = path.join(fullPath, file);
            try {
              fs.unlinkSync(filePath);
              logger.verbose(`Deleted screenshot: ${file}`);
              totalDeleted++;
            } catch (err) {
              logger.warn(`Failed to delete ${file}: ${err.message}`);
            }
          }

          logger.info(`Deleted ${filesToDelete.length} old screenshots from root directory`);
        } else {
          logger.info(`Only ${screenshotFiles.length} screenshots in root, keeping all (threshold: ${keepCount})`);
        }
      } else if (screenshotPath === 'e2e/screenshots') {
        // For e2e/screenshots directory, handle category subdirectories (auth, debug, etc.)
        const categoryDirs = fs.readdirSync(fullPath)
          .filter(item => fs.statSync(path.join(fullPath, item)).isDirectory());

        logger.info(`Found ${categoryDirs.length} category directories: ${categoryDirs.join(', ')}`);

        for (const categoryDir of categoryDirs) {
          const categoryPath = path.join(fullPath, categoryDir);

          // Get all screenshot files in this category
          const files = fs.readdirSync(categoryPath)
            .filter(file => /\.(png|jpg|jpeg|webp|gif)$/i.test(file))
            .map(file => ({
              name: file,
              path: path.join(categoryPath, file),
              mtime: fs.statSync(path.join(categoryPath, file)).mtime.getTime()
            }))
            .sort((a, b) => b.mtime - a.mtime); // Sort by modification time (newest first)

          logger.info(`Category ${categoryDir}: ${files.length} screenshots found`);

          // Keep only the most recent N files in each category
          if (files.length > keepCount) {
            const filesToDelete = files.slice(keepCount);

            for (const file of filesToDelete) {
              try {
                fs.unlinkSync(file.path);
                logger.verbose(`Deleted screenshot: ${categoryDir}/${file.name}`);
                totalDeleted++;
              } catch (err) {
                logger.warn(`Failed to delete ${categoryDir}/${file.name}: ${err.message}`);
              }
            }

            logger.info(`Deleted ${filesToDelete.length} old screenshots from ${categoryDir} category`);
          } else {
            logger.info(`Only ${files.length} screenshots in ${categoryDir}, keeping all (threshold: ${keepCount})`);
          }
        }
      } else {
        // For dedicated screenshot directories, handle subdirectories
        const directories = fs.readdirSync(fullPath)
          .filter(item => fs.statSync(path.join(fullPath, item)).isDirectory())
          .map(dir => ({
            name: dir,
            path: path.join(fullPath, dir),
            mtime: fs.statSync(path.join(fullPath, dir)).mtime.getTime()
          }))
          .sort((a, b) => b.mtime - a.mtime);  // Sort by modification time (newest first)

        // Keep only the most recent N directories
        if (directories.length > keepCount) {
          const dirsToDelete = directories.slice(keepCount);

          for (const dir of dirsToDelete) {
            try {
              // Count files to be deleted for reporting
              const fileCount = countFilesRecursive(dir.path);

              // Delete the directory and all its contents
              fs.rmSync(dir.path, { recursive: true, force: true });
              logger.verbose(`Deleted screenshot directory: ${dir.name} (${fileCount} files)`);
              totalDeleted += fileCount;
            } catch (err) {
              logger.warn(`Failed to delete directory ${dir.name}: ${err.message}`);
            }
          }

          logger.info(`Deleted ${dirsToDelete.length} old screenshot directories from ${screenshotPath}`);
        } else {
          logger.info(`Only ${directories.length} screenshot directories in ${screenshotPath}, keeping all (threshold: ${keepCount})`);
        }
      }
    } catch (error) {
      logger.error(`Error processing screenshots in ${screenshotPath}: ${error.message}`);
    }
  }

  logger.success(`Screenshot cleanup complete. Deleted ${totalDeleted} files total.`);
  return totalDeleted;
}

/**
 * Helper to count files in a directory recursively
 * @param {string} dirPath - Directory path
 * @returns {number} - Number of files
 */
function countFilesRecursive(dirPath) {
  let count = 0;
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isFile()) {
      count++;
    } else if (stats.isDirectory()) {
      count += countFilesRecursive(itemPath);
    }
  }

  return count;
}

/**
 * Main function to run the cleanup process
 * @returns {Promise<boolean>} - Success status
 */
async function main() {
  logger.info('🖼️ Screenshot Cleanup Script');
  logger.info('=========================');
  logger.info(`Log Level: ${LOG_LEVEL}`);
  logger.info(`Keep Screenshot Count: ${KEEP_SCREENSHOTS}`);
  logger.info('=========================');

  try {
    const args = process.argv.slice(2);
    let success = true;

    // Determine keep count from args or default
    const keepCountArg = args.find(arg => arg.startsWith('--keep=') || arg.startsWith('-k='));
    const keepCount = keepCountArg
      ? parseInt(keepCountArg.split('=')[1], 10)
      : KEEP_SCREENSHOTS;

    if (isNaN(keepCount) || keepCount < 0) {
        logger.error(`Invalid keep count: ${keepCountArg}. Must be a non-negative integer.`);
        return false;
    }

    // Run screenshot cleanup
    const deleted = cleanupScreenshots(keepCount);
    logger.info(`Cleaned up ${deleted} screenshot files/directories`);

    if (success) {
      logger.success('Cleanup completed successfully');
      return true;
    } else {
      // This part might not be reachable anymore unless cleanupScreenshots itself sets success=false
      logger.warn('Cleanup completed with some issues');
      return false;
    }
  } catch (error) {
    logger.error('Cleanup failed with an unexpected error:', error);
    return false;
  }
}

// Run the script and exit with appropriate code
main()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });