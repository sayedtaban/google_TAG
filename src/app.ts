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

import {CHARACTERS_TO_BE_REMOVED, CONFIG} from './config';
import { MultiLogger } from './logger';
import { SheetsService } from './sheetClient';
import { VertexHelper } from './vertexAiClient';
import {
  GlobalConfig,
  fetchGlobalConfig,
  fetchBlockingKeywords,
  fetchOutput,
  fetchSACABlockingKeywords,
  fetchMultiBatchInput} from './inputFetcher';
import {getExamplePart, getOutputRestrictionPart, getSACAPart} from './promptFormatter';
import {
  checkBlockingKeywords,
  removeLastNonLetterCharacter,
  compareFn,
  checkKeywordInsertion,
  getKeywordInsertionHeadlineLength} from './util';

/** Imported in index.ts. */
export function app() {
  return [generateRow, clearRow];
}

function generateRow() {
  MultiLogger.getInstance().log('Start processing');
  try {
    generateRowWorker();
  } catch(e: unknown) {
    MultiLogger.getInstance().log(`${e}`);
    SpreadsheetApp.getUi().alert(`Error: ${e}`);
  }
  MultiLogger.getInstance().log('End processing');
}

function generateRowWorker() {
  const globalConfig = fetchGlobalConfig();
  console.log(globalConfig);
  const headlineNum = globalConfig.headlineVariants;
  const descriptionNum = globalConfig.descriptionVariants;
  const previousOutput = fetchOutput();
  const previousGeneratedAds:{[k: number]: {[k:string]: string[]}} = {};
  const startRowNum = globalConfig.multiBatchStartRowNumber;
  const blockingKeywords = fetchBlockingKeywords();
  const sacaBlockingKeywords = fetchSACABlockingKeywords(globalConfig.enableSACAInput);
  const maxRerunCount = 10;
  let batchCount:number;
  let multiBatchInputArray: Array<{[k: string]: string}>;
  if (globalConfig.enableMultiBatchInput) {
    multiBatchInputArray = fetchMultiBatchInput();
    batchCount = multiBatchInputArray.length;
    for (let i = startRowNum-2; i < batchCount; i++) {
      const tmpOutput = {'headline': [], 'description':[]};
      previousGeneratedAds[i] = tmpOutput;
    }
    for (const row of previousOutput) {
      const tmpRowNum = Number(row['Multi-Batch Input Row Number'])-2;
      if (previousGeneratedAds[tmpRowNum]) {
        previousGeneratedAds[tmpRowNum][row['Text Type']].push(row['Generated Text']);
      }
    }

  } else {
    multiBatchInputArray = [{}];
    batchCount = 1;
    previousGeneratedAds[0] = {'headline': [], 'description':[]};
  }

  console.log(previousGeneratedAds);

  if (startRowNum-2 >= batchCount) {
    SpreadsheetApp.getUi().alert(
        "No new rows has been processed. Please check\n"
        + "1. Check if there are non-empty rows in 'Multi-Batch Input' Sheet.\n"
        + "2. Check if the 'Start From Row Number' in 'Config' Sheet is larger than the maximum Multi-Batch row number.");
    return;
  }

  let multiBatchInput;
  let tmpHeadlineNum;
  let tmpDescriptionNum;
  let res;
  let dictItem;
  let resList;
  let sortedTextHeadline;
  let sortedTextDescription;
  for (let i = startRowNum - 2; i < batchCount; i++) {
    multiBatchInput = multiBatchInputArray[i];
    const textHeadline = new Array();
    const textDescription = new Array();
    tmpHeadlineNum = Math.max(0, headlineNum - previousGeneratedAds[i]['headline'].length);
    tmpDescriptionNum = Math.max(0, descriptionNum - previousGeneratedAds[i]['description'].length);
    console.log(tmpHeadlineNum, tmpDescriptionNum);
    let count = 0;
    while ((count < maxRerunCount) && ((textHeadline.length < tmpHeadlineNum) || (textDescription.length < tmpDescriptionNum))) {
      count++;
      try {
        res = callVertexAPI(globalConfig, multiBatchInput);
      } catch (e: unknown) {
        MultiLogger.getInstance().log(`${e}`);
        continue;
      }
      for (const value of CHARACTERS_TO_BE_REMOVED) {
        res = res.replaceAll(value, '');
      }
      //Remove emoji characters
      res = res.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
      const resSet = new Set<string>();
      try {
        dictItem = JSON.parse(res);
        for (let j = 0; j < dictItem.length; j++) {
          if (dictItem[j]['headline']) {
            resSet.add(dictItem[j]['headline']);
          }

          if (dictItem[j]['description']) {
            resSet.add(dictItem[j]['description']);
          }
        }
      } catch (e: unknown) {
        MultiLogger.getInstance().log(`${e}`);
        MultiLogger.getInstance().log(`Error Source: ${res}`);
      }

      resList = Array.from(resSet).filter(checkBlockingKeywords(blockingKeywords));

      if (globalConfig.enableSACAInput) {
        resList = resList.filter(checkBlockingKeywords(sacaBlockingKeywords));
      }

      resList = resList.map(removeLastNonLetterCharacter);

      for (const value of resList) {
        // console.log(value)
        if (!value) continue;
        if ((value.length > globalConfig.headlineLength) &&
            (value.length <= globalConfig.descriptionLength) &&
            !textDescription.includes(value) &&
            !previousGeneratedAds[i]['description'].includes(value) &&
            !checkKeywordInsertion(value)) {
          textDescription.push(value);
        } else if (
            ((value.length <= globalConfig.headlineLength) ||
                ((getKeywordInsertionHeadlineLength(value) <= globalConfig.headlineLength) &&
                    checkKeywordInsertion(value))
            ) &&
            (value.length >= 4) &&
            !textHeadline.includes(value) &&
            !previousGeneratedAds[i]['headline'].includes(value)) {
          textHeadline.push(value);
        } else {
          continue;
        }
      }
    }
    sortedTextHeadline = textHeadline.sort(compareFn).reverse();
    sortedTextDescription = textDescription.sort(compareFn).reverse();
    console.log(textHeadline);
    console.log(textDescription);
    const inputSummary = [];
    for (const [_, value] of Object.entries(multiBatchInput)) {
      inputSummary.push(value);
    }
    for (let a = 0; a < Math.min(tmpHeadlineNum, sortedTextHeadline.length); a++) {
      const outputValue = [sortedTextHeadline[a], 'headline', i + 2, ...inputSummary];
      SheetsService.getInstance().appendRows(
          'Output',
          outputValue
      );
    }

    for (let a = 0; a < Math.min(tmpDescriptionNum, sortedTextDescription.length); a++) {
      const outputValue = [sortedTextDescription[a], 'description', i + 2, ...inputSummary];
      SheetsService.getInstance().appendRows(
          'Output',
          outputValue
      );
    }

    if (globalConfig.enableMultiBatchInput) {
      SheetsService.getInstance().setCellValue(CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.row,
          CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.col,
          i + 3,
          'Config');
    }
  }
}

