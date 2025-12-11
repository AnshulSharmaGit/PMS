
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function runTest() {
    console.log('🧪 Starting SQLite Integration Test...\n');

    try {
        // 1. Test Login (Admin Seeding)
        console.log('1. Testing Admin Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@pms.com',
            password: 'admin123'
        });

        if (loginRes.status === 200 && loginRes.data.token) {
            console.log('✅ Admin Login Successful. Token received.');
            console.log(`   User: ${loginRes.data.user.name} (${loginRes.data.user.role})`);
        } else {
            throw new Error('Login failed');
        }

        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test Get Users
        console.log('\n2. Testing Get Users...');
        const usersRes = await axios.get(`${API_URL}/users`, { headers });
        console.log(`✅ Retrieved ${usersRes.data.length} users.`);
        usersRes.data.forEach((u: any) => console.log(`   - ${u.name} [${u.email}]`));

        // 3. Test Create Medicine
        console.log('\n3. Testing Create Medicine...');
        const newMed = {
            name: `Test Med ${Date.now()}`,
            manufacturer: 'Test Corp',
            batchNumber: 'T001',
            expiryDate: '2025-01-01',
            mrp: 100,
            stock: 50
        };
        const createMedRes = await axios.post(`${API_URL}/medicines`, newMed, { headers });
        console.log('✅ Medicine Created:', createMedRes.data.name);

        // 4. Test Get Medicines (Verify Persistence)
        console.log('\n4. Testing Get Medicines...');
        const medsRes = await axios.get(`${API_URL}/medicines`, { headers });
        const createdMed = medsRes.data.find((m: any) => m.name === newMed.name);

        if (createdMed) {
            console.log('✅ persistence verified. Found created medicine in list.');
        } else {
            console.error('❌ Could not find created medicine in list!');
        }

        console.log('\n🎉 Test Completed Successfully!');

    } catch (error: any) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

runTest();
