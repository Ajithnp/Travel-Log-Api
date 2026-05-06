import { MongoServerError } from 'types/errors';

const FIELD_LABELS: Record<string, string> = {
  phone: 'Phone number',
  email: 'Email address',
  username: 'Username',
};

export const handleMongoDuplicateError = (
  err: MongoServerError,
): { message: string; errorCode: string } => {
  const duplicatedField = Object.keys(err.keyPattern)[0] ?? 'Field';
  const label = FIELD_LABELS[duplicatedField] ?? 'This value';

  return {
    message: `${label} is already registered.`,
    errorCode: 'DUPLICATE_FIELD',
  };
};
