/**
 * Single source of truth for the "industry" field, shared by onboarding and
 * Brand Profile. They used to diverge — onboarding took free text while
 * Brand Profile rendered a fixed dropdown with lowercased option values — so
 * a value saved on one screen wouldn't show as selected on the other.
 */
export const INDUSTRIES = [
  'E-commerce',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Food & Beverage',
  'Fashion',
  'Travel',
  'Real Estate',
  'Entertainment',
  'Sports',
  'Non-Profit',
  'Other',
] as const;
