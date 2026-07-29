import { useState } from 'react';
import { JourneyMap } from './components/JourneyMap';
import { LessonDetail } from './components/LessonDetail';
import { VoiceSettings } from './components/VoiceSettings';
import { Lesson, World } from './types';
import { Settings } from 'lucide-react';

function App() {
  const [selectedLesson, setSelectedLesson] = useState<{lesson: Lesson, world: World} | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceURI, setVoiceURI] = useState('');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => {
    return parseFloat(localStorage.getItem('phonics_speed') || '1.0');
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Orientation Overlays */}
      <div className="orientation-overlay tablet-portrait-lock">
        <div className="orientation-overlay-content">
          <div className="orientation-overlay-icon">🔄</div>
          <div className="orientation-overlay-text">Please rotate your iPad to Landscape Mode</div>
        </div>
      </div>
      <div className="orientation-overlay phone-landscape-lock">
        <div className="orientation-overlay-content">
          <div className="orientation-overlay-icon">📱</div>
          <div className="orientation-overlay-text">Please rotate your Phone to Portrait Mode</div>
        </div>
      </div>

      <header style={{ 
        padding: '1.5rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>🗺️</span>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 900 }}>
            Phonics Adventure
          </h1>
        </div>
        <button 
          onClick={() => setShowVoiceSettings(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--bg-gradient)',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </header>

      <main style={{ paddingBottom: '4rem' }}>
        {selectedLesson ? (
          <LessonDetail 
            lesson={selectedLesson.lesson} 
            world={selectedLesson.world}
            onBack={() => setSelectedLesson(null)} 
            voiceURI={voiceURI}
            voiceSpeed={voiceSpeed}
          />
        ) : (
          <JourneyMap onSelectLesson={(lesson, world) => {
            setSelectedLesson({lesson, world});
          }} />
        )}
      </main>

      {showVoiceSettings && (
        <VoiceSettings 
          onClose={() => setShowVoiceSettings(false)} 
          selectedVoiceURI={voiceURI}
          onSelectVoice={setVoiceURI}
          voiceSpeed={voiceSpeed}
          onSpeedChange={setVoiceSpeed}
        />
      )}
    </div>
  );
}

export default App;
