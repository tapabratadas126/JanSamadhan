async function main() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  console.log('Homepage status:', res.status);
  
  // Find all problem links
  const matches = html.match(/\/problems\/[a-zA-Z0-9]+/g);
  console.log('Problem links on homepage:', [...new Set(matches)]);
}
main();
