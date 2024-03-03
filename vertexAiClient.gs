/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class VertexHelper {
  constructor(projectId, modelId, modelParams, fineTuneModelId) {
    this.projectId = projectId;
    this.modelId = modelId;
    this.modelParams = modelParams;
    this.fineTuneModelId = fineTuneModelId
  }
  addAuthPost(params) {
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
  addAuthGet() {
    const baseParams = {
      method: 'GET',
      muteHttpExceptions: true,
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
      },
    };
    return baseParams;
  }
  postRequest(url, params) {
    const response = UrlFetchApp.fetch(url, params);
    if (response.getResponseCode() === 429) {
      MultiLogger.getInstance().log(
        `Waiting ${
          Number(CONFIG.vertexAi.quotaLimitDelay) / 1000
        }s as API quota limit has been reached...`
      );
      Utilities.sleep(CONFIG.vertexAi.quotaLimitDelay);
      return this.postRequest(url, params);
    }
    return response.getContentText()
  }
  getRequest(url, params) {
    const response = UrlFetchApp.fetch(url, params);
    return response.getContentText()
  }
  fetchJson(rawRes) {
    return JSON.parse(rawRes);
  }
  predict(prompt, isFineTuned) {
    MultiLogger.getInstance().log(`Prompt: ${prompt}`);
    if (this.modelId.includes('gemini')) {
      return this.predict_with_gemini(prompt)
    }

    var predictEndpoint = undefined
    if (isFineTuned) {
      predictEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/endpoints/${this.fineTuneModelId}:predict`;
    } else {
      predictEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/publishers/google/models/${this.modelId}:predict`;
    }
    const payload = this.addAuthPost({
      instances: [{ content: prompt }],
      parameters: this.modelParams,
    })
    const res = this.fetchJson(this.postRequest(
      predictEndpoint,
      payload
    ));
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

  predict_with_gemini(prompt) {
    MultiLogger.getInstance().log(`Prompt: ${prompt}`);
    var predictEndpoint = undefined
    predictEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/publishers/google/models/${this.modelId}:streamGenerateContent`;
    const payload = this.addAuthPost({
      "contents": {
        "role": "user",
        "parts": [
          {
            "text": prompt
          }
        ]
      }
    })
    const res = this.fetchJson(this.postRequest(
      predictEndpoint,
      payload
    ));
    MultiLogger.getInstance().log(`Response: ${JSON.stringify(res)}`);
    if (!res) {
      throw new Error(`Received empty response from API. Prompt: ${prompt}`);
    }

    var testRes = ''
    for (const candidate_res of res) {
      if (candidate_res.error && candidate_res.error.code >= 400) {
        throw new Error(candidate_res.error.message); 
      }
      if (!candidate_res.candidates) {
        continue;
      }
      if (!candidate_res.candidates[0]) {
        continue;
      }
      var candidate = candidate_res.candidates[0]
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
      testRes = testRes + candidate.content.parts[0].text
    }
    return testRes
  }
  listModel() {
    const listEndpoint = `https://${CONFIG.vertexAi.location}-${CONFIG.vertexAi.endpoint}/v1/projects/${this.projectId}/locations/${CONFIG.vertexAi.location}/models`;
    const payload = this.addAuthGet()
    console.log(listEndpoint)
    console.log(payload)
    const res = this.getRequest(
      listEndpoint,
      payload
    );
  }
  static getInstance(projectId, modelId, modelParams) {
    if (typeof this.instance === 'undefined') {
      this.instance = new VertexHelper(projectId, modelId, modelParams);
    }
    return this.instance;
  }
}
