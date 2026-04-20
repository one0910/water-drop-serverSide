export const getEnvConfig = () => (process.env.NODE_ENV === 'development' ? '.env' : '/etc/config/.env')

export default {
  HOST: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://coolmovie-server.koijinoblog.com',
}