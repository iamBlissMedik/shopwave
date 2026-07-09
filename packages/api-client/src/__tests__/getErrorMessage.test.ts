import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from '../client';

describe('getErrorMessage', () => {
  it('unwraps the API error envelope { error: { message } }', () => {
    const err = new AxiosError('Request failed with status code 409');
    err.response = {
      data: { error: { message: 'An account with this email already exists' } },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    };
    expect(getErrorMessage(err)).toBe('An account with this email already exists');
  });

  it('falls back to the Axios message when there is no envelope (e.g. network error)', () => {
    const err = new AxiosError('Network Error');
    expect(getErrorMessage(err)).toBe('Network Error');
  });

  it('returns the message of a plain Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a generic fallback for non-error values', () => {
    expect(getErrorMessage('just a string')).toBe('Something went wrong');
    expect(getErrorMessage(undefined)).toBe('Something went wrong');
    expect(getErrorMessage({ weird: true })).toBe('Something went wrong');
  });
});
