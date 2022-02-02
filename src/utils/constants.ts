import dotenv from 'dotenv'
import { decrypt_key } from '../../config.json'
dotenv.config()
/* eslint-disable @typescript-eslint/naming-convention */
export const __prod__ = process.env.NODE_ENV === 'production'
export const __pwencription__ = process.env.DECRIPT_KEY ?? decrypt_key
