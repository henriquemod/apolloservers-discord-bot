import dotenv from 'dotenv'
dotenv.config()
/* eslint-disable @typescript-eslint/naming-convention */
export const __prod__ = process.env.NODE_ENV === 'production'
export const __pwencription__ = process.env.DECRIPT_KEY
