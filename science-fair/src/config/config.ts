import { config as envConfig } from "dotenv";
import "reflect-metadata";

const path = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
const { error, parsed } = envConfig({ path });

if (error) {
    throw error;
}

const config = parsed;
export default config;