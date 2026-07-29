export const pronunciationFixes: Record<string, string> = {
  "cab": "kabb",
  "sap": "sapp",
  "mac": "mack",
  "nab": "nabb",
  "gab": "gabb",
  "tab": "tabb",
  "fad": "fadd",
  "tad": "tadd",
  "yam": "yamm",
  "wag": "wagg",
  "yap": "yapp",
  "zag": "zagg"
  // Expand this list as you discover more mispronunciations
};

export const getPhoneticSpelling = (text: string) => {
  // If it's a single word, check the dictionary directly
  const words = text.split(/\s+/);
  if (words.length === 1) {
    const cleanWord = text.toLowerCase().replace(/[^a-z]/g, '');
    if (pronunciationFixes[cleanWord]) {
      return pronunciationFixes[cleanWord];
    }
    return text;
  }
  
  // For sentences, replace words that match exactly
  return words.map(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (pronunciationFixes[cleanWord]) {
      // replace the word but keep surrounding punctuation if possible (simple substitution)
      return word.toLowerCase().replace(cleanWord, pronunciationFixes[cleanWord]);
    }
    return word;
  }).join(' ');
};

export const getPronunciationForRule = (rule: string) => {
  const parts = rule.split('»');
  const target = parts[parts.length - 1].trim();
  
  if (target.includes('=')) {
    const [letter, sound] = target.split('=').map(s => s.trim());
    
    // Map of phonetic symbols to how the TTS engine should pronounce them
    const soundMap: Record<string, string> = {
      '/ă/': 'aah',
      '/ĭ/': 'ih',
      '/ŭ/': 'uh',
      '/ĕ/': 'eh',
      '/ŏ/': 'aw',
      '/ā/': 'ay',
      '/ē/': 'ee',
      '/ī/': 'eye',
      '/ō/': 'oh',
      '/ū/': 'yoo'
    };
    
    const readableSound = soundMap[sound] || sound.replace(/[\/]/g, '');
    return `${letter} makes the sound ${readableSound}`;
  }
  
  // E.g., "st", "sh", "th"
  return target.split('').join(' ') + ` makes the sound ${target}`;
};
