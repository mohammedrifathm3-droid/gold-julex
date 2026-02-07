# Deploying Your Web App to Vercel

Since your application currently uses **SQLite**, which is not supported on Vercel's serverless environment, you must switch to a production-ready database like **PostgreSQL**. Vercel offers a free-tier compatible Postgres database, as does Neon (which powers Vercel Postgres).

Follow these steps carefully to deploy your application.

## Step 1: Prepare Your Database (PostgreSQL)

You cannot use `file:./dev.db` on Vercel. You need a cloud hosted database.

1.  **Create a Neon / Vercel Postgres Database**:
    *   Go to [Vercel](https://vercel.com) and create a new project (see Step 3 below), OR go directly to [Neon.tech](https://neon.tech) and create a free account.
    *   Create a new project/database.
    *   Copy the **Connection String** (it looks like `postgres://user:password@endpoint.neon.tech/neondb...`).

2.  **Update Your Project Locally**:
    *   Open `prisma/schema.prisma`
    *   Change the provider from `"sqlite"` to `"postgresql"`.

    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```

    *   **Delete** your local `prisma/migrations` folder and `dev.db` file (if you want a fresh start), or just be prepared to reset.

3.  **Test Locally (Optional but Recommended)**:
    *   Update your `.env` file with the new `DATABASE_URL` you copied.
    *   Run `npx prisma db push` or `npx prisma migrate dev` to verify the connection.

## Step 2: Push Your Code to GitHub

Vercel deploys directly from your Git repository.

1.  **Initialize Git** (if you haven't already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create a Repository on GitHub**:
    *   Go to [GitHub](https://github.com/new).
    *   Create a new public or private repository.
    *   Follow the instructions to push your code:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        git branch -M main
        git push -u origin main
        ```

## Step 3: Deploy on Vercel

1.  **Log in to Vercel**:
    *   Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2.  **Import Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Find your repository in the list and click **"Import"**.

3.  **Configure Project**:
    *   **Framework Preset**: It should auto-detect "Next.js".
    *   **Root Directory**: Leave as `./`.

4.  **Environment Variables (CRUCIAL)**:
    *   Expand the "Environment Variables" section.
    *   Add the following variables:
        *   `DATABASE_URL`: Paste your PostgreSQL connection string here.
        *   `JWT_SECRET`: A long random string (e.g., enable a password generator).
        *   `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay Key ID.
        *   `RAZORPAY_KEY_ID`: Same as above.
        *   `RAZORPAY_KEY_SECRET`: Your Razorpay Secret.

5.  **Deploy**:
    *   Click **"Deploy"**.
    *   Vercel will build your app. If successful, you will see a "Congratulations!" screen.

## Step 4: Post-Deployment Database Setup

Once deployed, your database is empty. You need to push your schema to the production database.

1.  **Go to your Vercel Project Dashboard**.
2.  Go to the **Settings** tab -> **Build & Development**.
3.  Check the "Build Command". By default it is `next build`.
4.  To ensure your database is always in sync, you can update your `package.json` build script or run a command manually.
    *   **Recommended**: run the migration command from your local machine pointing to the production DB:
        ```bash
        # On your local machine's terminal
        # Temporarily set your local .env DATABASE_URL to your PRODUCTION connection string
        npx prisma db push
        ```
    *   This will create the tables in your live database.

## Troubleshooting

-   **500 Errors**: Check the "Logs" tab in Vercel to see error messages.
-   **Database Connection Errors**: Ensure your database allows connections from "Anywhere" or includes Vercel's IP ranges (Neon usually allows all by default).
-   **Prisma Client Error**: If you see errors about `libquery_engine`, ensure you added `npx prisma generate` to your `build` script in `package.json` (Next.js usually handles this automatically).

**Your Live URL**: Once deployed, Vercel gives you a domain like `your-project.vercel.app`.
