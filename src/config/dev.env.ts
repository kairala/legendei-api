import { ENV_TYPE } from './env.type';

export const devEnv: ENV_TYPE = {
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  MONGO_DB_URL: process.env.MONGO_DB_URL!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
};
