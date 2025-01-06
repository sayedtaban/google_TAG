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
import {
  fetchGlobalConfig,
  fetchMultiBatchInput,
  fetchExampleInput,
  fetchBlockingKeywords,
  fetchSACAInput} from './inputFetcher';
import {VertexHelper} from './vertexAiClient';

/** Imported in index.ts. */
export function validator() {
  return [testGemini, testInputFetcher, validateConfig];
}

function testGemini() {
  const globalConfig = fetchGlobalConfig();
  // console.log(global_config)
  const vertexClient = VertexHelper.getInstance(
      globalConfig.gcpProjectId,
      globalConfig.languageModelId,
      {
        temperature: globalConfig.temperature,
        maxOutputTokens: globalConfig.maxOutputTokens,
        topK: globalConfig.topK,
        topP: globalConfig.topP
      },
      CONFIG.safetySettings,
      globalConfig.fineTunedModelId);
  const test = vertexClient.predict('Hello', globalConfig.isFineTuned);
  console.log(test);
}

function testInputFetcher() {
  const globalConfig = fetchGlobalConfig();
  console.log(globalConfig);
  const multiBatchInput = fetchMultiBatchInput();
  console.log(multiBatchInput);
  const exampleInput = fetchExampleInput();
  console.log(exampleInput);
  const sacaInput = fetchSACAInput();
  console.log(sacaInput);
  const blockingKeywords = fetchBlockingKeywords();
  console.log(blockingKeywords);
}
function validateConfig() {
  let globalConfig;
  try {
    globalConfig = fetchGlobalConfig();
  } catch (e: unknown) {
    console.error(e);
    SpreadsheetApp.getUi().alert(`Error: ${e}`);
    return;
  }

  // console.log(global_config)
  const vertexClient = VertexHelper.getInstance(
      globalConfig.gcpProjectId,
      globalConfig.languageModelId,
      {
        temperature: globalConfig.temperature,
        maxOutputTokens: globalConfig.maxOutputTokens,
        topK: globalConfig.topK,
        topP: globalConfig.topP,
      },
      CONFIG.safetySettings,
      globalConfig.fineTunedModelId
  );

  if (globalConfig.isFineTuned && !globalConfig.fineTunedModelId) {
    SpreadsheetApp.getUi().alert(
        "Error: Missing 'Fine tuned model ID' while checking 'Using Fine tuned model'");
    return;
  }


  try {
    const test = vertexClient.predict('Hello', globalConfig.isFineTuned);
    if (test.length > 0) {
      console.log('Vertex AI test passed');
    } else {
      throw new Error('Invalid response of Vertex AI.');
    }
  } catch (e: unknown) {
    console.error(e);
    SpreadsheetApp.getUi().alert(`Error: ${e}`);
    return;
  }

  if (globalConfig.prompt.includes('{industry_default}')) {
    if (!globalConfig.industry)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Industry'");
      return;
    }
  }

  if (globalConfig.prompt.includes('{business_name_default}')) {
    if (!globalConfig.businessName)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Business Name'");
      return;
    }
  }

  if (globalConfig.prompt.includes('{business_description_default}')) {
    if (!globalConfig.businessDescription)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Business Description'");
      return;
    }
  }

  if (globalConfig.prompt.includes('{target_audience_default}')) {
    if (!globalConfig.targetAudience)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Target Audience'");
      return;
    }
  }

  if (globalConfig.prompt.includes('{other_information_default}')) {
    if (!globalConfig.otherInformation)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Other Information'");
      return;
    }
  }

  if (globalConfig.prompt.includes('{language_default}')) {
    if (!globalConfig.language)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Language'");
      return;
    }
  }

  if (globalConfig.prompt.includes('{tone_default}')) {
    if (!globalConfig.tone)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Tone'");
      return;
    }
  }

  if (!globalConfig.enableMultiBatchInput && globalConfig.autoInsertion) {
    SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
    return;
  }

  if (!globalConfig.enableMultiBatchInput && !globalConfig.autoInsertion && (globalConfig.requiredInputColumns.length > 0)) {
    SpreadsheetApp.getUi().alert("Error: Your chosen template need Multi-Batch Mode enabled.");
    return;
  }

  if (globalConfig.autoInsertion) {
    if (!globalConfig.prompt.includes('{multi_batch_input_default}')) {
      SpreadsheetApp.getUi().alert(
          `Error: Missing '{multi_batch_input_default}' in the template ${globalConfig.templateName} while checking 'Multi-Batch Input Variables Auto Insertion'`);
      return;
    }
  } else {
    let sampleRow;
    try {
      console.log(globalConfig.requiredInputColumns.length);
      console.log(globalConfig.requiredInputColumns);
      if (globalConfig.requiredInputColumns.length > 0) {
        const inputArray = fetchMultiBatchInput();
        if (!inputArray) {
          SpreadsheetApp.getUi().alert("Error: Missing valid rows in 'Multi-Batch Input' Sheet");
          return;
        }
        if (inputArray.length === 0) {
          SpreadsheetApp.getUi().alert("Error: Missing valid rows in 'Multi-Batch Input' Sheet");
          return;
        }
        sampleRow = inputArray[0];
        for (let i = 0; i < globalConfig.requiredInputColumns.length; i++) {
          const key: string = globalConfig.requiredInputColumns[i];
          if (!(key in sampleRow)) {
            SpreadsheetApp.getUi().alert(`Error: Missing Column ${key} in 'Multi-Batch Input' Sheet`);
            return;
          }
        }
      }
    } catch (e: unknown) {
      console.error(e);
      SpreadsheetApp.getUi().alert(`Error: ${e}`);
      return;
    }
  }

  if (!globalConfig.enableExampleInput) {
    SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
    return;
  }

  if (!globalConfig.enableSACAInput) {
    SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
    return;
  }

  SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
}
