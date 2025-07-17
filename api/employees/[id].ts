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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('employees');

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid employee ID format' });
    }

    const objectId = new ObjectId(id);

    switch (req.method) {
      case 'GET':
        // Get single employee
        const employee = await collection.findOne({ _id: objectId });
        
        if (!employee) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        return res.status(200).json(employee);

      case 'PUT':
        // Update employee
        const { name, phoneNumber, email, salary } = req.body;

        if (!name || !phoneNumber || !email || !salary) {
          return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if employee exists
        const existingEmployee = await collection.findOne({ _id: objectId });
        if (!existingEmployee) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if email already exists for another employee
        const emailExists = await collection.findOne({ 
          email, 
          _id: { $ne: objectId } 
        });
        if (emailExists) {
          return res.status(400).json({ error: 'Employee with this email already exists' });
        }

        const updateData = {
          name,
          phoneNumber,
          email,
          salary: Number(salary),
          updatedAt: new Date(),
        };

        await collection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );

        const updatedEmployee = await collection.findOne({ _id: objectId });
        return res.status(200).json(updatedEmployee);

      case 'DELETE':
        // Delete employee
        const deleteResult = await collection.deleteOne({ _id: objectId });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        return res.status(200).json({ message: 'Employee deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}