async function test() {
  const key = 'AIzaSyDYbV5BG_GqLHdjuqeH4EdW25oQ-lIiJd8';
  const url = 'https://generativelanguage.googleapis.com/v1/models?key=' + key;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.models && Array.isArray(data.models)) {
      data.models.forEach(m => {
        if (m.supportedMethods && m.supportedMethods.includes('generateContent')) {
          console.log('SUPPORTED:', m.name);
        } else {
          console.log('UNSUPPORTED:', m.name);
        }
      });
    } else {
      console.log('NO MODELS FOUND OR ERROR:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error('FETCH ERROR:', e.message);
  }
}
test();
