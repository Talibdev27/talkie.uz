// Script to add sample guests for testing
const API_BASE = 'http://localhost:5000';

async function addSampleGuests() {
  try {
    // First, try to get all weddings to find one that exists
    let wedding;
    
    // Try the known URL first
    try {
      const weddingResponse = await fetch(`${API_BASE}/api/weddings/url/rs6rugtxm`);
      if (weddingResponse.ok) {
        wedding = await weddingResponse.json();
      }
    } catch (e) {
      console.log('Wedding rs6rugtxm not found, trying to find any wedding...');
    }
    
    // If that doesn't work, try to get all weddings
    if (!wedding) {
      try {
        const allWeddingsResponse = await fetch(`${API_BASE}/api/weddings`);
        if (allWeddingsResponse.ok) {
          const weddings = await allWeddingsResponse.json();
          if (weddings && weddings.length > 0) {
            wedding = weddings[0];
            console.log('Using first available wedding');
          }
        }
      } catch (e) {
        console.log('Could not fetch weddings list');
      }
    }
    
    // If still no wedding, create a simple one for testing
    if (!wedding) {
      console.log('No wedding found, creating a test wedding...');
      const createResponse = await fetch(`${API_BASE}/api/weddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride: 'Zilola',
          groom: 'Zohid',
          weddingDate: '2025-06-15',
          venue: 'Test Venue',
          venueAddress: 'Test Address'
        })
      });
      
      if (createResponse.ok) {
        wedding = await createResponse.json();
        console.log('Created test wedding');
      } else {
        throw new Error('Could not create or find a wedding');
      }
    }
    
    console.log('Found wedding:', wedding.bride, '&', wedding.groom, '(ID:', wedding.id, ')');

    // Sample guests to add
    const sampleGuests = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1-555-0101',
        weddingId: wedding.id,
        rsvpStatus: 'confirmed',
        category: 'family',
        side: 'bride'
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1-555-0102',
        weddingId: wedding.id,
        rsvpStatus: 'pending',
        category: 'friends',
        side: 'groom'
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        phone: '+1-555-0103',
        weddingId: wedding.id,
        rsvpStatus: 'confirmed',
        category: 'family',
        side: 'bride'
      },
      {
        name: 'David Wilson',
        email: 'david@example.com',
        phone: '+1-555-0104',
        weddingId: wedding.id,
        rsvpStatus: 'maybe',
        category: 'colleagues',
        side: 'both'
      },
      {
        name: 'Emma Brown',
        email: 'emma@example.com',
        phone: '+1-555-0105',
        weddingId: wedding.id,
        rsvpStatus: 'declined',
        category: 'friends',
        side: 'groom'
      },
      {
        name: 'Frank Miller',
        email: 'frank@example.com',
        phone: '+1-555-0106',
        weddingId: wedding.id,
        rsvpStatus: 'confirmed',
        category: 'family',
        side: 'both'
      }
    ];

    console.log('\nAdding sample guests...');
    
    for (const guest of sampleGuests) {
      try {
        const response = await fetch(`${API_BASE}/api/guests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(guest)
        });

        if (response.ok) {
          const addedGuest = await response.json();
          console.log(`✅ Added: ${addedGuest.name} (${addedGuest.rsvpStatus})`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to add ${guest.name}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error adding ${guest.name}:`, error.message);
      }
    }

    console.log('\n🎉 Sample guests added successfully!');
    console.log('You can now test the guest management interface.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
addSampleGuests(); 