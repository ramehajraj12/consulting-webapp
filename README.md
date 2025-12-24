This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## SPSS TALK (document-aware chat)

### Environment variables
- `OPENAI_API_KEY` (required) – set this locally in `.env.local` and in Vercel Project Settings → Environment Variables.
- `OPENAI_MODEL` (optional) – defaults to `gpt-4.1-mini`.

### Run locally
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open http://localhost:3000

### Quick API test
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"documentContext":{"enabled":false,"docName":"","docType":"","text":""}}'
```

### Deploy to Vercel
1. Add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in Vercel → Project Settings → Environment Variables.
2. Redeploy the project so the API picks up the keys.
3. The frontend uses a relative `/api/chat` call so it works on both localhost and Vercel.
