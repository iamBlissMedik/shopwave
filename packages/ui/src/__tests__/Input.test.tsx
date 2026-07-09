import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('associates the label with the input via id', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders no label element when none is given', () => {
    render(<Input id="bare" placeholder="Type here" />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('shows the error message and flags the field as invalid-looking', () => {
    render(<Input id="password" label="Password" error="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(screen.getByLabelText('Password').className).toContain('border-danger');
  });

  it('forwards native input props', () => {
    render(<Input id="qty" type="number" defaultValue={3} label="Qty" />);
    const input = screen.getByLabelText('Qty') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.value).toBe('3');
  });
});
