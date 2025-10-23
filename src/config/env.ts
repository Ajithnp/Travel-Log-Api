import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${value} is missing in .env file`);
  }
  return value;
}

export const config = {
  server: {
    PORT: parseInt(process.env.PORT || '3000', 10),
    HOST: process.env.HOST || 'localhost',
  },

  database: {
    DB_URL: requireEnv('DB_URL'),
  },
  cors: {
    ALLOWED_ORIGINS: requireEnv('ALLOW_ORIGIN'),
  },

  nodeMailer: {
    EMAIL_HOST: requireEnv('EMAIL_USER'),
    EMAIL_PASSWORD: requireEnv('EMAIL_PASSWORD'),
  },

  jwt: {
    ACCESS_TOKEN_SECRET: requireEnv('ACCESS_TOKEN_SECRET'),
    REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET'),
  },

  googleAuth: {
    CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
    CLIENT_SECRET: requireEnv('GOOGLE_CLIENT_SECRET'),
  },

  cloudinary: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

  aws: {
    AWS_BUCKET_NAME: requireEnv('AWS_BUCKET_NAME'),
    AWS_REGION: requireEnv('AWS_REGION'),
    AWS_ACCESS_KEY_ID: requireEnv('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: requireEnv('AWS_SECRET_ACCESS_KEY'),
  },

  redis: {
    REDIS_URL: requireEnv('REDIS_URL'),
  },

  otp: {
    OTP_SECRET: requireEnv('OTP_SECRET'),
  },
  password: {
    SALT_ROUNDS: requireEnv('BCRYPT_SALT_ROUNDS'),
    PASSWORD_HASH_SECRET: requireEnv('PASSWORD_HASH_SECRET'),
  },
};
