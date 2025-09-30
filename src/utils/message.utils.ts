// todo: move this constant into constants folder and capitalize the keys

const MESSAGE_UTILS = {
  SERVER_ERROR: "Internal Server Error",
  VALIDATION_ERRORS: "Validation Errors",
  REQUIRED_FIELD: "This field is required",
} as const;

export type MessageKey = keyof typeof MESSAGE_UTILS;

export default MESSAGE_UTILS;
