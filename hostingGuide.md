# Database Hosting Guide (Supabase + pgvector)

Since we want to host the database as we go, **Supabase** is the easiest and most cost-effective way to get a PostgreSQL database with the `pgvector` extension already enabled.

Follow these steps to set up your hosted database:

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a free account.
2. Click **New Project** and select your organization.
3. Give your project a name (e.g., `dataset-analyzer`) and a strong database password. **Save this password somewhere safe.**
4. Choose a region closest to you.
5. Click **Create new project**. (It takes 1-2 minutes to provision the database).

## 2. Get Your Connection String
1. Once the project is active, go to **Project Settings** (the gear icon on the bottom left).
2. Click on **Database** in the sidebar.
3. Scroll down to the **Connection String** section and select **URI**.
4. It will look something like this:
   `postgresql://postgres.yourprojectid:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`
5. Replace `[YOUR-PASSWORD]` with the password you created in step 1.

## 3. Set Up Your Environment Variable
1. In your `worker` folder (or at the root of your project), create a file named `.env`.
2. Add the following line to the `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres.yourprojectid:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres"
   ```

## 4. Run the Schema Migration
1. In the Supabase dashboard, go to the **SQL Editor** (the `<>` icon on the left sidebar).
2. Click **New query**.
3. Open the `db/schema.sql` file we generated earlier, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click **Run**.
5. You should see a success message. Your database is now fully configured with `pgvector` and the required tables!

*(Note: While you are setting this up, our Python scripts will also save local `.csv`/`.pkl` files so we can continue developing without being blocked!)*
