import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

describe('Select', () => {
  it('renders its options and reports changes', async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Role" defaultValue="USER" onChange={onChange}>
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Role' }) as HTMLSelectElement;
    expect(select.value).toBe('USER');

    await userEvent.selectOptions(select, 'ADMIN');
    expect(onChange).toHaveBeenCalledOnce();
    expect(select.value).toBe('ADMIN');
  });

  it('merges a custom className with the shared field styling', () => {
    render(<Select aria-label="Sort" className="w-full" />);
    const select = screen.getByRole('combobox', { name: 'Sort' });
    expect(select.className).toContain('w-full');
    expect(select.className).toContain('border-border');
  });
});
