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

function testInputFetcher() {
  globalConfig = fetchGlobalConfig()
  console.log(globalConfig)
  multiBatchInput = fetchMultiBatchInput()
  console.log(multiBatchInput)
  exampleInput = fetchExampleInput()
  console.log(exampleInput)
  sacaInput = fetchSACAInput()
  console.log(sacaInput)
  blockingKeywords = fetchBlockingKeywords()
  console.log(blockingKeywords)
}

function fetchGlobalConfig() {
  gcp_project_id = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.gcpProjectId.row, CONFIG.userSettings.llmConfig.gcpProjectId.col)
  language_model_id = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.languageModelId.row, CONFIG.userSettings.llmConfig.languageModelId.col)
  template_name = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.templateId.row, CONFIG.userSettings.llmConfig.templateId.col)
  template = fetchTemplate(template_name)
  prompt = template[1]
  autoInsertion = template[2]
  required_input_columns = template[3].split(/\s*[,，]\s*/)
  is_fine_tuned = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.isFineTuned.row, CONFIG.userSettings.llmConfig.isFineTuned.col)
  fine_tuned_model_id = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.fineTunedModelId.row, CONFIG.userSettings.llmConfig.fineTunedModelId.col)
  temperature = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.temperature.row, CONFIG.userSettings.llmConfig.temperature.col)
  topK = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.topK.row, CONFIG.userSettings.llmConfig.topK.col)
  topP = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.topP.row, CONFIG.userSettings.llmConfig.topP.col)
  maxOutputTokens = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.llmConfig.maxOutputTokens.row, CONFIG.userSettings.llmConfig.maxOutputTokens.col)

  industry = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.businessData.industry.row, CONFIG.userSettings.businessData.industry.col)
  business_name = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.businessData.businessName.row, CONFIG.userSettings.businessData.businessName.col)
  business_description = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.businessData.businessDesc.row, CONFIG.userSettings.businessData.businessDesc.col)
  target_audience = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.businessData.targetAudience.row, CONFIG.userSettings.businessData.targetAudience.col)
  if (!target_audience) {
    target_audience = 'Not Specific'
  }
  other_information = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.businessData.otherInformation.row, CONFIG.userSettings.businessData.otherInformation.col)
  if (!other_information) {
    other_information = 'Not Specific'
  }
  language = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.instruction.language.row, CONFIG.userSettings.instruction.language.col)
  tone = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.instruction.tone.row, CONFIG.userSettings.instruction.tone.col)
  headline_variants = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.instruction.headlineVariants.row, CONFIG.userSettings.instruction.headlineVariants.col)
  description_variants = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.instruction.descriptionVariants.row, CONFIG.userSettings.instruction.descriptionVariants.col)

  enableMultiBatchInput = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.advancedOptions.enableMultiBatchInput.row, CONFIG.userSettings.advancedOptions.enableMultiBatchInput.col)
  multiBatchStartRowNumber = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.row, CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.col)
  if (!multiBatchStartRowNumber || parseInt(multiBatchStartRowNumber) < 2) {
    multiBatchStartRowNumber = 2
  }
  enableExampleInput = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.advancedOptions.enableExampleInput.row, CONFIG.userSettings.advancedOptions.enableExampleInput.col)
  enableSACAInput = SheetsService.getInstance().getCellValue('Config', CONFIG.userSettings.advancedOptions.enableSACAInput.row, CONFIG.userSettings.advancedOptions.enableSACAInput.col)

  return {
    gcp_project_id: gcp_project_id,
    language_model_id: language_model_id,
    is_fine_tuned: is_fine_tuned,
    template_name: template_name, 
    prompt: prompt,
    autoInsertion: Boolean(autoInsertion),
    required_input_columns: required_input_columns,
    temperature: temperature,
    topK: topK,
    topP: topP,
    maxOutputTokens: maxOutputTokens,
    industry: industry,
    business_name: business_name,
    business_description: business_description,
    target_audience: target_audience,
    other_information: other_information,
    language: language,
    tone: tone,
    headline_variants: headline_variants,
    headline_length: TEXT_LENGTH_CONFIG[language].headline,
    description_variants: description_variants,
    description_length: TEXT_LENGTH_CONFIG[language].description,
    enableMultiBatchInput: Boolean(enableMultiBatchInput),
    multiBatchStartRowNumber: parseInt(multiBatchStartRowNumber),
    enableExampleInput: Boolean(enableExampleInput),
    enableSACAInput: Boolean(enableSACAInput)
  }
}


function fetchMultiBatchInput() {
  input_rows = SheetsService.getInstance().getNonEmptyRows('Multi-Batch Input')
  const input_arr = new Array()
  for (let i = 1; i < input_rows.length; i++) {
    var input_row = {}
    for (let j = 0; j < input_rows[0].length; j++) {
      input_row[input_rows[0][j]] = input_rows[i][j]
    }
    input_arr.push(input_row)
  }
  return input_arr
}

function fetchExampleInput() {
  input_rows = SheetsService.getInstance().getNonEmptyRows('Example Input')
  const input_arr = new Array()
  for (let i = 1; i < input_rows.length; i++) {
    var input_row = {}
    for (let j = 0; j < input_rows[0].length; j++) {
      input_row[input_rows[0][j]] = input_rows[i][j]
    }
    input_arr.push(input_row)
  }
  return input_arr
}

function fetchSACAInput() {
  input_rows = SheetsService.getInstance().getNonEmptyRows('SACA Input')
  const input_arr = new Array()
  for (let i = 1; i < input_rows.length; i++) {
    var input_row = {}
    for (let j = 0; j < input_rows[0].length; j++) {
      input_row[input_rows[0][j]] = input_rows[i][j]
    }
    input_arr.push(input_row)
  }
  return input_arr
}

function fetchOutput() {
  input_rows = SheetsService.getInstance().getNonEmptyRows('Output')
  const input_arr = new Array()
  for (let i = 1; i < input_rows.length; i++) {
    var input_row = {}
    for (let j = 0; j < 3; j++) {
      input_row[input_rows[0][j]] = input_rows[i][j]
    }
    input_arr.push(input_row)
  }
  return input_arr
}

function fetchBlockingKeywords() {
  input_rows = SheetsService.getInstance().getNonEmptyRows('Blocking Keywords')
  const input_arr = new Array()
  for (let i = 0; i < input_rows.length; i++) {
    input_arr.push(input_rows[i][0].toLowerCase())
  }
  return input_arr
}

function fetchSACABlockingKeywords(enableSACAInput) {
  if (!enableSACAInput) {
    return []
  }
  var sacaInputArray = fetchSACAInput()

  var sacaReservedKeywords = ['_person', '_mood']

  var headlineDrop = new Array()
  var descriptionDrop = new Array()

  for (const sacaRow of sacaInputArray) {
    if (!sacaRow['ad_part'] || !sacaRow['action'] || !sacaRow['word']) {
      continue
    }

    if (sacaRow['ad_part'] === 'headline' && sacaRow['action'] === 'drop') {
      if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
        headlineDrop.push(sacaRow['word'])
      }
    } else if (sacaRow['ad_part'] === 'description' && sacaRow['action'] === 'drop') {
      if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
        descriptionDrop.push(sacaRow['word'])
      }
    }
  }
  return headlineDrop.concat(descriptionDrop)
}

function fetchTemplate(template_name) {
  rows = SheetsService.getInstance().getNonEmptyRows('Templates')
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === template_name) {
      return rows[i];
    }
  }
  throw new Error(`Cannot find template: ${template_name}`); 
}
