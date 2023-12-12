const CONFIG = {
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
};

const TEXT_LENGTH_CONFIG = {
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
  }
}

const CHARACTERS_TO_BE_REMOVED = [
  'JSON',
  'json',
  '`'
]
