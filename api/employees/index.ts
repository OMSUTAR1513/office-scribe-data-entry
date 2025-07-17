import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

// Replace this with your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';
const DB_NAME = 'office_management';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('employees');

    switch (req.method) {
      case 'GET':
        // Get all employees
        const employees = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(employees);

      case 'POST':
        // Create new employee
        const { name, phoneNumber, email, salary } = req.body;

        if (!name || !phoneNumber || !email || !salary) {
          return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists
        const existingEmployee = await collection.findOne({ email });
        if (existingEmployee) {
          return res.status(400).json({ error: 'Employee with this email already exists' });
        }

        const newEmployee = {
          name,
          phoneNumber,
          email,
          salary: Number(salary),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await collection.insertOne(newEmployee);
        const createdEmployee = await collection.findOne({ _id: result.insertedId });

        return res.status(201).json(createdEmployee);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}