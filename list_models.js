async function test() {
  const key = '[GCP_API_KEY]';
  const url = 'https://generativelanguage.googleapis.com/v1/models?key=' + key;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
test();
