import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 4545,
  jwt_secret: process.env.JWT_SECRET || "your_jwt_secret",
  jwt_expires_in: process.env.JWT_EXPIRES_IN || "30d",
  database: {
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  },
};
