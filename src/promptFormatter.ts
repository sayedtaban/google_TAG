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

import { fetchExampleInput, fetchSACAInput } from './inputFetcher';
import { checkBlockedSuffix } from './util';

/** Get Example Configuration. */
export function getExamplePart(enableExampleInput:boolean) {
  let exampleInputArray;
  let exampleInputJson;
  let examplePrompt;
  if (enableExampleInput) {
    exampleInputArray = fetchExampleInput();
    if (!exampleInputArray) {
      examplePrompt = `\n
###Example Output
[
  {"headline": "headline 1", "description": "description 2"},
  {"headline": "headline 2", "description": "description 2"}
]
`;

      return examplePrompt;
    }
    exampleInputJson = [];
    for (const example of exampleInputArray) {
      if (example['Example Headline'] && example['Example Description']) {
        exampleInputJson.push({
          "headline": example['Example Headline'],
          "description": example['Example Description']
        });
      }
    }
    if (exampleInputJson && exampleInputJson.length > 0) {
      examplePrompt = `\n
###Example Output
${JSON.stringify(exampleInputJson)}
`;
    } else {
      examplePrompt = `\n
###Example Output
[
  {"headline": "headline 1", "description": "description 2"},
  {"headline": "headline 2", "description": "description 2"}
]
`;
    }

  } else {
    examplePrompt = `\n
###Example Output
[
  {"headline": "headline 1", "description": "description 2"},
  {"headline": "headline 2", "description": "description 2"}
]
`;
  }

  return examplePrompt;
}

/** Get SACA Input Configuration. */
export function getSACAPart(enableSACAInput: boolean) {
  let sacaPrompt;
  if (enableSACAInput) {
    const sacaInputArray = fetchSACAInput();
    if (!sacaInputArray) return '';

    const sacaReservedKeywords = ['_person', '_mood'];

    const headlineUse = [];
    const headlineDrop = [];
    const descriptionUse = [];
    const descriptionDrop = [];
    const headlineSpecialUse = [];
    const headlineSpecialDrop = [];
    const descriptionSpecialUse = [];
    const descriptionSpecialDrop = [];

    for (const sacaRow of sacaInputArray) {
      if (!sacaRow['ad_part'] || !sacaRow['action'] || !sacaRow['word']) {
        continue;
      }

      if (sacaRow['ad_part'] === 'headline' && sacaRow['action'] === 'use') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          headlineUse.push(sacaRow['word']);
        } else {
          if (!checkBlockedSuffix(sacaRow['word'], ['second_person'])) {
            headlineUse.push('you');
            headlineUse.push('your');
          } else {
            headlineSpecialUse.push(sacaRow['word']);
          }
        }
      } else if (sacaRow['ad_part'] === 'headline' && sacaRow['action'] === 'drop') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          headlineDrop.push(sacaRow['word']);
        } else {
          headlineSpecialDrop.push(sacaRow['word']);
        }
      } else if (sacaRow['ad_part'] === 'description' && sacaRow['action'] === 'use') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          descriptionUse.push(sacaRow['word']);
        } else {
          if (!checkBlockedSuffix(sacaRow['word'], ['second_person'])) {
            descriptionUse.push('you');
            descriptionUse.push('your');
          } else {
            descriptionSpecialUse.push(sacaRow['word']);
          }
        }
      } else if (sacaRow['ad_part'] === 'description' && sacaRow['action'] === 'drop') {
        if (checkBlockedSuffix(sacaRow['word'], sacaReservedKeywords)) {
          descriptionDrop.push(sacaRow['word']);
        } else {
          descriptionSpecialDrop.push(sacaRow['word']);
        }
      }
    }
    let headlineInstruction;
    let headlineInstructionSpecialUse;
    let headlineInstructionSpecialAvoid;
    let descriptionInstruction;
    let descriptionInstructionSpecialUse;
    let descriptionInstructionSpecialAvoid;

    if (headlineUse.length > 0) {
      headlineInstruction = `\nNaturally incorporate ${headlineUse.join(',')} into the headline`;
    } else {
      headlineInstruction = '';
    }
    if (headlineSpecialUse.length > 0) {
      headlineInstructionSpecialUse = `\nUse ${headlineSpecialUse.join(',')} in the headline.`;
    } else {
      headlineInstructionSpecialUse = '';
    }
    if (headlineSpecialDrop.length > 0) {
      headlineInstructionSpecialAvoid = `\nAvoid ${headlineSpecialDrop.join(',')} in the headline.`;
    } else {
      headlineInstructionSpecialAvoid = '';
    }
    if (descriptionUse.length > 0) {
      descriptionInstruction = `\nNaturally incorporate ${descriptionUse.join(',')} into the description.`;
    } else {
      descriptionInstruction = '';
    }
    if (descriptionSpecialUse.length > 0) {
      descriptionInstructionSpecialUse = `\nUse ${descriptionSpecialUse.join(',')} in the description.`;
    } else {
      descriptionInstructionSpecialUse = '';
    }
    if (descriptionSpecialDrop.length > 0) {
      descriptionInstructionSpecialAvoid = `\nAvoid ${descriptionSpecialDrop.join(',')} in the description.`;
    } else {
      descriptionInstructionSpecialAvoid = '';
    }


    sacaPrompt = ('\n\n###Additional Requirements'
        + headlineInstruction
        + headlineInstructionSpecialUse
        + headlineInstructionSpecialAvoid
        + descriptionInstruction
        + descriptionInstructionSpecialUse
        + descriptionInstructionSpecialAvoid);
  } else {
    sacaPrompt = '';
  }
  return sacaPrompt;
}

/** Get Output Format Restriction. */
export function getOutputRestrictionPart() {
  const outputFormatRestriction = `\n###Output format\n`
  + `Please generate at least 10 pairs of headline and description using this JSON schema:\n`
  + `TextAds = {'headline': string, 'description': string}\n`
  + `Return: Array<TextAds>`;
  return outputFormatRestriction;
}

