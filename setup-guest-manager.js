// Script to create a wedding for the guest manager user
// This should be run by an admin user

const API_BASE = 'http://localhost:5002';

async function setupGuestManager() {
  try {
    console.log('Setting up wedding for guest manager...');
    
    // First, we need to get an admin token
    // You'll need to replace these with actual admin credentials
    const adminLogin = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      })
    });

    if (!adminLogin.ok) {
      console.log('Admin login failed. Please check admin credentials.');
      console.log('You can also do this manually through the admin dashboard.');
      return;
    }

    const { token } = await adminLogin.json();
    console.log('Admin login successful');

    // Get all users to find the guest manager
    const usersResponse = await fetch(`${API_BASE}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await usersResponse.json();
    const guestManager = users.find(user => 
      user.email === 'xurshid@gmail.com' || user.role === 'guest_manager'
    );

    if (!guestManager) {
      console.log('Guest manager user not found');
      console.log('Available users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
      return;
    }

    console.log('Found guest manager:', guestManager.email, 'ID:', guestManager.id);

    // Create wedding for guest manager
    const createWeddingResponse = await fetch(`${API_BASE}/api/admin/create-guest-manager-wedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        guestManagerId: guestManager.id,
        bride: 'Aysha',
        groom: 'Bekzod',
        weddingDate: '2025-08-15',
        venue: 'Garden Palace Hotel'
      })
    });

    if (!createWeddingResponse.ok) {
      const error = await createWeddingResponse.text();
      throw new Error(`Failed to create wedding: ${error}`);
    }

    const result = await createWeddingResponse.json();
    console.log('Success!', result.message);
    console.log('Wedding created with ID:', result.wedding.id);
    console.log('Sample guests created:', result.guestsCreated);
    console.log('Wedding URL:', result.wedding.uniqueUrl);
    
    console.log('\n✅ Guest manager setup complete!');
    console.log('The guest manager can now log in and see their wedding data.');
    console.log(`Access URL: ${API_BASE}/manage/${result.wedding.uniqueUrl}`);

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n❌ Setup failed. You can also do this manually:');
    console.log('1. Go to admin dashboard');
    console.log('2. Find the guest manager user');
    console.log('3. Create a wedding for them');
  }
}

// Run the setup
setupGuestManager(); 