async function test() {
  const key = 'AIzaSyDYbV5BG_GqLHdjuqeH4EdW25oQ-lIiJd8';
  const url = 'https://generativelanguage.googleapis.com/v1/models?key=' + key;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.models && Array.isArray(data.models)) {
      const flash = data.models.find(m => m.name === 'models/gemini-1.5-flash');
      if (flash) {
        console.log('FLASH SUPPORTED METHODS:', flash.supportedGenerationMethods);
        if (flash.supportedGenerationMethods.includes('generateContent')) {
          console.log('✅ KEY SUPPORTS GENERATION!');
        } else {
          console.log('❌ KEY DOES NOT SUPPORT GENERATION.');
        }
      } else {
        console.log('❌ GEMINI-1.5-FLASH NOT FOUND IN LIST!');
      }
    } else {
      console.log('ERROR IN RESPONSE:', data);
    }
  } catch (e) {
    console.error('FETCH ERROR:', e.message);
  }
}
test();
