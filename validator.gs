function testGemini() {
  global_config = fetchGlobalConfig()
  // console.log(global_config)
  vertex_client = VertexHelper.getInstance(global_config.gcp_project_id, global_config.language_model_id, {
      temperature: global_config.temperature,
      maxOutputTokens: global_config.maxOutputTokens,
      topK: global_config.topK,
      topP: global_config.topP,
  })
  const test = vertex_client.predict_with_gemini('Hello', global_config.is_fine_tuned);
  console.log(test)
}

function validateConfig() {
  var global_config;
  try {
    global_config = fetchGlobalConfig()
  } catch (e) {
    console.error(e)
    SpreadsheetApp.getUi().alert(`Error: ${e.message}`);
    return
  }
  
  // console.log(global_config)
  vertex_client = VertexHelper.getInstance(
    global_config.gcp_project_id,
    global_config.language_model_id,
    global_config.fine_tuned_model_id,
    {
      temperature: global_config.temperature,
      maxOutputTokens: global_config.maxOutputTokens,
      topK: global_config.topK,
      topP: global_config.topP,
    }
  )
  // const res = vertex_client.listModel();

  if (global_config.is_fine_tuned && !global_config.fine_tuned_model_id) {
    SpreadsheetApp.getUi().alert("Error: Missing 'Fine tuned model ID' while checking 'Using Fine tuned model'");
    return
  }


  try {
    const test = vertex_client.predict('Hello', global_config.is_fine_tuned);
    if (test.length > 0) {
      console.log('Vertex AI test passed')
    } else {
      throw new Error('Invalid response of Vertex AI.')
    }
  } catch (e) {
    console.error(e)
    SpreadsheetApp.getUi().alert(`Error: ${e.message}`);
    return
  }

  if (global_config.prompt.includes('{industry_default}')) {
    if (!global_config.industry)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Industry'");
      return
    }
  }

  if (global_config.prompt.includes('{business_name_default}')) {
    if (!global_config.business_name)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Business Name'");
      return
    }
  }

  if (global_config.prompt.includes('{business_description_default}')) {
    if (!global_config.business_description)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Business Description'");
      return
    }
  }

  if (global_config.prompt.includes('{target_audience_default}')) {
    if (!global_config.target_audience)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Target Audience'");
      return
    }
  }

  if (global_config.prompt.includes('{other_information_default}')) {
    if (!global_config.other_information)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Other Information'");
      return
    }
  }

  if (global_config.prompt.includes('{language_default}')) {
    if (!global_config.language)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Language'");
      return
    }
  }

  if (global_config.prompt.includes('{tone_default}')) {
    if (!global_config.tone)  {
      SpreadsheetApp.getUi().alert("Error: Missing 'Tone'");
      return
    }
  }

  if (!global_config.enableMultiBatchInput) {
    SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
    return
  }

  if (global_config.autoInsertion) {
    if (!global_config.prompt.includes('{multi_batch_input_default}')) {
      SpreadsheetApp.getUi().alert(`Error: Missing '{multi_batch_input_default}' in the template ${global_config.template_name} while checking 'Multi-Batch Input Variables Auto Insertion'`);
      return
    }  
  } else {
    try {
      console.log(global_config.required_input_columns.length)
      console.log(global_config.required_input_columns)
      if (global_config.required_input_columns.length > 0) {
        const input_array = fetchMultiBatchInput()
        if (input_array.length == 0) {
          SpreadsheetApp.getUi().alert("Error: Missing valid rows in 'Multi-Batch Input' Sheet");
          return
        }
        sample_row = input_array[0]
        // const sample_row = input_array[0]
        // console.log(sample_row)
        for (let i = 0; i < global_config.required_input_columns.length; i++) {
          key = global_config.required_input_columns[i]
          if (!(key in sample_row)) {
            SpreadsheetApp.getUi().alert(`Error: Missing Column ${key} in 'Multi-Batch Input' Sheet`);
            return
          }
        }
      }
    } catch (e) {
      console.error(e)
      SpreadsheetApp.getUi().alert(`Error: ${e.message}`)
      return
    }
  }

  if (!global_config.enableExampleInput) {
    SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
    return
  }

  if (!global_config.enableSACAInput) {
    SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
    return
  }

  SpreadsheetApp.getUi().alert("Success: Configuration Validation Passed.");
}
