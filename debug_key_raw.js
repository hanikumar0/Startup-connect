async function test() {
  const key = 'AIzaSyDYbV5BG_GqLHdjuqeH4EdW25oQ-lIiJd8';
  const url = 'https://generativelanguage.googleapis.com/v1/models?key=' + key;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.models && data.models.length > 0) {
      console.log('FIRST MODEL RAW:', JSON.stringify(data.models[0], null, 2));
    } else {
      console.log('RESPONSE:', data);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
test();
