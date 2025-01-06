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
import { MultiLogger } from './logger';

/** Vertex AI Model Params Definition. */
export interface VertexAiModelParams {
  temperature: number;
  maxOutputTokens: number;
  topK: number;
  topP: number;
}

/** Vertex AI Palm Prediction Response Definition. */
export interface VertexAiPalmPrediction {
  content: string;
  safetyAttributes: {
    blocked: boolean;
  };
}

/** Vertex AI Palm Response Definition. */
export interface VertexAiPalmResponse {
  error?: {
    code: number;
    message: string;
  };
  predictions?: VertexAiPalmPrediction[] | null;
}

/** Vertex AI Gemini Response Definition. */
export interface VertexAiGeminiResponseCandidate {
  candidates?: [
    {
      content: {
        parts: [{ text: string }];
      };
      finishReason?: string;
    }
  ];
  error?: {
    code: number;
    message: string;
  };
}

/** Vertex Client Helper Class. */
export class VertexHelper {
  private static instance: VertexHelper;
  private readonly projectId: string;
  private readonly modelId: string;
  private readonly fineTuneModelId: string | undefined;
  private readonly modelParams: VertexAiModelParams;
  private readonly safetySettings: Array<{[k: string]: string}>;

  constructor(projectId: string,
              modelId: string,
              modelParams: VertexAiModelParams,
              safetySettings: Array<{[k: string]: string}>,
              fineTuneModelId?: string | undefined) {
    this.projectId = projectId;
    this.modelId = modelId;
    this.modelParams = modelParams;
    this.fineTuneModelId = fineTuneModelId;
    this.safetySettings = safetySettings;
  }

  private addAuthPost(params: unknown) {
    const baseParams = {
      method: 'POST',
      muteHttpExceptions: true,
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
      },
    };
    return Object.assign({ payload: JSON.stringify(params) }, baseParams);
  }

  private postRequestPalm(
      url:string,
      params: Record<string, unknown>
  ): VertexAiPalmResponse {
    const response = UrlFetchApp.fetch(url, params);
    if (response.getResponseCode() === 429) {
      MultiLogger.getInstance().log(
        `Waiting ${
          Number(CONFIG.vertexAi.quotaLimitDelay) / 1000
        }s as API quota limit has been reached...`
      );
      Utilities.sleep(CONFIG.vertexAi.quotaLimitDelay);
      return this.postRequestPalm(url, params);
    }
    return JSON.parse(response.getContentText());
  }

  private postRequestGemini(
      url:string,
      params: Record<string, unknown>
  ): VertexAiGeminiResponseCandidate[] {
    const response = UrlFetchApp.fetch(url, params);
    if (response.getResponseCode() === 429) {
      MultiLogger.getInstance().log(
          `Waiting ${
              Number(CONFIG.vertexAi.quotaLimitDelay) / 1000
          }s as API quota limit has been reached...`
      );
      Utilities.sleep(CONFIG.vertexAi.quotaLimitDelay);
      return this.postRequestGemini(url, params);
    }
    return JSON.parse(response.getContentText());
  }

  predict(prompt: string, isFineTuned: boolean) {
    MultiLogger.getInstance().log(`Prompt: ${prompt}`);
    if (this.modelId.includes('gemini')) {
      return this.predictWithGemini(prompt);
    }

    let predictEndpoint = undefined;
    if (isFineTuned) {
      predictEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/endpoints/${this.fineTuneModelId}:predict`;
    } else {
      predictEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/publishers/google/models/${this.modelId}:predict`;
    }
    const payload = this.addAuthPost({
      instances: [{ content: prompt }],
      parameters: this.modelParams,
    });
    const res = this.postRequestPalm(predictEndpoint, payload);
    MultiLogger.getInstance().log(`Response: ${JSON.stringify(res)}`);
    if (res.error && res.error.code >= 400) {
      throw new Error(res.error.message);
    }
    if (res.predictions) {
      if (res.predictions[0].safetyAttributes.blocked) {
        throw new Error(
          `Request was blocked as it triggered API safety filters. Prompt: ${prompt}`
        );
      } else if (!res.predictions[0].content) {
        throw new Error(`Received empty response from API. Prompt: ${prompt}`);
      } else {
        return res.predictions[0].content;
      }
    }
    throw new Error(JSON.stringify(res));
  }

  private predictWithGemini(prompt: string) {
    let predictEndpoint = undefined;
    predictEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/publishers/google/models/${this.modelId}:streamGenerateContent`;
    const payload = this.addAuthPost({
      "contents": {
        "role": "user",
        "parts": [
          {
            "text": prompt
          }
        ]
      },
      "generationConfig": this.modelParams,
      "safetySettings": this.safetySettings
    });
    const res = this.postRequestGemini(
      predictEndpoint,
      payload
    );
    MultiLogger.getInstance().log(`Response: ${JSON.stringify(res)}`);
    if (!res) {
      throw new Error(`Received empty response from API. Prompt: ${prompt}`);
    }

    let testRes = '';
    for (const candidateRes of res) {
      if (candidateRes.error && candidateRes.error.code >= 400) {
        throw new Error(candidateRes.error.message);
      }
      if (!candidateRes.candidates) {
        continue;
      }
      if (!candidateRes.candidates[0]) {
        continue;
      }
      const candidate = candidateRes.candidates[0];
      if (!candidate.content) {
        continue;
      }
      if (!candidate.content.parts) {
        continue;
      }
      if (!candidate.content.parts[0]) {
        continue;
      }
      if (!candidate.content.parts[0].text) {
        continue;
      }
      testRes = testRes + candidate.content.parts[0].text;
    }
    return testRes;
  }

  static getInstance(projectId: string,
                     modelId: string,
                     modelParams: VertexAiModelParams,
                     safetySettings: Array<{[k: string]: string}>,
                     fineTuneModelId?: string | undefined) {
    if (typeof VertexHelper.instance === 'undefined') {
      VertexHelper.instance = new VertexHelper(
          projectId,
          modelId,
          modelParams,
          safetySettings,
          fineTuneModelId);
    }
    return VertexHelper.instance;
  }
}
