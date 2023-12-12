function getExamplePart(enableExampleInput) {
  if (enableExampleInput) {
    exampleInputArray = fetchExampleInput()
    exampleInputJson = []
    for (const example of exampleInputArray) {
      if (example['Example Headline'] && example['Example Description']) {
        exampleInputJson.push({"headline": example['Example Headline'], "description": example['Example Description']})
      }
    }
    if (exampleInputJson && exampleInputJson.length > 0) {
      examplePrompt = `\n
###Example Output
${JSON.stringify(exampleInputJson)}
`
    } else {
      examplePrompt = `\n
###Example Output
[
  {"headline": "headline 1", "description": "description 2"},
  {"headline": "headline 2", "description": "description 2"}
]
`
    }

  } else {
    examplePrompt = `\n
###Example Output
[
  {"headline": "headline 1", "description": "description 2"},
  {"headline": "headline 2", "description": "description 2"}
]
`
  }

  return examplePrompt
}

function getSACAPart(enableSACAInput) {
  if (enableSACAInput) {
    var sacaInputArray = fetchSACAInput()

    var sacaReservedKeywords = ['_person', '_mood']

    var headlineUse = new Array()
    var headlineDrop = new Array()
    var descriptionUse = new Array()
    var descriptionDrop = new Array()
    var headlineSpecialUse = new Array()
    var headlineSpecialDrop = new Array()
    var descriptionSpecialUse = new Array()
    var descriptionSpecialDrop = new Array()

    for (const sacaRow of sacaInputArray) {
      if (!sacaRow['ad_part'] || !sacaRow['action'] || !sacaRow['word']) {
        continue
      }

      if (sacaRow['ad_part'] === 'headline' && sacaRow['action'] === 'use') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          headlineUse.push(sacaRow['word'])
        } else {
          if (!checkBlockedSuffix(sacaRow['word'], ['second_person'])) {
            headlineUse.push('you')
            headlineUse.push('your')
          } else {
            headlineSpecialUse.push(sacaRow['word'])
          }
        }
      } else if (sacaRow['ad_part'] === 'headline' && sacaRow['action'] === 'drop') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          headlineDrop.push(sacaRow['word'])
        } else {
          headlineSpecialDrop.push(sacaRow['word'])
        }
      } else if (sacaRow['ad_part'] === 'description' && sacaRow['action'] === 'use') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          descriptionUse.push(sacaRow['word'])
        } else {
          if (!checkBlockedSuffix(sacaRow['word'], ['second_person'])) {
            descriptionUse.push('you')
            descriptionUse.push('your')
          } else {
            descriptionSpecialUse.push(sacaRow['word'])
          }
        }
      } else if (sacaRow['ad_part'] === 'description' && sacaRow['action'] === 'drop') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          descriptionDrop.push(sacaRow['word'])
        } else {
          descriptionSpecialDrop.push(sacaRow['word'])
        }
      }
    }
    
    if (headlineUse.length > 0) {
      headlineInstruction = `\nNaturally involve ${headlineUse.join(',')} in the headline`
    } else {
      headlineInstruction = ''
    }
    if (headlineSpecialUse.length > 0) {
      headlineInstructionSpecialUse = `\nUse ${headlineSpecialUse.join(',')} in the headline.`
    } else {
      headlineInstructionSpecialUse = ''
    }
    if (headlineSpecialDrop.length > 0) {
      headlineInstructionSpecialAvoid = `\nAvoid ${headlineSpecialDrop.join(',')} in the headline.`
    } else {
      headlineInstructionSpecialAvoid = ''
    }
    if (descriptionUse.length > 0) {
      descriptionInstruction = `\nNaturally involve ${descriptionUse.join(',')} in the description.`
    } else {
      descriptionInstruction = ''
    }
    if (descriptionSpecialUse.length > 0) {
      descriptionInstructionSpecialUse = `\nUse ${descriptionSpecialUse.join(',')} in the description.`
    } else {
      descriptionInstructionSpecialUse = ''
    }
    if (descriptionSpecialDrop.length > 0) {
      descriptionInstructionSpecialAvoid = `\nAvoid ${descriptionSpecialDrop.join(',')} in the description.`
    } else {
      descriptionInstructionSpecialAvoid = ''
    }
    

    sacaPrompt = ('\n\n###Additional Requirements'
                     + headlineInstruction
                     + headlineInstructionSpecialUse
                     + headlineInstructionSpecialAvoid
                     + descriptionInstruction
                     + descriptionInstructionSpecialUse
                     + descriptionInstructionSpecialAvoid)
  } else {
    sacaPrompt = ''
  }
  return sacaPrompt
}

function getOutputRestrictionPart() {
  outputFormatRestriction = `\n###Output format\nPlease generate at least 10 pairs of headline and description in JSON Array format.`
  return outputFormatRestriction
}