function generateFinalPrompt(globalConfig: GlobalConfig,
                             multiBatchInput: {[k: string]: string}) {
  let prompt =
      globalConfig.prompt.replace('{industry_default}', globalConfig.industry)
          .replace('{business_name_default}', globalConfig.businessName)
          .replace('{business_description_default}', globalConfig.businessDescription)
          .replace('{target_audience_default}', globalConfig.targetAudience)
          .replace('{other_information_default}', globalConfig.otherInformation)
          .replace('{language_default}', globalConfig.language)
          .replace('{tone_default}', globalConfig.tone)
          .replace('{headline_variants_default}', globalConfig.headlineVariants.toString())
          .replace('{description_variants_default}', globalConfig.descriptionVariants.toString())
          .replace('{headline_length_default}', globalConfig.headlineLength.toString())
          .replace('{description_length_default}', globalConfig.descriptionLength.toString());

  let keyFormatted;
  if (globalConfig.enableMultiBatchInput) {
    if (globalConfig.autoInsertion) {
      let multiBatchInputString = '';
      for (const [key, value] of Object.entries(multiBatchInput)) {
        if (value) {
          keyFormatted = key.replace('_', ' ');
          multiBatchInputString = multiBatchInputString + `${keyFormatted}: ${value}.\n`;
        }
      }
      prompt = prompt.replace(`{multi_batch_input_default}`, multiBatchInputString);
    } else {
      for (const [key, value] of Object.entries(multiBatchInput)) {
        prompt = prompt.replace(`{${key}}`, value);
      }
    }
  } else {
    prompt = prompt.replace(`{multi_batch_input_default}`, '');
  }

  prompt = prompt + getSACAPart(globalConfig.enableSACAInput);
  prompt = prompt + getExamplePart(globalConfig.enableExampleInput);
  prompt = prompt + getOutputRestrictionPart();
  return prompt;
}

function callVertexAPI(globalConfig: GlobalConfig,
                       multiBatchInput: {[k: string]: string}) {
  const prompt = generateFinalPrompt(globalConfig, multiBatchInput);
  const res = VertexHelper.getInstance(
      globalConfig.gcpProjectId,
      globalConfig.languageModelId,
      {
          temperature: globalConfig.temperature,
          maxOutputTokens: globalConfig.maxOutputTokens,
          topK: globalConfig.topK,
          topP: globalConfig.topP
  }).predict(prompt, globalConfig.isFineTuned);
  console.log(res);
  return res;
}

function clearRow() {
  const result = SpreadsheetApp.getUi().alert(
      "You are clearing all output rows. Do you want to continue?",
      SpreadsheetApp.getUi().ButtonSet.YES_NO);
  if (result.toString() === 'NO') {
    console.log('user cancelled');
    return;
  } else if (result.toString() === 'YES') {
    console.log('user continued');
    const rowNum = SheetsService.getInstance().getTotalRows('Output');
    const colNum = SheetsService.getInstance().getTotalColumns('Output');
    SheetsService.getInstance().clearDefinedRange(
        'Output',
        2,
        1,
        rowNum-1,
        colNum);
    SheetsService.getInstance().setCellValue(
        CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.row,
        CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.col,
        0,
        'Config');
  }
}
