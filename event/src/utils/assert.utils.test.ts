import { assert, assertError, assertString } from './assert.utils';

describe('assert', () => {
  it('should not throw an error when condition is true', () => {
    // Positive test case
    expect(() => assert(true, 'Condition is true')).not.toThrowError();
  });

  it('should throw an error when condition is false', () => {
    // Negative test case
    expect(() => assert(false, 'Condition is false')).toThrowError(
      'Assertion failed: Condition is false'
    );
  });
});

describe('assertError', () => {
  it('should not throw an error when value is an Error', () => {
    // Positive test case
    const error = new Error('Test error');
    expect(() => assertError(error, 'Value is an Error')).not.toThrowError();
  });

  it('should throw an error when value is not an Error', () => {
    // Negative test case
    const nonErrorValue = 'Not an error';
    expect(() => assertError(nonErrorValue, 'Value is an Error')).toThrowError(
      'Assertion failed: Value is an Error'
    );
  });
});

describe('assertString', () => {
  it('should not throw an error when value is a string', () => {
    // Positive test case
    const stringValue = 'Test string';
    expect(() => assertString(stringValue, 'Value is a string')).not.toThrowError();
  });

  it('should throw an error when value is not a string', () => {
    // Negative test case
    const nonStringValue = 42; // Not a string
    expect(() => assertString(nonStringValue, 'Value is a string')).toThrowError(
      'Assertion failed: Value is a string'
    );
  });
});
