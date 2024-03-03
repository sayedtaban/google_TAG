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

/** Compare the priority of generated text ads. */
export function compareFn(a: string, b: string) {
  if (checkKeywordInsertion(a) && checkKeywordInsertion(b)) {
    if (a.length < b.length) {
      return -1;
    } else if (a.length > b.length) {
      return 1;
    } else {
      return 0;
    }
  } else if (checkKeywordInsertion(a)) {
    return 1;
  } else if (checkKeywordInsertion(b)) {
    return -1;
  } else {
    if (a.length < b.length) {
      return -1;
    } else if (a.length > b.length) {
      return 1;
    } else {
      return 0;
    }
  }
}

/** Check if there are blocked keywords in output. */
export function checkBlockingKeywords(blockingKeywords: string[]) {
  return (text: string) => {
    for (let j = 0; j < blockingKeywords.length; j++) {
      if (text.toLowerCase().includes(blockingKeywords[j])) {
        return false;
      }
    }
    return true;
  };
}

/** Check if there are blocked suffix in output. */
export function checkBlockedSuffix(text: string, keywords: string[]) {
  for (let j = 0; j < keywords.length; j++) {
    if (text.endsWith(keywords[j])) {
      return false;
    }
  }
  return true;
}

/** Remove the last non letter character. */
export function removeLastNonLetterCharacter(text: string | undefined | null) {
  if (text === null) {
    return text;
  }
  if (text === undefined) {
    return text;
  }
  const length = text.length;
  if (length === 0) {
    return text;
  }
  const characters = ['!', '！', '。', '.'];
  for (const c of characters) {
    if (text.endsWith(c)) {
      text = text.substring(0, length - 1);
    }
  }
  return text;
}

/** Check if the text ads is with keyword insertion. */
export function checkKeywordInsertion(text: string | undefined | null) {
  if (text === null) {
    return false;
  }
  if (text === undefined) {
    return false;
  }

  if (text.includes('{KeyWord:')) {
    return true;
  } else {
    return false;
  }
}

/** Get the real length of text ads with keyword insertion. */
export function getKeywordInsertionHeadlineLength(text: string | undefined | null) {
  if (text === null) {
    return -1;
  }
  if (text === undefined) {
    return -1;
  }

  text = text.replace('{KeyWord:', '');
  text = text.replace('}', '');
  return text.length;
}