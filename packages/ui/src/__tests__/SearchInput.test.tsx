import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces and emits the typed value once', () => {
    const onSearch = vi.fn();
    render(<SearchInput value="" onSearch={onSearch} placeholder="Search" />);

    // fireEvent avoids userEvent's internal timers, which deadlock with fake timers.
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'desk' } });
    expect(onSearch).not.toHaveBeenCalled(); // still within the debounce window

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('desk');
  });

  it('does not emit when the value is unchanged', () => {
    const onSearch = vi.fn();
    render(<SearchInput value="desk" onSearch={onSearch} placeholder="Search" />);
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onSearch).not.toHaveBeenCalled();
  });
});
