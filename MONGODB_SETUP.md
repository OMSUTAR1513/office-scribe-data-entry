# MongoDB Setup Guide for Office Management System

## Step-by-Step MongoDB Integration

### 1. Create MongoDB Atlas Account (Free)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up for a free account
3. Create a new project called "Office Management"

### 2. Create a Database Cluster

1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "office-cluster")
5. Click "Create Cluster"

### 3. Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

### 5. Get Your Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@office-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Add MongoDB URL to Your Code

#### For Local Development:
1. Create a `.env.local` file in your project root:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@office-cluster.xxxxx.mongodb.net/office_management?retryWrites=true&w=majority
   ```

2. Replace the placeholder in these files:
   - `src/lib/mongodb.ts` (line 4)
   - `api/employees/index.ts` (line 4)
   - `api/employees/[id].ts` (line 4)

   Replace:
   ```typescript
   const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';
   ```
   
   With your actual connection string:
   ```typescript
   const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@office-cluster.xxxxx.mongodb.net/office_management?retryWrites=true&w=majority';
   ```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string
4. Deploy your project

### 7. Database Structure

The system will automatically create the following structure:
- Database: `office_management`
- Collection: `employees`

Each employee document will have:
```json
{
  "_id": "ObjectId",
  "name": "string",
  "phoneNumber": "string", 
  "email": "string",
  "salary": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 8. Testing the Connection

1. Start your development server: `npm run dev`
2. The app will show an error if the database connection fails
3. If successful, you can start adding employees

### 9. Security Best Practices

For production:
1. Use specific IP addresses instead of "Allow Access from Anywhere"
2. Create a dedicated database user with minimal required permissions
3. Use environment variables for all sensitive data
4. Enable MongoDB Atlas advanced security features

### Troubleshooting

**Connection Issues:**
- Verify your username and password
- Check network access settings
- Ensure your IP is whitelisted
- Verify the connection string format

**Common Errors:**
- "MongoNetworkError": Check network access settings
- "Authentication failed": Verify username/password
- "Timeout": Check firewall/network settings

### Free Tier Limitations

MongoDB Atlas free tier includes:
- 512 MB storage
- Shared CPU
- No backup
- Limited to 100 connections

This is sufficient for development and small applications.