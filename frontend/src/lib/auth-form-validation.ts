const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailAddress(value: string) {
  const email = value.trim();

  if (!email) return "Enter your email address to continue.";
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address, such as name@example.com.";
  }

  return "";
}

export function validateRequiredValue(value: string, message: string) {
  return value.trim() ? "" : message;
}

export function validatePassword(value: string, minimumLength = 1) {
  if (!value) return "Enter your password to continue.";
  if (value.length < minimumLength) {
    return `Use at least ${minimumLength} characters so your password is harder to guess.`;
  }

  return "";
}
