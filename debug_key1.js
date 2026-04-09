async function test() {
  const key = '[GCP_API_KEY]';
  const url = 'https://generativelanguage.googleapis.com/v1/models?key=' + key;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.models && Array.isArray(data.models)) {
      data.models.forEach(m => {
          if (m.name.includes('flash')) {
              console.log('FLASH:', m.name, 'METHODS:', m.supportedGenerationMethods);
          }
      });
    } else {
      console.log('ERROR:', data);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
test();
