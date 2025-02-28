import { config } from "dotenv";
export const getEnvConfig = () => (process.env.NODE_ENV === 'development' ? '.env' : '/etc/config/.env')
config({ path: getEnvConfig() });

export default {
  HOST: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://coolmovie-server.koijinoblog.com',
}