/**
 * Script to train all ML models
 * Requires: Backend server running on port 5000
 * Usage: node train-ml-models.js [admin-email] [admin-password]
 */

const API_BASE = process.env.API_URL || 'http://localhost:5000';

async function makeRequest(url, method = 'GET', data = null, token = null) {
  const urlObj = new URL(url, API_BASE);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(urlObj, options);
  const responseData = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data: responseData
  };
}

async function trainModels(email, password) {
  try {
    console.log('🚀 Starting ML Models Training...\n');

    // Step 1: Login as Admin
    console.log('📝 Step 1: Logging in as Admin...');
    let token;
    
    if (email && password) {
      try {
        const loginResponse = await makeRequest('/api/auth/login', 'POST', {
          email,
          password
        });
        
        if (loginResponse.ok) {
          token = loginResponse.data.token;
          console.log('✅ Login successful!\n');
        } else {
          console.error('❌ Login failed:', loginResponse.data?.message || 'Unknown error');
          console.log('\n💡 Trying without authentication (if backend allows)...\n');
        }
      } catch (error) {
        console.error('❌ Login error:', error.message);
        console.log('\n💡 Trying without authentication (if backend allows)...\n');
      }
    } else {
      console.log('⚠️  No credentials provided. Trying without authentication...\n');
    }

    // Step 2: Train all models
    console.log('🤖 Step 2: Training all ML models...');
    
    try {
      const trainResponse = await makeRequest('/api/ml/train-all', 'POST', {}, token);
      
      if (!trainResponse.ok) {
        if (trainResponse.status === 401) {
          console.error('\n❌ Authentication required!');
          console.log('\n💡 Please provide admin credentials:');
          console.log('   node train-ml-models.js admin@example.com password\n');
          process.exit(1);
          return;
        } else if (trainResponse.status === 403) {
          console.error('\n❌ Admin access required!');
          console.log('   Only Admin users can train models.\n');
          process.exit(1);
          return;
        } else {
          throw new Error(trainResponse.data?.message || 'Training failed');
        }
      }
      
      console.log('\n✅ All models trained successfully!\n');
      console.log('📊 Training Results:');
      console.log('─────────────────────────────────');
      
      if (trainResponse.data.results) {
        const results = trainResponse.data.results;
        
        if (results.knn) {
          console.log(`\n🎯 KNN (Customer Preference):`);
          console.log(`   Accuracy: ${results.knn.accuracy || 'N/A'}`);
        }
        
        if (results.naiveBayes) {
          console.log(`\n🧵 Naïve Bayes (Fabric Recommendation):`);
          console.log(`   Accuracy: ${results.naiveBayes.accuracy || 'N/A'}`);
        }
        
        if (results.decisionTree) {
          console.log(`\n👷 Decision Tree (Tailor Allocation):`);
          console.log(`   Accuracy: ${results.decisionTree.accuracy || 'N/A'}`);
        }
        
        if (results.svm) {
          console.log(`\n⚠️  SVM (Order Delay Detection):`);
          console.log(`   Accuracy: ${results.svm.accuracy || 'N/A'}`);
        }
        
        if (results.bpnn) {
          console.log(`\n😊 BPNN (Customer Satisfaction):`);
          console.log(`   Accuracy: ${results.bpnn.accuracy || 'N/A'}`);
        }
      }
      
      console.log('\n✅ Training complete! You can now use the ML models.\n');
      
    } catch (error) {
      console.error('\n❌ Training failed:');
      console.error('   Message:', error.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.error('\n💡 Make sure the backend server is running on', API_BASE);
      console.error('   Start it with: cd backend && npm start');
    }
    process.exit(1);
  }
}

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

// Run training
trainModels(email, password);

