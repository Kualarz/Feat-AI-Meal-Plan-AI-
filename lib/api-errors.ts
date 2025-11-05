/**
 * Standardized API error response handler
 * Provides consistent error responses across all endpoints
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const ErrorMessages = {
  // Validation errors
  MISSING_REQUIRED_FIELD: (field: string) => `Missing required field: ${field}`,
  INVALID_FORMAT: (field: string, format: string) => `Invalid ${field} format. Expected: ${format}`,
  INVALID_JSON: 'Invalid JSON format in request body',

  // Auth errors
  AUTH_MISSING_CREDENTIALS: 'Email and password are required',
  AUTH_USER_NOT_FOUND: 'User not found',
  AUTH_INVALID_PASSWORD: 'Invalid email or password',
  AUTH_USER_EXISTS: 'User with this email already exists',
  AUTH_WEAK_PASSWORD: 'Password must be at least 8 characters',

  // Recipe errors
  RECIPE_NOT_FOUND: 'Recipe not found',
  RECIPE_TITLE_REQUIRED: 'Recipe title is required',
  RECIPE_CUISINE_REQUIRED: 'Cuisine is required',
  RECIPE_INGREDIENTS_REQUIRED: 'At least one ingredient is required',
  RECIPE_STEPS_REQUIRED: 'Cooking steps are required',
  RECIPE_IMPORT_INVALID_URL: 'Invalid recipe URL provided',
  RECIPE_IMPORT_NO_SCHEMA: 'Could not find recipe data on this page',

  // Plan errors
  PLAN_NOT_FOUND: 'Meal plan not found',
  PLAN_MEAL_INVALID_DATE: 'Invalid date format. Use YYYY-MM-DD',
  PLAN_MEAL_INVALID_SLOT: 'Invalid meal slot. Must be breakfast, lunch, dinner, or dessert',
  PLAN_MEAL_RECIPE_NOT_FOUND: 'Recipe not found. Cannot add to plan',

  // Grocery errors
  GROCERY_PLAN_REQUIRED: 'planId parameter is required',

  // AI errors
  AI_NO_API_KEY: 'AI service not configured. Please set ANTHROPIC_API_KEY environment variable',
  AI_API_ERROR: 'AI service error. Please try again later',
  AI_RATE_LIMITED: 'Too many requests to AI service. Please wait a moment and try again',
  AI_INVALID_RESPONSE: 'AI service returned invalid response',
  AI_LEFTOVERS_EMPTY: 'Please provide at least one leftover ingredient',

  // Database errors
  DB_CONNECTION_ERROR: 'Database connection error. Please try again later',
  DB_QUERY_ERROR: 'Database query failed. Please try again later',

  // Generic errors
  INTERNAL_SERVER_ERROR: 'Internal server error. Please try again later',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Access forbidden',
};

export function createErrorResponse(
  statusCode: number,
  message: string,
  details?: string
) {
  return {
    success: false,
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
}

export function handleAPIError(error: unknown, defaultMessage: string = ErrorMessages.INTERNAL_SERVER_ERROR) {
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    return {
      statusCode: error.statusCode,
      response: createErrorResponse(error.statusCode, error.message, error.details),
    };
  }

  if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      response: createErrorResponse(400, ErrorMessages.INVALID_JSON),
    };
  }

  if (error instanceof Error) {
    const message = error.message;

    // Database connection errors
    if (message.includes('ECONNREFUSED') || message.includes('database')) {
      return {
        statusCode: 503,
        response: createErrorResponse(503, ErrorMessages.DB_CONNECTION_ERROR, message),
      };
    }

    // AI service errors
    if (message.includes('API key') || message.includes('ANTHROPIC')) {
      return {
        statusCode: 500,
        response: createErrorResponse(500, ErrorMessages.AI_NO_API_KEY),
      };
    }

    if (message.includes('rate_limit') || message.includes('429')) {
      return {
        statusCode: 429,
        response: createErrorResponse(429, ErrorMessages.AI_RATE_LIMITED),
      };
    }

    // Generic error with message
    return {
      statusCode: 500,
      response: createErrorResponse(500, defaultMessage, message),
    };
  }

  return {
    statusCode: 500,
    response: createErrorResponse(500, defaultMessage),
  };
}
