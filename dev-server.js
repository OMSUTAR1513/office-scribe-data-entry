// Simple development server for testing API routes locally
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Replace this with your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://OM:12345@cluster0.dhueqa9.mongodb.net/office_management?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'office_management';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// GET /api/employees - Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('employees');
    
    const employees = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(employees);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees - Create new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, phoneNumber, email, salary } = req.body;

    if (!name || !phoneNumber || !email || !salary) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('employees');

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

    res.status(201).json(createdEmployee);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:id - Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, email, salary } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid employee ID format' });
    }

    if (!name || !phoneNumber || !email || !salary) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('employees');

    const objectId = new ObjectId(id);

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
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees/:id - Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid employee ID format' });
    }

    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection('employees');

    const objectId = new ObjectId(id);
    const deleteResult = await collection.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
  console.log('Make sure your MongoDB connection string is set!');
});