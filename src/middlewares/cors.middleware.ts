import { config } from '../config/env';

export const corsOption = {
  origin: config.cors.ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTINOS'],
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
};
