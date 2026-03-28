async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/recipes');
    const data = await res.json();
    console.log('Recipe count:', Array.isArray(data) ? data.length : 'Not an array');
    if (Array.isArray(data) && data.length > 0) {
      console.log('First 3:', data.slice(0, 3).map(r => r.title));
    } else {
      console.log('Data:', data);
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
test();
