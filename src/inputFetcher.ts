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

import { SheetsService } from './sheetClient';
import { CONFIG, TEXT_LENGTH_CONFIG } from './config';
import { checkBlockedSuffix } from './util';

/** Global Configuration Interface. */
export interface GlobalConfig {
  gcpProjectId: string;
  languageModelId: string;
  fineTunedModelId: string;
  isFineTuned: boolean;
  templateName: string;
  prompt: string;
  autoInsertion: boolean;
  requiredInputColumns: string[];
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  industry: string;
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  otherInformation: string;
  language: string;
  tone: string;
  headlineVariants: number;
  headlineLength: number;
  descriptionVariants: number;
  descriptionLength: number;
  enableMultiBatchInput: boolean;
  multiBatchStartRowNumber: number;
  enableExampleInput: boolean;
  enableSACAInput: boolean;
}

/** Get All Configuration. */
export function fetchGlobalConfig() {
  const gcpProjectId = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.gcpProjectId.row,
      CONFIG.userSettings.llmConfig.gcpProjectId.col);
  const languageModelId = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.languageModelId.row,
      CONFIG.userSettings.llmConfig.languageModelId.col);
  const templateName = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.templateId.row,
      CONFIG.userSettings.llmConfig.templateId.col);
  const template = fetchTemplate(templateName);
  if (!template) {
    throw new Error('Unable to acquire prompt template.');
  }
  const prompt = template[1];
  const autoInsertion = Boolean(template[2]);
  const requiredInputColumns = template[3].split(/\s*[,，]\s*/);
  const isFineTuned = Boolean(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.isFineTuned.row,
      CONFIG.userSettings.llmConfig.isFineTuned.col));
  const fineTunedModelId = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.fineTunedModelId.row,
      CONFIG.userSettings.llmConfig.fineTunedModelId.col);
  const temperature = Number(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.temperature.row,
      CONFIG.userSettings.llmConfig.temperature.col));
  const topK = Number(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.topK.row,
      CONFIG.userSettings.llmConfig.topK.col));
  const topP = Number(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.topP.row,
      CONFIG.userSettings.llmConfig.topP.col));
  const maxOutputTokens = Number(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.llmConfig.maxOutputTokens.row,
      CONFIG.userSettings.llmConfig.maxOutputTokens.col));
  const industry = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.businessData.industry.row,
      CONFIG.userSettings.businessData.industry.col);
  const businessName = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.businessData.businessName.row,
      CONFIG.userSettings.businessData.businessName.col);
  const businessDescription = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.businessData.businessDesc.row,
      CONFIG.userSettings.businessData.businessDesc.col);
  let targetAudience = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.businessData.targetAudience.row,
      CONFIG.userSettings.businessData.targetAudience.col);
  if (!targetAudience) {
    targetAudience = 'Not Specific';
  }
  let otherInformation = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.businessData.otherInformation.row,
      CONFIG.userSettings.businessData.otherInformation.col);
  if (!otherInformation) {
    otherInformation = 'Not Specific';
  }
  const language = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.instruction.language.row,
      CONFIG.userSettings.instruction.language.col);
  const tone = SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.instruction.tone.row,
      CONFIG.userSettings.instruction.tone.col);
  const headlineVariants = Number(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.instruction.headlineVariants.row,
      CONFIG.userSettings.instruction.headlineVariants.col));
  const descriptionVariants = Number(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.instruction.descriptionVariants.row,
      CONFIG.userSettings.instruction.descriptionVariants.col));
  const enableMultiBatchInput = Boolean(
      SheetsService.getInstance().getCellValue(
          CONFIG.sheetName.config,
          CONFIG.userSettings.advancedOptions.enableMultiBatchInput.row,
          CONFIG.userSettings.advancedOptions.enableMultiBatchInput.col));
  let multiBatchStartRowNumber = Number(
      SheetsService.getInstance().getCellValue(
          CONFIG.sheetName.config,
          CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.row,
          CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.col));
  if (!multiBatchStartRowNumber || multiBatchStartRowNumber < 2) {
    multiBatchStartRowNumber = 2;
  }
  const enableExampleInput = Boolean(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.advancedOptions.enableExampleInput.row,
      CONFIG.userSettings.advancedOptions.enableExampleInput.col));
  const enableSACAInput = Boolean(SheetsService.getInstance().getCellValue(
      CONFIG.sheetName.config,
      CONFIG.userSettings.advancedOptions.enableSACAInput.row,
      CONFIG.userSettings.advancedOptions.enableSACAInput.col));

  return {
    gcpProjectId,
    languageModelId,
    isFineTuned,
    fineTunedModelId,
    templateName,
    prompt,
    autoInsertion,
    requiredInputColumns,
    temperature,
    topK,
    topP,
    maxOutputTokens,
    industry,
    businessName,
    businessDescription,
    targetAudience,
    otherInformation,
    language,
    tone,
    headlineVariants,
    headlineLength: TEXT_LENGTH_CONFIG[language].headline,
    descriptionVariants,
    descriptionLength: TEXT_LENGTH_CONFIG[language].description,
    enableMultiBatchInput,
    multiBatchStartRowNumber,
    enableExampleInput,
    enableSACAInput
  };
}

