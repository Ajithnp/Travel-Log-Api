import dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';
dotenv.config();

export const config = {
    server: {
        PORT: parseInt(process.env.PORT || "3000", 10),
        HOST: process.env.HOST || 'localhost',
    },

    database: {
        DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/travel_log',
    },
    cors: {
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:3005"
    },

    nodeMailer: {
        EMAIL_HOST: process.env.EMAIL_USER ,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    },

    jwt: {
     ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET",
     REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "REFRESH_TOKEN_SECRET",
     EMAIL_TOKEN_SECRET: process.env.EMAIL_TOKEN_SECRET || "EMAIL_TOKEN_SECRET",
     PASSWORD_TOKEN_SECRET: process.env. PASSWORD_TOKEN_SECRET || " PASSWORD_TOKEN_SECRET"
   },

   googleAuth: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
   },

   cloudinary :{
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env. CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
   },

   redis :{
      REDIS_URL: process.env.REDIS_URL
   }


}