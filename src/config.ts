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

/** System Configuration. */
export const CONFIG = {
  userSettings: {
    llmConfig: {
      gcpProjectId: {
        row: 4,
        col: 3
      },
      languageModelId: {
        row: 5,
        col: 3
      },
      isFineTuned: {
        row: 5,
        col: 5
      },
      fineTunedModelId: {
        row: 5,
        col: 7
      },
      templateId: {
        row: 6,
        col: 3
      },
      temperature: {
        row: 7,
        col: 3
      },
      topK: {
        row: 7,
        col: 5
      },
      topP: {
        row: 7,
        col: 7
      },
      maxOutputTokens: {
        row: 7,
        col: 9
      },
    },
    businessData: {
      industry: {
        row: 11,
        col: 3
      },
      businessName: {
        row: 12,
        col: 3
      },
      businessDesc: {
        row: 13,
        col: 3
      },
      targetAudience: {
        row: 14,
        col: 3
      },
      otherInformation: {
        row: 15,
        col: 3
      },
    },
    instruction: {
      language: {
        row: 19,
        col: 3
      },
      tone: {
        row: 20,
        col: 3
      },
      headlineVariants: {
        row: 21,
        col: 3
      },
      descriptionVariants: {
        row: 22,
        col: 3
      },
    },
    advancedOptions: {
      enableMultiBatchInput: {
        row: 26,
        col: 2
      },
      multiBatchStartRowNumber: {
        row: 26,
        col: 6
      },
      enableExampleInput: {
        row: 31,
        col: 2
      },
      enableSACAInput: {
        row: 36,
        col: 2
      }
    },
  },
  vertexAi: {
    endpoint: 'aiplatform.googleapis.com',
    location: 'us-central1',
    maxRetries: 3,
    quotaLimitDelay: 30 * 1000,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_ONLY_HIGH'
    }
  ],
  sheetName: {
    config: 'Config',
    blockingKeywords: 'Blocking Keywords',
    templates: 'Templates',
    multiBatchInput: 'Multi-Batch Input',
    exampleInput: 'Example Input',
    sacaInput: 'SACA Input',
    output: 'Output',
    log: 'LOG',
  }
};

/** Text Ads Length Configuration For Different Languages. */
export const TEXT_LENGTH_CONFIG:{[k: string]: {[k: string]: number}} = {
  'Traditional Chinese': {
    headline: 15,
    description: 45
  },
  'Japanese': {
    headline: 15,
    description: 45
  },
  'Korean': {
    headline: 15,
    description: 45
  },
  'English': {
    headline: 30,
    description: 90
  },
  'Spanish': {
    headline: 30,
    description: 90
  },
  'French': {
    headline: 30,
    description: 90
  },
  'German': {
    headline: 30,
    description: 90
  },
  'Vietnamese': {
    headline: 30,
    description: 90
  },
  'Indonesian': {
    headline: 30,
    description: 90
  },
  'Thai': {
    headline: 30,
    description: 90
  },
  'Portuguese': {
    headline: 30,
    description: 90
  }
};

/** Characters to be removed in LLM Output. */
export const CHARACTERS_TO_BE_REMOVED = [
  'JSON',
  'json',
  '`'
];