/** Get Multi Batch Input Rows. */
export function fetchMultiBatchInput() {
  return fetchSheetWithHeaders(CONFIG.sheetName.multiBatchInput);
}

/** Get Example Input. */
export function fetchExampleInput() {
  return fetchSheetWithHeaders(CONFIG.sheetName.exampleInput);
}

/** Get SACA Input. */
export function fetchSACAInput() {
  return fetchSheetWithHeaders(CONFIG.sheetName.sacaInput);
}

/** Get Output Rows. */
export function fetchOutput() {
  return fetchSheetWithHeaders(CONFIG.sheetName.output);
}

/** Get Sheet Content. */
export function fetchSheetWithHeaders(sheetName: string) {
  const inputRows = SheetsService.getInstance().getNonEmptyRows(sheetName);
  if (!inputRows) return [];
  const inputArr = [];
  for (let i = 1; i < inputRows.length; i++) {
    const inputRow:{[k: string]: string} = {};
    for (let j = 0; j < inputRows[0].length; j++) {
      inputRow[inputRows[0][j]] = inputRows[i][j];
    }
    inputArr.push(inputRow);
  }
  return inputArr;
}

/** Get Blocking Keywords Content. */
export function fetchBlockingKeywords() {
  const inputRows = SheetsService.getInstance().getNonEmptyRows(
      CONFIG.sheetName.blockingKeywords);
  if (!inputRows) return [];
  const inputArr = [];
  for (let i = 0; i < inputRows.length; i++) {
    inputArr.push(inputRows[i][0].toLowerCase());
  }
  return inputArr;
}

/** Get SACA Blocking Keywords Content. */
export function fetchSACABlockingKeywords(enableSACAInput: boolean) {
  if (!enableSACAInput) {
    return [];
  }
  const sacaInputArray = fetchSACAInput();

  const sacaReservedKeywords = ['_person', '_mood'];

  const headlineDrop = new Array();
  const descriptionDrop = new Array();
  if (!sacaInputArray) return headlineDrop;

  for (const sacaRow of sacaInputArray) {
    if (!sacaRow['ad_part'] || !sacaRow['action'] || !sacaRow['word']) {
      continue;
    }

    if (sacaRow['ad_part'] === 'headline' && sacaRow['action'] === 'drop') {
      if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
        headlineDrop.push(sacaRow['word']);
      }
    } else if (sacaRow['ad_part'] === 'description' && sacaRow['action'] === 'drop') {
      if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
        descriptionDrop.push(sacaRow['word']);
      }
    }
  }
  return headlineDrop.concat(descriptionDrop);
}

/** Get Template. */
export function fetchTemplate(templateName: string) {
  const rows = SheetsService.getInstance().getNonEmptyRows(
      CONFIG.sheetName.templates);
  if (!rows) return;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === templateName) {
      return rows[i];
    }
  }
  throw new Error(`Cannot find template: ${templateName}`);
}
