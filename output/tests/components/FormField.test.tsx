/**
 * Tests for FormField Component
 */

import React from 'react';
import { render, screen } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { FormField } from '../../../components/ui/form/FormField';

describe('FormField', () => {
  it('should render with label', () => {
    render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render without label', () => {
    render(
      <FormField>
        <input type="text" data-testid="input" />
      </FormField>
    );

    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(
      <FormField label="Required Field" required>
        <input type="text" />
      </FormField>
    );

    const label = screen.getByText('Required Field');
    expect(label).toBeInTheDocument();

    // Check for required indicator (asterisk)
    const requiredIndicator = label.parentElement?.querySelector('[aria-hidden="true"]');
    expect(requiredIndicator).toHaveTextContent('*');
  });

  it('should show error message when touched and has error', () => {
    render(
      <FormField label="Test Field" error="This field is required" touched>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not show error when not touched', () => {
    render(
      <FormField label="Test Field" error="This field is required" touched={false}>
        <input type="text" />
      </FormField>
    );

    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });

  it('should show helper text', () => {
    render(
      <FormField label="Test Field" helperText="Enter your name">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Enter your name')).toBeInTheDocument();
  });

  it('should not show helper text when error is shown', () => {
    render(
      <FormField
        label="Test Field"
        helperText="Enter your name"
        error="This field is required"
        touched
      >
        <input type="text" />
      </FormField>
    );

    expect(screen.queryByText('Enter your name')).not.toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <FormField label="Test Field" isLoading>
        <input type="text" data-testid="input" />
      </FormField>
    );

    // Check for loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should apply size variants', () => {
    const { rerender } = render(
      <FormField label="Small Field" size="sm">
        <input type="text" />
      </FormField>
    );

    let label = screen.getByText('Small Field');
    expect(label).toHaveClass('text-xs');

    rerender(
      <FormField label="Large Field" size="lg">
        <input type="text" />
      </FormField>
    );

    label = screen.getByText('Large Field');
    expect(label).toHaveClass('text-base');
  });

  it('should hide label visually when hideLabel is true', () => {
    render(
      <FormField label="Hidden Label" hideLabel>
        <input type="text" />
      </FormField>
    );

    const label = screen.getByText('Hidden Label');
    expect(label).toHaveClass('sr-only');
  });

  it('should render custom label element', () => {
    render(
      <FormField labelElement={<span data-testid="custom-label">Custom Label</span>}>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should apply aria attributes to child input', () => {
    render(
      <FormField label="Test Field" error="Error message" touched helperText="Helper text">
        <input type="text" data-testid="input" />
      </FormField>
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-labelledby');
  });

  it('should apply aria-required when field is required', () => {
    render(
      <FormField label="Test Field" required>
        <input type="text" data-testid="input" />
      </FormField>
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-required');
  });

  it('should apply custom className', () => {
    render(
      <FormField label="Test Field" className="custom-class">
        <input type="text" />
      </FormField>
    );

    const container = screen.getByText('Test Field').closest('.flex');
    expect(container).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <FormField label="Test Field" ref={ref}>
        <input type="text" />
      </FormField>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have correct display name', () => {
    expect(FormField.displayName).toBe('FormField');
  });

  it('should handle multiple children', () => {
    render(
      <FormField label="Test Field">
        <input type="text" data-testid="input1" />
        <input type="text" data-testid="input2" />
      </FormField>
    );

    expect(screen.getByTestId('input1')).toBeInTheDocument();
    expect(screen.getByTestId('input2')).toBeInTheDocument();
  });

  it('should not clone non-React element children', () => {
    render(
      <FormField label="Test Field">
        <input type="text" data-testid="input" />
        {'Text child'}
      </FormField>
    );

    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByText('Text child')).toBeInTheDocument();
  });

  it('should apply error styling to label', () => {
    render(
      <FormField label="Test Field" error="Error message" touched>
        <input type="text" />
      </FormField>
    );

    const label = screen.getByText('Test Field');
    expect(label).toHaveClass('text-destructive');
  });

  it('should apply loading styling to label', () => {
    render(
      <FormField label="Test Field" isLoading>
        <input type="text" />
      </FormField>
    );

    const label = screen.getByText('Test Field');
    expect(label).toHaveClass('opacity-50');
  });
});
