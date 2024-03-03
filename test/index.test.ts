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

import {
  checkBlockingKeywords,
  removeLastNonLetterCharacter,
  compareFn,
  checkKeywordInsertion,
  getKeywordInsertionHeadlineLength,
  checkBlockedSuffix} from '../src/util';

describe('test util file', () => {
  test('text ads with blocked keywords should be removed', () => {
    const input = ['Fast Fashion, Global Style',
      'Upgrade Your Look for Less'];
    const blockedKeywords = ['less'];
    const expected = ['Fast Fashion, Global Style'];
    const output = input.filter(checkBlockingKeywords(blockedKeywords));
    expected.forEach((item: string, index: number) => {
      expect(output[index]).toBe(item);
    });
  });

  test('text ads without blocked keywords should not be removed', () => {
    const input = ['Fast Fashion, Global Style',
      'Upgrade Your Look for Less'];
    const blockedKeywords = ['more'];
    const expected = ['Fast Fashion, Global Style',
      'Upgrade Your Look for Less'];
    const output = input.filter(checkBlockingKeywords(blockedKeywords));
    expected.forEach((item: string, index: number) => {
      expect(output[index]).toBe(item);
    });
  });

  test('last non letter character should be removed', () => {
    const input = 'Fast Fashion, Global Style!';
    const expected = 'Fast Fashion, Global Style';
    expect(removeLastNonLetterCharacter(input)).toBe(expected);
  });

  test('sort text ads with expected logic', () => {
    const input = ['Fast Fashion, Global Style',
      'Look Good, Feel Good',
      '{KeyWord:Dress} on Sale',
      'Shop {KeyWord:Dress} now'];
    const expected = ['Shop {KeyWord:Dress} now',
      '{KeyWord:Dress} on Sale',
      'Fast Fashion, Global Style',
      'Look Good, Feel Good'];
    const output = input.sort(compareFn).reverse();
    expected.forEach((item: string, index: number) => {
      expect(output[index]).toBe(item);
    });
  });

  test('text with keyword insertion should return true', () => {
    const input = '{KeyWord:Dress} on Sale';
    const expected = true;
    expect(checkKeywordInsertion(input)).toBe(expected);
  });

  test('text without keyword insertion should return false', () => {
    const input = 'Fast Fashion, Global Style';
    const expected = false;
    expect(checkKeywordInsertion(input)).toBe(expected);
  });

  test('recalculate string length for keyword insertion text', () => {
    const input = '{KeyWord:Dress} on Sale';
    const expected = 13;
    expect(getKeywordInsertionHeadlineLength(input)).toBe(expected);
  });

  test('recalculate string length for non keyword insertion text', () => {
    const input = 'Fast Fashion, Global Style';
    const expected = 26;
    expect(getKeywordInsertionHeadlineLength(input)).toBe(expected);
  });

  test('return false for text with blocked suffix', () => {
    const input = 'second_person';
    const expected = false;
    expect(checkBlockedSuffix(input, ['_person', '_mood'])).toBe(expected);
  });

  test('return true for text without blocked suffix', () => {
    const input = 'buy';
    const expected = true;
    expect(checkBlockedSuffix(input, ['_person', '_mood'])).toBe(expected);
  });
});