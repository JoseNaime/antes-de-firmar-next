# Netlify Deployment Guide

## Prerequisites

1. Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Have a Netlify account (free tier available)

## Deployment Steps

### 1. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider and authorize Netlify
4. Select your repository

### 2. Configure Build Settings

Netlify should automatically detect these settings from your `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 3. Set Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_TEMPO=your_tempo_key
```

### 4. Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your site
3. Your site will be available at a Netlify subdomain (e.g., `your-app-name.netlify.app`)

### 5. Custom Domain (Optional)

1. Go to **Domain settings** in your Netlify dashboard
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Environment Variables

Make sure to set these in your Netlify dashboard:

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional Variables
- `NEXT_PUBLIC_TEMPO`

## Troubleshooting

### Common Issues

1. **Build fails**: Check the build logs in Netlify dashboard
2. **Environment variables not working**: Ensure they're set in Netlify dashboard
3. **API routes not working**: The `@netlify/plugin-nextjs` handles this automatically

### Local Testing

Test your build locally before deploying:

```bash
npm run build
```

## Continuous Deployment

Once connected to Git, Netlify will automatically:
- Deploy when you push to the main branch
- Create preview deployments for pull requests
- Rollback to previous deployments if needed

## Performance Optimization

1. **Image Optimization**: Your images are configured to use Unsplash domain
2. **Static Generation**: Next.js will pre-render pages where possible
3. **CDN**: Netlify provides global CDN for fast loading

## Security

1. Never commit `.env.local` files
2. Use environment variables in Netlify dashboard
3. Keep your Supabase keys secure 