const mongoose = require('mongoose');
const Fabric = require('../models/Fabric');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

const dummyFabrics = [
  {
    name: "Premium Cotton Shirt Fabric",
    material: "100% Cotton",
    color: "White",
    pattern: "Solid",
    price: 250,
    stock: 50,
    unit: "meters",
    category: "cotton",
    description: "High-quality cotton fabric perfect for formal shirts",
    lowStockThreshold: 10,
    supplier: {
      name: "Textile World",
      contact: "+91-9876543210",
      address: "Mumbai, Maharashtra"
    }
  },
  {
    name: "Silk Saree Fabric",
    material: "Pure Silk",
    color: "Red",
    pattern: "Floral",
    price: 800,
    stock: 25,
    unit: "meters",
    category: "silk",
    description: "Luxurious silk fabric with beautiful floral patterns",
    lowStockThreshold: 5,
    supplier: {
      name: "Silk Palace",
      contact: "+91-9876543211",
      address: "Kolkata, West Bengal"
    }
  },
  {
    name: "Denim Jeans Fabric",
    material: "100% Cotton Denim",
    color: "Blue",
    pattern: "Solid",
    price: 300,
    stock: 40,
    unit: "meters",
    category: "denim",
    description: "Durable denim fabric for jeans and casual wear",
    lowStockThreshold: 8,
    supplier: {
      name: "Denim Depot",
      contact: "+91-9876543212",
      address: "Ahmedabad, Gujarat"
    }
  },
  {
    name: "Linen Summer Fabric",
    material: "Pure Linen",
    color: "Beige",
    pattern: "Solid",
    price: 400,
    stock: 30,
    unit: "meters",
    category: "linen",
    description: "Breathable linen fabric perfect for summer clothing",
    lowStockThreshold: 6,
    supplier: {
      name: "Linen House",
      contact: "+91-9876543213",
      address: "Chennai, Tamil Nadu"
    }
  },
  {
    name: "Chiffon Party Wear",
    material: "Chiffon",
    color: "Black",
    pattern: "Solid",
    price: 350,
    stock: 20,
    unit: "meters",
    category: "chiffon",
    description: "Elegant chiffon fabric for party wear and evening gowns",
    lowStockThreshold: 5,
    supplier: {
      name: "Fashion Fabrics",
      contact: "+91-9876543214",
      address: "Delhi, NCR"
    }
  },
  {
    name: "Wool Winter Fabric",
    material: "Pure Wool",
    color: "Gray",
    pattern: "Solid",
    price: 600,
    stock: 15,
    unit: "meters",
    category: "wool",
    description: "Warm wool fabric for winter coats and jackets",
    lowStockThreshold: 3,
    supplier: {
      name: "Wool Works",
      contact: "+91-9876543215",
      address: "Srinagar, Jammu & Kashmir"
    }
  },
  {
    name: "Georgette Designer Fabric",
    material: "Georgette",
    color: "Pink",
    pattern: "Embroidered",
    price: 450,
    stock: 18,
    unit: "meters",
    category: "georgette",
    description: "Designer georgette with intricate embroidery work",
    lowStockThreshold: 4,
    supplier: {
      name: "Designer Fabrics",
      contact: "+91-9876543216",
      address: "Jaipur, Rajasthan"
    }
  },
  {
    name: "Polyester Work Shirt",
    material: "Polyester Blend",
    color: "Navy Blue",
    pattern: "Solid",
    price: 180,
    stock: 60,
    unit: "meters",
    category: "polyester",
    description: "Easy-care polyester blend for work shirts",
    lowStockThreshold: 12,
    supplier: {
      name: "Corporate Fabrics",
      contact: "+91-9876543217",
      address: "Bangalore, Karnataka"
    }
  },
  {
    name: "Cotton Kurta Fabric",
    material: "Cotton",
    color: "Green",
    pattern: "Printed",
    price: 200,
    stock: 35,
    unit: "meters",
    category: "cotton",
    description: "Comfortable cotton fabric with traditional prints for kurtas",
    lowStockThreshold: 7,
    supplier: {
      name: "Traditional Textiles",
      contact: "+91-9876543218",
      address: "Varanasi, Uttar Pradesh"
    }
  },
  {
    name: "Silk Blouse Fabric",
    material: "Silk",
    color: "Gold",
    pattern: "Brocade",
    price: 1200,
    stock: 12,
    unit: "meters",
    category: "silk",
    description: "Luxurious silk brocade for special occasion blouses",
    lowStockThreshold: 2,
    supplier: {
      name: "Royal Silks",
      contact: "+91-9876543219",
      address: "Banaras, Uttar Pradesh"
    }
  }
];

async function seedFabrics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing fabrics (optional)
    await Fabric.deleteMany({});
    console.log('🗑️  Cleared existing fabrics');

    // Add createdBy to all fabrics
    const fabricsWithCreator = dummyFabrics.map(fabric => ({
      ...fabric,
      createdBy: adminUser._id
    }));

    // Insert dummy fabrics
    const createdFabrics = await Fabric.insertMany(fabricsWithCreator);
    console.log(`✅ Created ${createdFabrics.length} fabric records`);

    // Show summary
    console.log('\n📊 Fabric Summary:');
    const categories = await Fabric.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } }
    ]);
    
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} fabrics, ${cat.totalStock} meters in stock`);
    });

    console.log('\n🎉 Fabric seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding fabrics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedFabrics();
}

module.exports = seedFabrics;

