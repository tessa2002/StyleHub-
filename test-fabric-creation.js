const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Fabric = require('./backend/models/Fabric');

async function testFabricCreation() {
  try {
    console.log('🧪 Testing fabric creation...');
    
    // Test 1: Create minimal fabric
    const testFabric = new Fabric({
      name: 'Test Fabric',
      material: 'Test Material',
      color: 'Blue',
      price: 100,
      stock: 25,
      unit: 'm',
      category: 'other',
      createdBy: new mongoose.Types.ObjectId() // Dummy ObjectId
    });
    
    console.log('📋 Test fabric data:', {
      name: testFabric.name,
      material: testFabric.material,
      color: testFabric.color,
      price: testFabric.price,
      stock: testFabric.stock,
      unit: testFabric.unit,
      category: testFabric.category
    });
    
    // Validate without saving
    const validationError = testFabric.validateSync();
    if (validationError) {
      console.error('❌ Validation error:', validationError.message);
      console.error('📋 Validation details:', validationError.errors);
    } else {
      console.log('✅ Fabric validation passed');
    }
    
    // Try to save
    await testFabric.save();
    console.log('✅ Fabric saved successfully with ID:', testFabric._id);
    
    // Clean up - delete the test fabric
    await Fabric.findByIdAndDelete(testFabric._id);
    console.log('🧹 Test fabric cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing fabric creation:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFabricCreation();