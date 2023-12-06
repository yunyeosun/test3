import { loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {  
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            kakaoApiKey: env.VITE_KAKAO_API_KEY
          }
        }
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
}