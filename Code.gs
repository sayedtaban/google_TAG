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

function generateRow() {
  MultiLogger.getInstance().log('Start processing');
  try {
    generateRowWorker()
  } catch(e) {
    MultiLogger.getInstance().log(e.message);
    SpreadsheetApp.getUi().alert(`Error: ${e.message}`)
  }
  MultiLogger.getInstance().log('End processing');
}

function generateRowWorker() {
  global_config = fetchGlobalConfig()
  console.log(global_config)
  const headline_num = global_config.headline_variants
  const description_num = global_config.description_variants
  const previousOutput = fetchOutput()
  const previousGeneratedAds = {}
  const startRowNum = global_config.multiBatchStartRowNumber
  const blocking_keywords = fetchBlockingKeywords()
  const saca_blocking_keywords = fetchSACABlockingKeywords(global_config.enableSACAInput)
  max_rerun_count = 10

  if (global_config.enableMultiBatchInput) {
    var multiBatchInputArray = fetchMultiBatchInput()
    var batchCount = multiBatchInputArray.length
    for (let i = startRowNum-2; i < batchCount; i++) {
      tmpOutput = {'headline': [], 'description':[]}
      previousGeneratedAds[i] = tmpOutput
    }
    for (const row of previousOutput) {
      tmpRowNum = parseInt(row['Multi-Batch Input Row Number'])-2
      if (previousGeneratedAds[tmpRowNum]) {
        previousGeneratedAds[tmpRowNum][row['Text Type']].push(row['Generated Text'])
      }
    }

  } else {
    var multiBatchInputArray = [[]]
    var batchCount = 1
    previousGeneratedAds[0] = {'headline': [], 'description':[]}
  }

  console.log(previousGeneratedAds)

  for (let i = startRowNum-2; i < batchCount; i++) {
    multiBatchInput = multiBatchInputArray[i]
    const text_headline = new Array()
    const text_description = new Array()
    tmp_headline_num =  Math.max(0, headline_num - previousGeneratedAds[i]['headline'].length)
    tmp_description_num = Math.max(0, description_num - previousGeneratedAds[i]['description'].length)
    console.log(tmp_headline_num, tmp_description_num)
    var count = 0
    while((count < max_rerun_count) && ((text_headline.length < tmp_headline_num) || (text_description.length < tmp_description_num))) {
      count++;
      try {
        res = callVertexAPI(global_config, multiBatchInput)
      } catch (e) {
        MultiLogger.getInstance().log(e.message);
        continue
      }
      for (const value of CHARACTERS_TO_BE_REMOVED) {
        res = res.replaceAll(value, '')
      }
      var res_set = new Set()
      try {
        dict_item = JSON.parse(res)
        for (let j = 0; j < dict_item.length; j++) {
          if (dict_item[j]['headline']) {
            res_set.add(dict_item[j]['headline'])
          }

          if (dict_item[j]['description']) {
            res_set.add(dict_item[j]['description'])
          }
        }
      } catch (e) {
        MultiLogger.getInstance().log(e.message);
        MultiLogger.getInstance().log(`Error Source: ${res}`);
      }

      res_list = Array.from(res_set).filter(checkBlockingKeywords(blocking_keywords))

      if (global_config.enableSACAInput) {
        res_list = res_list.filter(checkBlockingKeywords(saca_blocking_keywords))
      }

      res_list = res_list.map(removeLastNonLetterCharacter)
      
      for (const value of res_list) {
        // console.log(value)
        if ((value.length > global_config.headline_length) &&
            (value.length <= global_config.description_length) &&
            !text_description.includes(value) &&
            !previousGeneratedAds[i]['description'].includes(value)) {
          text_description.push(value)
        } else if ((value.length <= global_config.headline_length) &&
                   (value.length >= 4) &&
                   !text_headline.includes(value) &&
                   !previousGeneratedAds[i]['headline'].includes(value)) {
          text_headline.push(value)
        } else {
          continue;
        }
      }
    }
    sorted_text_headline = text_headline.sort(compareFn).reverse()
    sorted_text_description = text_description.sort(compareFn).reverse()
    console.log(text_headline)
    console.log(text_description)
    var input_summary = []
    for (const [key, value] of Object.entries(multiBatchInput)) {
      input_summary.push(value)
    }
    for (let a = 0; a < Math.min(tmp_headline_num, sorted_text_headline.length); a++) {
      var output_value = [sorted_text_headline[a], 'headline', i+2, ...input_summary]
      SheetsService.getInstance().appendRows(
        'Output',
        output_value
      );
    }

    for (let a = 0; a < Math.min(tmp_description_num, sorted_text_description.length); a++) {
      var output_value = [sorted_text_description[a], 'description', i+2, ...input_summary]
      SheetsService.getInstance().appendRows(
        'Output',
        output_value
      );
    }

    if (global_config.enableMultiBatchInput) {
      SheetsService.getInstance().setCellValue(CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.row,
                                               CONFIG.userSettings.advancedOptions.multiBatchStartRowNumber.col,
                                               i+3,
                                               'Config')
    }
    
  } 
}

