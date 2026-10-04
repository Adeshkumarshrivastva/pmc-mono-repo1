# PMC Mono Repo

A monorepo for the Positive Mind Care (PMC) platform, built with modern web technologies and deployed on AWS using SST.

## Projects

This monorepo contains the following applications:

- **Portal** - Admin/user portal built with React, Vite, and TanStack Router
- **Landing Page** - Public-facing website built with Next.js and PayloadCMS
- **PMC Server** - Backend API built with Hono and Prisma

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Infrastructure**: SST (Serverless Stack) v3
- **Package Manager**: pnpm 10.12.1
- **Node**: 18.20.2 or >=20.9.0
- **TypeScript**: 5.8.3
- **Database**: MongoDB (via Prisma)
- **Cloud**: AWS (Lambda, S3, SES, CloudFront)

## Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Node.js** - Version 18.20.2 or >=20.9.0
   ```bash
   node --version
   ```

2. **pnpm** - Version 9 or 10 (specifically 10.12.1 recommended)
   ```bash
   npm install -g pnpm@10.12.1
   pnpm --version
   ```

3. **AWS CLI** - For deployment and SST operations
   ```bash
   aws --version
   ```
   Configure AWS credentials:
   ```bash
   aws configure
   ```

4. **MongoDB** - Either local instance or MongoDB Atlas account
   - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pmc-mono-repo
```

### 2. Install Dependencies

Install all dependencies for the monorepo and all packages:

```bash
pnpm install
```

This will install dependencies for:
- Root workspace
- Portal app
- Landing page app
- Server app
- Config package

### 3. Environment Variables Setup

You need to set up environment variables for different parts of the application.

#### SST Secrets (Required for deployment)

SST uses secrets for sensitive data. Set them using the SST CLI:

```bash
# Authentication
pnpm sst secret set BETTER_AUTH_SECRET <your-secret>
pnpm sst secret set JWT_SECRET <your-jwt-secret>

# Database
pnpm sst secret set DATABASE_URL <your-mongodb-url>
pnpm sst secret set PAYLOAD_DB_URL <your-payload-mongodb-url>

# OAuth
pnpm sst secret set GOOGLE_CLIENT_ID <your-google-client-id>
pnpm sst secret set GOOGLE_CLIENT_SECRET <your-google-client-secret>

# Payment (Razorpay)
pnpm sst secret set RAZORPAY_KEY_ID <your-razorpay-key-id>
pnpm sst secret set RAZORPAY_KEY_SECRET <your-razorpay-key-secret>

# WhatsApp
pnpm sst secret set WHATSAPP_API_KEY_SECRET <your-whatsapp-api-key>
pnpm sst secret set WHATSAPP_LICENCE_NUMBER_SECRET <your-licence-number>
pnpm sst secret set WHATSAPP_TEST_NUMBER_SECRET <your-test-number>

# Google Calendar
pnpm sst secret set GOOGLE_SERVICE_ACCOUNT_EMAIL <your-service-account-email>
pnpm sst secret set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY <your-private-key>
pnpm sst secret set GOOGLE_CALENDAR_EMAIL <your-calendar-email>

# SMS Service
pnpm sst secret set SMS_API_BASE_URL <your-sms-api-base-url>
pnpm sst secret set SMS_UNAME <your-sms-uname>
pnpm sst secret set SMS_PASS <your-sms-pass>
pnpm sst secret set SMS_SENDER_ID <your-sms-sender-id>

# Payload CMS
pnpm sst secret set PAYLOAD_SECRET <your-payload-secret>

# Browserless (for PDF generation)
pnpm sst secret set BROWSERLESS_WS_ENDPOINT <your-browserless-endpoint>
```

#### Local Development Environment Files

Create environment files for local development:

**apps/server/.env**
```env
DATABASE_URL=mongodb://localhost:27017/pmc-mono-repo?retryWrites=true&w=majority
SEED_ALL=true
```

**apps/landing-page/.env**
```env
PAYLOAD_DB_URL=mongodb://localhost:27017/pmc-landing-page?retryWrites=true&w=majority
PAYLOAD_SECRET=your-payload-secret-here
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
PAYLOAD_BUCKET=
```

### 4. Database Setup

#### Set up Prisma (Server App)

Navigate to the server app and set up the database:

```bash
cd apps/server

# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm db:push

# (Optional) Seed the database with initial data
pnpm db:seed

cd ../..
```

#### Set up PayloadCMS (Landing Page)

PayloadCMS will automatically create collections on first run. Make sure your MongoDB connection is working.

### 5. Start Development

You can start all apps in development mode:

```bash
# Start all apps concurrently
pnpm dev
```

Or start individual apps:

```bash
# Portal only (runs on default Vite port, usually 5173)
pnpm --filter=@pmc/portal dev

# Landing page only (runs on port 3001)
pnpm --filter=@pmc/landing-page dev

# Server only (with SST)
pnpm sst dev
```

### 6. Access the Applications

Once running, you can access:

- **Portal**: http://localhost:5173 (or the port shown in terminal)
- **Landing Page**: http://localhost:3001
- **Server API**: Check SST console output for the Lambda function URL

## Building for Production

### Build All Apps

```bash
pnpm build
```

This runs the build process for all apps using Turborepo.

### Build Individual Apps

```bash
# Build portal
pnpm --filter=@pmc/portal build

# Build landing page
pnpm --filter=@pmc/landing-page build

# Build server
pnpm --filter=@pmc/server build
```

## Deployment

This project uses SST for deployment to AWS.

### Deploy to Development Stage

```bash
pnpm sst deploy --stage development
```

### Deploy to Production

```bash
pnpm sst deploy --stage production
```

The production deployment will use:
- Domain: positivemindcare.com
- Redirect: www.positivemindcare.com

The development/staging deployment will use:
- Domain: staging.positivemindcare.com
- Redirect: www.staging.positivemindcare.com

## Common Commands

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all apps
pnpm build

# Lint all code
pnpm lint

# Format all code
pnpm format

# Clean all node_modules
pnpm clean

# Database commands (in apps/server)
cd apps/server
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed database
pnpm prisma generate  # Generate Prisma client
pnpm prisma studio    # Open Prisma Studio
```

## Project Structure

```
pmc-mono-repo/
├── apps/
│   ├── landing-page/     # Next.js + PayloadCMS
│   ├── portal/           # React + Vite + TanStack Router
│   └── server/           # Hono + Prisma
├── packages/
│   └── config/           # Shared configuration
├── sst.config.ts         # SST infrastructure config
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package.json
```

## Troubleshooting

### pnpm installation issues

If you encounter issues with pnpm, ensure you're using the correct version:
```bash
pnpm --version  # Should be 10.12.1
npm install -g pnpm@10.12.1
```

### Prisma client errors

If you get Prisma client errors, regenerate the client:
```bash
cd apps/server
pnpm prisma generate
```

### Port already in use

If a port is already in use, you can:
- Kill the process using that port
- Change the port in the respective app's configuration

### SST deployment issues

Make sure:
- AWS credentials are configured correctly
- You have the necessary AWS permissions
- SST secrets are set for the stage you're deploying to

### Database connection issues

- Ensure MongoDB is running (if using local)
- Check your DATABASE_URL format
- Verify network access in MongoDB Atlas (if using cloud)

## Additional Resources

- [SST Documentation](https://sst.dev)
- [Turborepo Documentation](https://turbo.build/repo)
- [pnpm Documentation](https://pnpm.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [Hono Documentation](https://hono.dev)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm format`
4. Test your changes locally
5. Create a pull request

## License

[Add your license here]
