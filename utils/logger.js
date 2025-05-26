/**
 * Simple logger utility for the application
 * Provides consistent logging format and levels
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Current log level (can be set via environment variable)
const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

// Check if the given log level should be logged based on current log level
const shouldLog = (level) => {
  const levels = Object.values(LOG_LEVELS);
  const currentIndex = levels.indexOf(currentLogLevel);
  const levelIndex = levels.indexOf(level);
  
  return levelIndex <= currentIndex;
};

// Format the log message with timestamp, level, and message
const formatLog = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

// Log methods for different levels
const error = (message) => {
  if (shouldLog(LOG_LEVELS.ERROR)) {
    console.error(formatLog(LOG_LEVELS.ERROR, message));
  }
};

const warn = (message) => {
  if (shouldLog(LOG_LEVELS.WARN)) {
    console.warn(formatLog(LOG_LEVELS.WARN, message));
  }
};

const info = (message) => {
  if (shouldLog(LOG_LEVELS.INFO)) {
    console.info(formatLog(LOG_LEVELS.INFO, message));
  }
};

const debug = (message) => {
  if (shouldLog(LOG_LEVELS.DEBUG)) {
    console.debug(formatLog(LOG_LEVELS.DEBUG, message));
  }
};

// Export the logger methods
const logger = {
  error,
  warn,
  info,
  debug
};

export default logger;