function generateFinalPrompt(globalConfig, multiBatchInput) {
  var prompt =
    globalConfig.prompt.replace('{industry_default}', globalConfig.industry)
                        .replace('{business_name_default}', globalConfig.business_name)
                        .replace('{business_description_default}', globalConfig.business_description)
                        .replace('{target_audience_default}', globalConfig.target_audience)
                        .replace('{other_information_default}', globalConfig.other_information)
                        .replace('{language_default}', globalConfig.language)
                        .replace('{tone_default}', globalConfig.tone)
                        .replace('{headline_variants_default}', globalConfig.headline_variants)
                        .replace('{description_variants_default}', globalConfig.description_variants)
                        .replace('{headline_length_default}', globalConfig.headline_length)
                        .replace('{description_length_default}', globalConfig.description_length)

  if (globalConfig.enableMultiBatchInput) {
    if (globalConfig.autoInsertion) {
      var multiBatchInputString = ''
      for (const [key, value] of Object.entries(multiBatchInput)) {
        if (value) {
          key_formatted = key.replace('_', ' ')
          multiBatchInputString = multiBatchInputString + `${key_formatted}: ${value}.\n`
        }
      }
      prompt = prompt.replace(`{multi_batch_input_default}`, multiBatchInputString)
    } else {
      for (const [key, value] of Object.entries(multiBatchInput)) {
        prompt = prompt.replace(`{${key}}`, value)
      }
    }
  } else {
    prompt = prompt.replace(`{multi_batch_input_default}`, '')
  }

  prompt = prompt + getSACAPart(globalConfig.enableSACAInput)

  prompt = prompt + getExamplePart(globalConfig.enableExampleInput)
  
  prompt = prompt + getOutputRestrictionPart()
  return prompt
}

function callVertexAPI(globalConfig, multiBatchInput) {
  var prompt = generateFinalPrompt(globalConfig, multiBatchInput)
  const res = VertexHelper.getInstance(globalConfig.gcp_project_id, globalConfig.language_model_id, {
      temperature: globalConfig.temperature,
      maxOutputTokens: globalConfig.maxOutputTokens,
      topK: globalConfig.topK,
      topP: globalConfig.topP,
  }).predict(prompt, globalConfig.is_fine_tuned);
  console.log(res)
  return res;
}

function clearRow() {
  var result = SpreadsheetApp.getUi().alert("You are clearing all output rows. Do you want to continue?", SpreadsheetApp.getUi().ButtonSet.YES_NO);
  if (result.toString() === 'NO') {
    console.log('user cancelled')
    return
  } else if (result.toString() === 'YES') {
    console.log('user continued')
    const row_num = SheetsService.getInstance().getTotalRows('Output') 
    const col_num = SheetsService.getInstance().getTotalColumns('Output') 
    SheetsService.getInstance().clearDefinedRange('Output', 2, 1, numRows = row_num-1, numCols = col_num) 
  }
}
