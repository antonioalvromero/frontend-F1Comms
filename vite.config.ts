import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const REPO_NAME = 'frontend-F1Comms';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/frontend-F1Comms/`,
})
