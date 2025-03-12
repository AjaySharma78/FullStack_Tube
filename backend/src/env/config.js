import dotenv from "dotenv";
dotenv.config();

const config = {
  databaseUrl: String(process.env.MONGO_DB_URL),
  databaseName: String(process.env.MONGO_DB_NAME),
  clientUrl: String(process.env.CLIENT_CORS_URL),
  clientUrl2: String(process.env.CLIENT_CORS2_URL),
  cloudinaryCloudName: String(process.env.CLOUDINARY_NAME),
  cloudinaryApiKey: String(process.env.CLOUDINARY_API_KEY),
  cloudinaryApiSecret: String(process.env.CLOUDINARY_API_SECRET),
  accessTokenSecret: String(process.env.ACCESS_TOKEN_SECRET),
  refreshTokenSecret: String(process.env.REFRESH_TOKEN_SECRET),
  emailTokenSecret: String(process.env.EMAIL_TOKEN_SECRET),
  accessTokenExpiresIn: String(process.env.ACCESS_TOKEN_EXPIRY),
  refreshTokenExpiresIn: String(process.env.REFRESH_TOKEN_EXPIRY),
  emailTokenExpiresIn: String(process.env.EMAIL_TOKEN_EXPIRY),
  sessonSecret: String(process.env.SESSION_SECRET),
  googleClientId: String(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
  googleCallbackUrl: String(process.env.GOOGLE_CALLBACK_URL),
  googletokenURL: String(process.env.GOOGLE_TOKEN_URL),
  githubClientId: String(process.env.GITHUB_CLIENT_ID),
  githubClientSecret: String(process.env.GITHUB_CLIENT_SECRET),
  githubCallbackUrl: String(process.env.GITHUB_CALLBACK_URL),
  emailID: String(process.env.EMAIL_ID),
  emailPassword: String(process.env.EMAIL_PASSWORD),
  emailPort: String(process.env.EMAIL_PORT),
  port: String(process.env.PORT),
  socketPort: String(process.env.SOCKET_PORT),
  cryptoSecret: String(process.env.CRYPTOJS_SECRET),
};

export default config;
