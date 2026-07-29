import React, { useState, useEffect, useRef } from 'react';
import { Lesson, World } from '../types';
import { ArrowLeft, Volume2, Star, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { getPhoneticSpelling, getPronunciationForRule } from '../utils/pronunciation';
import { speakText, getVoice } from '../utils/speech';

interface LessonDetailProps {
  lesson: Lesson;
  world: World;
  onBack: () => void;
  voiceURI: string;
  voiceSpeed: number;
}

export const LessonDetail: React.FC<LessonDetailProps> = ({ lesson, world, onBack, voiceURI, voiceSpeed }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'words' | 'sentences'>('intro');
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const gradients = ['bg-gradient-1', 'bg-gradient-2', 'bg-gradient-3', 'bg-gradient-4'];

  useEffect(() => {
    // Check if already completed
    const saved = localStorage.getItem('phonics_completed');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[lesson.id]) {
        setIsCompleted(true);
      }
    }
  }, [lesson.id]);

  const localSpeakText = (text: string, rate = 0.7, pitch = 1.0) => {
    speakText(text, voiceURI, rate * voiceSpeed, pitch);
  };

  const markCompleted = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      const saved = localStorage.getItem('phonics_completed');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed[lesson.id] = true;
      localStorage.setItem('phonics_completed', JSON.stringify(parsed));
      
      localSpeakText("Great job! You earned a star!", 1.1, 1.2);
    }
  };

  const speakWord = (text: string) => {
    const phoneticText = getPhoneticSpelling(text);
    localSpeakText(phoneticText);
  };

  const speakSentence = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Basic sentence splitting for karaoke (words only)
      const words = text.split(/\s+/);
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoice(voiceURI);
      if (voice) utterance.voice = voice;
      
      // Slower speed for sentence karaoke multiplied by user setting
      utterance.rate = 0.6 * voiceSpeed; 
      utterance.pitch = 1.0;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          // Estimate which word based on charIndex
          const charIndex = event.charIndex;
          let currentLen = 0;
          for (let i = 0; i < words.length; i++) {
            currentLen += words[i].length + 1; // +1 for space
            if (charIndex < currentLen) {
              setHighlightedWordIdx(i);
              break;
            }
          }
        }
      };

      utterance.onend = () => {
        setHighlightedWordIdx(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const nextSentence = () => {
    window.speechSynthesis.cancel();
    setHighlightedWordIdx(null);
    if (currentSentenceIdx < lesson.sentences.length - 1) {
      setCurrentSentenceIdx(currentSentenceIdx + 1);
    } else {
      markCompleted();
    }
  };

  const prevSentence = () => {
    window.speechSynthesis.cancel();
    setHighlightedWordIdx(null);
    if (currentSentenceIdx > 0) {
      setCurrentSentenceIdx(currentSentenceIdx - 1);
    }
  };

  useEffect(() => {
    if (activeTab !== 'sentences' || lesson.sentences.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSentence();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSentence();
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setHighlightedWordIdx(null);
        } else {
          const currentSentence = lesson.sentences[currentSentenceIdx].replace(/^\d+\)\s*/, '');
          speakSentence(currentSentence);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, currentSentenceIdx, lesson.sentences]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    
    // Swipe left (next sentence)
    if (diff > 50) {
      nextSentence();
    }
    // Swipe right (prev sentence)
    else if (diff < -50) {
      prevSentence();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const renderSentenceKaraoke = () => {
    if (lesson.sentences.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No sentences for this lesson!</h3>
          <button onClick={markCompleted} className="btn-primary" style={{ marginTop: '1rem' }}>Finish Lesson</button>
        </div>
      );
    }

    const currentSentence = lesson.sentences[currentSentenceIdx].replace(/^\d+\)\s*/, '');
    const words = currentSentence.split(/\s+/);

    return (
      <div 
        className="karaoke-container" 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', paddingTop: '1rem', touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="karaoke-text"
          onClick={() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
              setHighlightedWordIdx(null);
            } else {
              speakSentence(currentSentence);
            }
          }}
          style={{ 
            fontWeight: 900, 
            textAlign: 'center', 
            lineHeight: 1.4,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.4rem 0.8rem',
            maxWidth: '800px',
            cursor: 'pointer'
          }}
        >
          {words.map((word, idx) => (
            <span 
              key={idx} 
              style={{
                color: highlightedWordIdx === idx ? 'var(--primary)' : 'var(--text-dark)',
                transform: highlightedWordIdx === idx ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.1s ease',
                display: 'inline-block'
              }}
            >
              {word}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button 
            onClick={prevSentence} 
            disabled={currentSentenceIdx === 0}
            style={{ padding: '1rem', borderRadius: '50%', border: 'none', background: '#eee', cursor: currentSentenceIdx === 0 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={() => speakSentence(currentSentence)}
            style={{ padding: '1.5rem', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', boxShadow: '0 8px 16px rgba(116, 123, 255, 0.3)' }}
          >
            <Play size={40} fill="white" />
          </button>

          <button 
            onClick={nextSentence}
            style={{ padding: '1rem', borderRadius: '50%', border: 'none', background: '#eee', cursor: 'pointer' }}
          >
            {currentSentenceIdx === lesson.sentences.length - 1 ? <Star size={32} fill={isCompleted ? "#fbc02d" : "transparent"} color={isCompleted ? "#fbc02d" : "black"} /> : <ChevronRight size={32} />}
          </button>
        </div>
        
        <p style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>
          Sentence {currentSentenceIdx + 1} of {lesson.sentences.length}
        </p>
      </div>
    );
  };

  return (
    <div className="lesson-detail" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="detail-header" style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <button className="back-btn" onClick={() => { window.speechSynthesis.cancel(); onBack(); }} style={{ flexShrink: 0, padding: '0.8rem', background: '#f0f0f0', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <span className="lesson-world-subtitle" style={{ fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                World {world.id} • Level {world.lessons.findIndex(l => l.id === lesson.id) + 1}
              </span>
              <h2 className="lesson-world-title" style={{ fontWeight: 800, margin: '0.2rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{world.name}</h2>
            </div>
            {isCompleted && <Star fill="#fbc02d" color="#fbc02d" size={28} style={{ flexShrink: 0 }} />}
          </div>
          <p className="lesson-rule-text" style={{ color: 'var(--text-light)', margin: '0.5rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.rule.replace(/»/g, '•')}</p>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          className={`tab ${activeTab === 'intro' ? 'active' : ''}`}
          onClick={() => setActiveTab('intro')}
          style={{ padding: '1rem 1.5rem', borderRadius: '30px', border: 'none', background: activeTab === 'intro' ? 'var(--primary)' : 'white', color: activeTab === 'intro' ? 'white' : 'var(--text-dark)', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
        >
          Intro
        </button>
        <button 
          className={`tab ${activeTab === 'words' ? 'active' : ''}`}
          onClick={() => setActiveTab('words')}
          style={{ padding: '1rem 1.5rem', borderRadius: '30px', border: 'none', background: activeTab === 'words' ? 'var(--primary)' : 'white', color: activeTab === 'words' ? 'white' : 'var(--text-dark)', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
        >
          Words
        </button>
        <button 
          className={`tab ${activeTab === 'sentences' ? 'active' : ''}`}
          onClick={() => setActiveTab('sentences')}
          style={{ padding: '1rem 1.5rem', borderRadius: '30px', border: 'none', background: activeTab === 'sentences' ? 'var(--primary)' : 'white', color: activeTab === 'sentences' ? 'white' : 'var(--text-dark)', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
        >
          Sentences
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Playful Background blobs for the active tab */}
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        
        {activeTab === 'intro' && (
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div className="bounce-anim emoji-icon" style={{ marginBottom: '1rem', textShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
              🎓
            </div>
            <h2 className="intro-title" style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
              Let's Learn!
            </h2>
            <div className="intro-box" style={{ background: 'white', padding: '2rem', borderRadius: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', margin: '2rem 0', transform: 'rotate(-1deg)' }}>
              <p className="intro-subtitle" style={{ color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                We are learning about
              </p>
              <div className="intro-rule-text" style={{ fontWeight: 900, color: 'var(--secondary)', margin: '1rem 0', background: 'var(--bg-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', wordBreak: 'break-word' }}>
                {lesson.rule.split('»').pop()}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => localSpeakText("Let's learn! " + getPronunciationForRule(lesson.rule), 0.7, 1.0)} 
                className="playful-btn" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.5rem 3rem', fontSize: '1.5rem', background: '#ff9800', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 10px 20px rgba(255, 152, 0, 0.4)', textTransform: 'uppercase', transition: 'all 0.3s ease' }}
              >
                <Volume2 size={32} /> Listen
              </button>
              
              <button onClick={() => setActiveTab('words')} className="playful-btn bounce-anim" style={{ padding: '1.5rem 4rem', fontSize: '1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)', textTransform: 'uppercase', transition: 'all 0.3s ease' }}>
                Start Words
              </button>
            </div>
          </div>
        )}

        {activeTab === 'words' && (
          <div className="word-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {lesson.words.map((word, idx) => (
              <div 
                key={idx} 
                className={`word-card ${gradients[idx % gradients.length]}`}
                onClick={() => speakWord(word)}
                style={{
                  padding: '2rem 1rem',
                  borderRadius: '20px',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Dynamic font sizing for long words */}
                <span style={{ fontSize: word.length > 8 ? '1.5rem' : '2.2rem', fontWeight: 900, wordBreak: 'break-word', margin: 'auto' }}>
                  {word}
                </span>
              </div>
            ))}
            
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>
               <button onClick={() => setActiveTab('sentences')} style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(116, 123, 255, 0.4)' }}>
                 Go to Sentences
               </button>
            </div>
          </div>
        )}

        {activeTab === 'sentences' && renderSentenceKaraoke()}
      </div>
    </div>
  );
};
