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

/** Sheet Client Helper Class. */
export class SheetsService {
  private static instance: SheetsService;
  private readonly spreadsheet_: GoogleAppsScript.Spreadsheet.Spreadsheet;
  constructor(spreadsheetId: string | undefined) {
    let spreadsheet;
    if (spreadsheetId) {
      try {
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      } catch (e) {
        console.error(e);
        throw new Error(
          `Unable to identify spreadsheet with provided ID: ${spreadsheetId}!`
        );
      }
    } else {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
    this.spreadsheet_ = spreadsheet;
  }
  getHeaders(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    return sheet
      .getRange(1, 1, 1, sheet.getMaxColumns())
      .getValues()[0]
      .filter(cell => cell !== '');
  }
  getTotalRows(sheetName: string): number {
    const sheet = this.spreadsheet_.getSheetByName(sheetName);
    if (!sheet) return -1;
    return sheet.getDataRange().getLastRow();
  }
  getTotalColumns(sheetName: string) {
    const sheet = this.spreadsheet_.getSheetByName(sheetName);
    if (!sheet) return;
    return sheet.getDataRange().getLastColumn();
  }
  getNonEmptyRows(sheetName: string) {
    const sheet = this.spreadsheet_.getSheetByName(sheetName);
    if (!sheet) return;
    return sheet
      .getDataRange()
      .getValues()
      .filter(row => row.join('').length > 0);
  }
  getRangeData(sheetName: string,
               startRow: number,
               startCol: number,
               numRows = 0,
               numCols = 0) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet || numRows + sheet.getLastRow() - startRow + 1 === 0) {
      return [[]];
    }
    return sheet
      .getRange(
        startRow,
        startCol,
        numRows || sheet.getLastRow() - startRow + 1,
        numCols || sheet.getLastColumn() - startCol + 1
      )
      .getValues();
  }
  setValuesInDefinedRange(
      sheetName: string,
      row: number,
      col: number,
      values: Array<Array<string | number | undefined | boolean>>
  ) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return;
    if (values[0]) {
      sheet
        .getRange(row, col, values.length, values[0].length)
        .setValues(values);
    }
  }
  appendRows(sheetName: string,
             values: Array<Array<string | number | undefined | boolean>>) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return;
    if (values[0]) {
      console.log(values[0]);
      sheet.appendRow(values);
    }
  }
  clearDefinedRange(sheetName: string,
                    row: number,
                    col: number,
                    numRows = 0,
                    numCols = 0) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return;
    sheet
      .getRange(
        row,
        col,
        numRows || sheet.getLastRow(),
        numCols || sheet.getLastColumn()
      )
      .clear();
  }
  getCellValue(sheetName: string,
               row: number,
               col: number) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return null;
    const cell = sheet.getRange(row, col);
    return cell.getValue();
  }
  setCellValue(row: number,
               col: number,
               val: string | number | undefined | boolean,
               sheetName?: string) {
    const sheet = sheetName
      ? this.getSpreadsheet().getSheetByName(sheetName)
      : this.getSpreadsheet().getActiveSheet();
    if (!sheet) return;
    sheet.getRange(row, col).setValue(val);
  }
  getSpreadsheet() {
    return this.spreadsheet_;
  }
  getSpreadsheetApp() {
    return SpreadsheetApp;
  }
  static getInstance(spreadsheetId?: string) {
    if (typeof SheetsService.instance === 'undefined'
        && typeof spreadsheetId === 'string') {
      SheetsService.instance = new SheetsService(spreadsheetId);
    }
    SheetsService.instance = new SheetsService(undefined);
    return SheetsService.instance;
  }
}
