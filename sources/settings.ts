/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import {AppSettings} from './appSettings';
import * as logging from './logging';

const SETTINGS_FILE = 'settings.json';

/**
 * Loads the configuration settings for the application to use.
 * On first run, this generates any dynamic settings and merges them into the
 * settings result.
 * @returns the settings object for the application to use.
 */
export function loadAppSettings(): AppSettings {
  var settingsPath = path.join(__dirname, 'config', SETTINGS_FILE);

  if (!fs.existsSync(settingsPath)) {
    _logError('App settings file %s not found.', settingsPath);
    return null;
  }

  try {
    const settings =
        JSON.parse(fs.readFileSync(settingsPath, 'utf8') || '{}') as
        AppSettings;
    const settingsOverrides = process.env['DATALAB_SETTINGS_OVERRIDES'];
    if (settingsOverrides) {
      // Allow overriding individual settings via JSON provided as an environment variable.
      const overrides = JSON.parse(settingsOverrides);
      for (const key of Object.keys(overrides)) {
        (<any>settings)[key] = overrides[key];
      }
    }
    return settings;
  } catch (e) {
    _logError(e);
    return null;
  }
}

/**
 * Get the base directory for local content.
 */
export function getContentDir(): string {
  const appSettings = loadAppSettings();
  return path.join(appSettings.datalabRoot, appSettings.contentDir);
}

// Exported for testing
export function ensureDirExists(fullPath: string): boolean {
  if (path.dirname(fullPath) == fullPath) {
    // This should only happen once we hit the root directory
    return true;
  }
  if (fs.existsSync(fullPath)) {
    if (!fs.lstatSync(fullPath).isDirectory()) {
      _log('Path ' + fullPath + ' is not a directory');
      return false;
    }
    return true;
  }
  if (!ensureDirExists(path.dirname(fullPath))) {
    return false;
  }
  fs.mkdirSync(fullPath);
  return true;
}

/**
 * Logs a debug message if the logger has been initialized,
 * else logs to console.log.
 */
function _log(...args: Object[]) {
  const logger = logging.getLogger();
  if (logger) {
    const msg = util.format.apply(util.format, args);
    logger.debug(msg);
  } else {
    console.log.apply(console, args);
  }
}

/**
 * Logs an error message if the logger has been initialized,
 * else logs to console.error.
 */
function _logError(...args: Object[]) {
  const logger = logging.getLogger();
  if (logger) {
    const msg = util.format.apply(util.format, args);
    logger.error(msg);
  } else {
    console.error.apply(console, args);
  }
}
