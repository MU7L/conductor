import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({
      // exclude: ['robotjs']
    })]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/preload/main.ts'),
          mask: resolve(__dirname, 'src/preload/mask.ts'),
        }
      }
    }
  },
  renderer: {
    build: {
      assetsDir: 'src/public',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          mask: resolve(__dirname, 'src/renderer/mask.html')
        }
      }
    }
  }
})
