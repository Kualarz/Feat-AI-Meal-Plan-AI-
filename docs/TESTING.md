# Testing Guide - Feast AI

Comprehensive testing setup for unit tests, integration tests, and E2E tests.

## Test Structure

```
project/
├── __tests__/                 # Unit and integration tests
│   ├── lib/
│   │   ├── auth.test.ts      # Auth utility tests
│   │   └── rate-limit.test.ts # Rate limiting tests
│   └── api/
│       └── health.test.ts     # Health check tests
├── e2e/                        # E2E tests with Playwright
│   ├── auth.spec.ts           # Authentication flows
│   └── recipes.spec.ts        # Recipe page flows
├── jest.config.js             # Jest configuration
├── jest.setup.js              # Jest setup and mocks
└── playwright.config.ts       # Playwright configuration
```

## Running Tests

### Unit Tests (Jest)

Jest runs all unit and integration tests in `__tests__/` directory only. E2E tests are excluded from Jest configuration.

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.test.ts

# Generate coverage report
npm test -- --coverage
```

**Note**: Jest automatically ignores E2E tests in the `e2e/` folder.

### E2E Tests (Playwright)

E2E tests are run with Playwright test runner and are kept separate from unit tests.

```bash
# Run E2E tests (Playwright automatically starts dev server)
npm run test:e2e

# Run in headed mode (see browser while testing)
npm run test:e2e -- --headed

# Run specific browser
npm run test:e2e -- --project=chromium

# Debug tests interactively
npm run test:e2e -- --debug

# View test report in HTML
npm run test:e2e -- --reporter=html
```

**Key Features**:
- Automatically starts dev server (configured in `playwright.config.ts`)
- Tests multiple browsers: Chromium, Firefox, WebKit
- Mobile viewport testing included
- Separate from Jest configuration - no conflicts

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all

# Run with coverage
npm run test:coverage
```

## Test Categories

### Unit Tests

**Purpose**: Test individual functions and utilities in isolation.

**Location**: `__tests__/lib/`

**Examples**:
- `auth.test.ts` - Password hashing, JWT tokens, email validation
- `rate-limit.test.ts` - Rate limiting behavior

**Run**: `npm test -- __tests__/lib/`

### Integration Tests

**Purpose**: Test API endpoints and their responses.

**Location**: `__tests__/api/`

**Examples**:
- `health.test.ts` - Health check endpoint

**Run**: `npm test -- __tests__/api/`

### E2E Tests

**Purpose**: Test complete user flows through the browser.

**Location**: `e2e/`

**Examples**:
- `auth.spec.ts` - Signup, signin, guest mode flows
- `recipes.spec.ts` - Recipe browsing and filtering

**Run**: `npm run test:e2e`

## Test Coverage

View test coverage report:

```bash
npm test -- --coverage
```

Coverage summary is printed to console. Detailed HTML report in `coverage/` directory.

**Coverage Thresholds**:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

To improve coverage, add tests for untested code paths.

## Writing Tests

### Unit Test Example

```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = someFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Test Example

```typescript
test('should complete user flow', async ({ page }) => {
  // Navigate
  await page.goto('/path');

  // Interact
  await page.fill('input[name="field"]', 'value');
  await page.click('button:has-text("Submit")');

  // Assert
  await expect(page).toHaveURL('/new-path');
});
```

## Test Data & Mocking

### Environment Variables

Tests use mocked environment variables from `jest.setup.js`:
- `JWT_SECRET` - Test key for JWT validation
- `DATABASE_URL` - Test database URL
- `ANTHROPIC_API_KEY` - Test API key

### Database Mocking

For API tests requiring database access, mock Prisma:

```typescript
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

### API Mocking

For tests requiring external API calls, use MSW (Mock Service Worker):

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/endpoint', () => {
    return HttpResponse.json({ data: 'mocked' });
  })
);
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to main/master/develop branches
- Pull requests

See `.github/workflows/ci.yml` for configuration.

### Running Tests Locally Before Commit

```bash
# Run all tests
npm run test:all

# If tests pass, commit changes
git commit -m "message"
```

## Troubleshooting

### Tests Fail with "Cannot find module"

**Solution**:
```bash
npm install
npm test
```

### E2E Tests Fail - "Browser not found"

**Solution**:
```bash
npx playwright install
npm run test:e2e
```

### Tests Timeout

**Solution**: Increase timeout in test:
```typescript
test('slow test', async ({ page }) => {
  // test code
}, { timeout: 30000 }); // 30 seconds
```

### Database Connection Error in Tests

**Solution**: Tests use mocked database. If real database needed:
```typescript
beforeAll(async () => {
  // Connect to test database
  await connectTestDB();
});

afterAll(async () => {
  // Cleanup
  await disconnectTestDB();
});
```

## Best Practices

1. **Test Names**: Use descriptive names
   - ✅ `should validate email format correctly`
   - ❌ `test email`

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   it('should...', () => {
     // Arrange: Set up test data
     // Act: Execute function
     // Assert: Verify results
   });
   ```

3. **DRY**: Use beforeEach for common setup
   ```typescript
   beforeEach(() => {
     // Common setup
   });
   ```

4. **Isolation**: Tests should be independent
   - Don't rely on test execution order
   - Don't share state between tests

5. **Mock External Services**: Don't call real APIs in tests
   - Mock Anthropic API
   - Mock Supabase
   - Mock external services

## Performance

**Optimize test speed**:
- Run tests in parallel (Jest default)
- Use `--maxWorkers` for CI: `npm test -- --maxWorkers=1`
- Mock slow operations
- Use `test.only` to focus on specific tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)
