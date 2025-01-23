declare namespace NodeJS {
  interface ProcessEnv {
    GIST_ID: string
    GIST_TOKEN: string
    ACCESS_USERNAME: string
    ACCESS_PASSWORD: string
    ACCESS_2FA_SECRET: string
    JWT_SECRET: string
    JWT_EXPIRES_IN: string
  }
}
