// Eagerly load voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export const getVoice = (voiceURI: string) => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  
  let voice = voices.find(v => v.voiceURI === voiceURI);
  if (!voice) {
    const curatedVoices = voices.filter(v => {
      const lowerName = v.name.toLowerCase();
      return (lowerName.includes('google') && lowerName.includes('english')) ||
             ['samantha', 'alex', 'daniel'].includes(lowerName);
    });
    const femaleVoice = curatedVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('female') || n.includes('samantha') || n === 'google us english';
    });
    
    voice = femaleVoice || curatedVoices[0] || voices[0] || undefined;
  }
  return voice || null;
};

export const speakText = (text: string, voiceURI: string, rate = 0.7, pitch = 1.0) => {
  if (!('speechSynthesis' in window)) return;
  
  const play = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      (window as any).currentUtterance = utterance;

      const voice = getVoice(voiceURI);
      if (voice) utterance.voice = voice;
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    setTimeout(play, 50);
  } else {
    play();
  }
};
