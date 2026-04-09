import { defineConfig, loadEnv, type Connect, type Plugin, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { risepayCreatePix } from './api/lib/risepay-pix-core'

function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function attachRisepayPixMiddleware(
  server: ViteDevServer | PreviewServer,
  getEnv: () => Record<string, string>,
) {
  server.middlewares.use(async (req, res, next) => {
    const pathOnly = req.url?.split('?')[0] ?? ''
    if (pathOnly !== '/api/risepay-pix') return next()

    const setCors = () => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    }

    if (req.method === 'OPTIONS') {
      setCors()
      res.statusCode = 204
      return res.end()
    }

    if (req.method !== 'POST') {
      setCors()
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Method not allowed' }))
    }

    setCors()
    try {
      const raw = await readRequestBody(req)
      const body: unknown = JSON.parse(raw || '{}')
      const env = getEnv()
      const out = await risepayCreatePix(body, {
        RISEPAY_SECRET: env.RISEPAY_SECRET,
        RISEPAY_POSTBACK_URL: env.RISEPAY_POSTBACK_URL,
      })
      res.statusCode = out.status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(out.body))
    } catch (e) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: e instanceof Error ? e.message : 'Erro interno',
        }),
      )
    }
  })
}

function risepayPixPlugin(): Plugin {
  return {
    name: 'risepay-pix-api',
    configureServer(server) {
      attachRisepayPixMiddleware(server, () =>
        loadEnv(server.config.mode, process.cwd(), ''),
      )
    },
    configurePreviewServer(server) {
      attachRisepayPixMiddleware(server, () =>
        loadEnv(server.config.mode, process.cwd(), ''),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), risepayPixPlugin()],
})
