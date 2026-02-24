# Sandstone Test Suite

Comprehensive testing suite for the Sandstone application using Jest and React Testing Library.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Overview

This test suite provides:

- **Unit Tests** for utility functions
- **Hook Tests** for custom React hooks
- **Component Tests** for React components
- **Integration Tests** for complex interactions
- **Coverage Reporting** with threshold enforcement

## Setup

### Installation

```bash
# Navigate to the tests directory
cd tests

# Install dependencies
npm install
```

### Configuration

The test suite is configured via:

- `jest.config.js` - Jest configuration
- `jest.setup.ts` - Test environment setup
- `tsconfig.json` - TypeScript configuration

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Specific Test Categories

```bash
# Test hooks only
npm run test:hooks

# Test components only
npm run test:components

# Test utilities only
npm run test:utils
```

### CI Mode

```bash
npm run test:ci
```

## Test Structure

```
tests/
├── __mocks__/           # Mock implementations
│   └── fileMock.js      # Static file mock
├── components/          # Component tests
│   └── FormField.test.tsx
├── hooks/               # Hook tests
│   ├── useToggle.test.ts
│   ├── useDebounce.test.ts
│   ├── useLocalStorage.test.ts
│   ├── usePrevious.test.ts
│   ├── useMounted.test.ts
│   ├── useAsync.test.ts
│   └── useCopyToClipboard.test.ts
├── lib/                 # Utility tests
│   └── utils/
│       ├── string.test.ts
│       ├── date.test.ts
│       ├── number.test.ts
│       └── index.test.ts
├── utils/               # Test utilities
│   └── test-utils.tsx   # Custom render functions
├── index.ts             # Test utilities export
├── jest.config.js       # Jest configuration
├── jest.setup.ts        # Test setup
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── README.md            # This file
```

## Writing Tests

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../../../hooks/useToggle';

describe('useToggle', () => {
  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(true);
  });
});
```

### Component Tests

```typescript
import { render, screen } from '../utils/test-utils';
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
});
```

### Utility Tests

```typescript
import { truncate } from '../../../../lib/utils/string';

describe('truncate', () => {
  it('should truncate string', () => {
    expect(truncate('Hello World', { length: 5 })).toBe('He...');
  });
});
```

## Coverage

Coverage thresholds are configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
},
```

Coverage reports are generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI integration

## Best Practices

### 1. Test Organization

- Group related tests with `describe` blocks
- Use clear, descriptive test names
- Follow the Arrange-Act-Assert pattern

### 2. Mocking

- Mock external dependencies
- Use `jest.mock` for module mocks
- Reset mocks between tests with `jest.clearAllMocks()`

### 3. Async Testing

- Use `waitFor` for async assertions
- Use `act` for state updates
- Handle promises properly

### 4. Accessibility

- Test with `screen.getByRole` when possible
- Verify ARIA attributes
- Test keyboard interactions

### 5. Test Utilities

Use the custom utilities from `test-utils.tsx`:

```typescript
import { render, userEvent, createTestUser } from '../utils/test-utils';
```

## Troubleshooting

### Common Issues

1. **Module not found**: Check path aliases in `jest.config.js`
2. **TypeScript errors**: Ensure `tsconfig.json` is properly configured
3. **Mock not working**: Verify mock is defined before imports

### Debug Mode

```bash
# Run with verbose output
npm run test:verbose

# Run specific test file
npm test -- hooks/useToggle.test.ts

# Run with coverage for specific file
npm run test:coverage -- --collectCoverageFrom="hooks/useToggle.ts"
```

## Contributing

When adding new tests:

1. Follow the existing file structure
2. Use descriptive test names
3. Add tests for edge cases
4. Update this README if needed
5. Ensure coverage thresholds are met

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
