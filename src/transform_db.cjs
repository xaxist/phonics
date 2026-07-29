const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'lessons.json'), 'utf8'));

const worlds = [
  { id: 1, name: "Short Vowel Valley", description: "Learn the short and snappy vowel sounds!", lessons: [] },
  { id: 2, name: "The Blend Beach", description: "When consonants hang out together!", lessons: [] },
  { id: 3, name: "Digraph Desert", description: "Two letters, one brand new sound!", lessons: [] },
  { id: 4, name: "Magic 'E' Mountain", description: "The silent ninja 'E' makes vowels say their name!", lessons: [] },
  { id: 5, name: "Vowel Team Tropics", description: "When two vowels go walking...", lessons: [] },
  { id: 6, name: "R-Controlled River", description: "Watch out for the bossy 'R'!", lessons: [] },
  { id: 7, name: "Multi-Syllable Meadow", description: "Big words, prefixes, and suffixes!", lessons: [] }
];

let currentWorldIndex = 0;

data.forEach((lesson, index) => {
  const rule = lesson.rule.toLowerCase();
  
  // Basic heuristic routing
  if (rule.includes('blend')) {
    currentWorldIndex = 1;
  } else if (rule.includes('digraph')) {
    currentWorldIndex = 2;
  } else if (rule.includes('silent e') || rule.includes('vowel-consonant-e') || rule.includes('magic e')) {
    currentWorldIndex = 3;
  } else if (rule.includes('vowel team') || rule.includes('open syllable') || rule.includes('diphthong')) {
    currentWorldIndex = 4;
  } else if (rule.includes('r-controlled') || rule.includes('bossy r')) {
    currentWorldIndex = 5;
  } else if (rule.includes('suffix') || rule.includes('prefix') || rule.includes('multisyllabic') || rule.includes('complex')) {
    currentWorldIndex = 6;
  } else if (rule.includes('short vowel') || rule.includes('closed syllable')) {
    currentWorldIndex = 0;
  }
  
  // Sight words fallback to the current world they appear next to
  
  worlds[currentWorldIndex].lessons.push({
    ...lesson,
    id: `lesson_${index + 1}`
  });
});

fs.writeFileSync(path.join(__dirname, 'database.json'), JSON.stringify({ worlds }, null, 2));
console.log('Database transformed successfully!');
