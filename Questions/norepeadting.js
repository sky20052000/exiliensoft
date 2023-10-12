

function nonRepeating(str){
    const charCount = {};

    // remove all numbers and convert alphabet into lowercase
    const cleanStr = str.replace(/[^a-zA-Z]/g, '').toLowerCase();
      // Count the frequency of each character
  for (const char of cleanStr) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
// find first  non repeating character
  for (const char of cleanStr) {
    if (charCount[char] === 1) {
      return char;
    }
  }
  return null


}

console.log(nonRepeating("pproograamming"));