# ⚠️ FIX REQUIRED: Add Your Supabase API Key

## The Error
You're seeing "Invalid API key" because the anon key is not configured.

## How to Fix (2 minutes)

### Step 1: Get your anon key
1. Open: https://supabase.com/dashboard/project/gvmxfwraryjefetbohmi/settings/api
2. Look for "Project API keys"
3. Copy the **anon** key (the one labeled "anon" and "public")
   - It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Update the environment file
Open: `src/environments/environment.ts`

Replace this:
```typescript
supabaseKey: 'YOUR_ANON_KEY_HERE'
```

With your actual key:
```typescript
supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...'
```

### Step 3: Save and refresh
The app will automatically reload. Try creating an account again!

---

## Also Don't Forget: Create Database Tables!
1. Go to: https://supabase.com/dashboard/project/gvmxfwraryjefetbohmi/sql/new
2. Copy ALL content from `supabase-schema.sql` (in project root)
3. Click "Run" to create the tables
