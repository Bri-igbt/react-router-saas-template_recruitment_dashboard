# Welcome to React Router!

TODO:
- login confirmation is visited and user exists
- login confirmation route is visited, but user doesn't exist
- register confirmation is visited, but user exists
- register confirmation is visited and doesn't exists
- login / register forms recover for invalid input



A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

This template includes three Dockerfiles optimized for different package managers:

- `Dockerfile` - for npm
- `Dockerfile.pnpm` - for pnpm
- `Dockerfile.bun` - for bun

To build and run using Docker:

```bash
# For npm
docker build -t my-app .

# For pnpm
docker build -f Dockerfile.pnpm -t my-app .

# For bun
docker build -f Dockerfile.bun -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.


---

## Supabase

I apologize for the confusion. You're absolutely right—my previous response didn't directly address the specific URL configuration page you mentioned. Let's focus on configuring the Site URL correctly under `https://supabase.com/dashboard/project/[your-project-ref]/auth/url-configuration` in the Supabase Dashboard.

### Configuring Site URL at the Correct Location

Here’s how to set the Site URL under **URL Configuration** for your Supabase project:

1. **Access the Supabase Dashboard**:
   - Go to `https://supabase.com/dashboard/`.
2. **Navigate to URL Configuration**:
   - In the left sidebar, click **Authentication**.
   - Then select **URL Configuration** (the direct URL would be `https://supabase.com/dashboard/project/[your-project-ref]/auth/url-configuration`).
3. **Set the Site URL**:
   - On the **URL Configuration** page, you'll see a field labeled **Site URL**.
   - Enter your application's base URL here (e.g., `https://yourapp.com` or `http://localhost:3000` for local development).
   - This is the base URL that Supabase will use as the `{{ .SiteURL }}` variable in your email templates (like the magic link template you provided).
4. **Save the Configuration**:
   - Click **Save** or the equivalent button to apply your changes.


Next, configure the email templates by clicking on **Emails** then on **Confirm Sign Up** (under `https://supabase.com/dashboard/project/[your-project-ref]/auth/templates`) in the Supabase Dashboard.

```html
<h2>Create Your Account For The React Router Starter App</h2>

<p>Follow this link to register:</p>
<p><a href="{{ .SiteURL }}/register/confirm?token_hash={{ .TokenHash }}&type=email">Sign Up</a></p>
```

Next, configure the email templates by clicking on **Emails** then on **Magic Link** (under `https://supabase.com/dashboard/project/[your-project-ref]/auth/templates`) in the Supabase Dashboard.

```html
<h2>Log In To The React Router Starter App</h2>

<p>Follow this link to login:</p>
<p><a href="{{ .SiteURL }}/login/confirm?token_hash={{ .TokenHash }}&type=email">Log In</a></p>
```


Click **Save Changes** to apply your changes.

This code base is now setting up everything for Supabase. But if you want to handle your own sessions, you can still check out the archived French House Stack, which still maintains the code for your own custom sessions with cookie based auth.