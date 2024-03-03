/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CONFIG } from './config';

/** Logger Class. */
export class MultiLogger {
  private static instance: MultiLogger;
  private readonly sheet: GoogleAppsScript.Spreadsheet.Sheet | null;
  private constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
        CONFIG.sheetName.log);
  }
  clear() {
    this.sheet?.clear();
    SpreadsheetApp.flush();
  }
  log(...messages: Array<string | number | object>) {
    const msg = messages
        .map(m => (typeof m === 'object' ? JSON.stringify(m) : m))
        .join(' ');
    Logger.log(msg);
    this.sheet?.appendRow([JSON.stringify(msg)]);
    SpreadsheetApp.flush();
  }
  static getInstance() {
    if (typeof MultiLogger.instance === 'undefined') {
      MultiLogger.instance = new MultiLogger();
    }
    return MultiLogger.instance;
  }
}