// Script to add sample guests to a specific wedding
// Run this in the browser console while logged in as the guest manager

async function addSampleGuests() {
  try {
    // Get the wedding ID from the current URL
    const url = window.location.pathname;
    const uniqueUrl = url.split('/manage/')[1];
    
    if (!uniqueUrl) {
      console.log('Error: Not on a wedding management page');
      return;
    }
    
    console.log('Adding guests to wedding:', uniqueUrl);
    
    // First get the wedding details to find the wedding ID
    const weddingResponse = await fetch(`/api/weddings/url/${uniqueUrl}`);
    if (!weddingResponse.ok) {
      throw new Error('Failed to get wedding details');
    }
    
    const wedding = await weddingResponse.json();
    console.log('Wedding found:', wedding.bride, '&', wedding.groom, 'ID:', wedding.id);
    
    // Sample guests to add
    const sampleGuests = [
      {
        name: 'Dilshod Karimov',
        email: 'dilshod@example.com',
        phone: '+998901234567',
        rsvpStatus: 'confirmed',
        category: 'family',
        side: 'groom',
        weddingId: wedding.id
      },
      {
        name: 'Malika Tosheva',
        email: 'malika@example.com',
        phone: '+998902345678',
        rsvpStatus: 'pending',
        category: 'friends',
        side: 'bride',
        weddingId: wedding.id
      },
      {
        name: 'Rustam Alimov',
        email: 'rustam@example.com',
        phone: '+998903456789',
        rsvpStatus: 'confirmed',
        category: 'colleagues',
        side: 'groom',
        weddingId: wedding.id
      },
      {
        name: 'Sevara Nazarova',
        email: 'sevara@example.com',
        phone: '+998904567890',
        rsvpStatus: 'maybe',
        category: 'family',
        side: 'bride',
        weddingId: wedding.id
      },
      {
        name: 'Bobur Rahimov',
        email: 'bobur@example.com',
        phone: '+998905678901',
        rsvpStatus: 'declined',
        category: 'friends',
        side: 'groom',
        weddingId: wedding.id
      }
    ];
    
    console.log('Adding', sampleGuests.length, 'sample guests...');
    
    // Add each guest
    for (let i = 0; i < sampleGuests.length; i++) {
      const guest = sampleGuests[i];
      console.log(`Adding guest ${i + 1}/${sampleGuests.length}: ${guest.name}`);
      
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guest)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to add ${guest.name}:`, error);
      } else {
        const result = await response.json();
        console.log(`✅ Added ${guest.name} (${guest.rsvpStatus})`);
      }
    }
    
    console.log('✅ All guests added! Refreshing page...');
    window.location.reload();
    
  } catch (error) {
    console.error('Error adding guests:', error);
  }
}

// Run the function
addSampleGuests(); 