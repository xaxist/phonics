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

      <header className="app-header">
        <div className="header-title-container">
          <div className="logo-icon" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>🦁</div>
          <div>
            <h1 className="header-title">Phonics</h1>
            <p className="header-subtitle">Adventure</p>
          </div>
        </div>
        <button className="settings-btn" onClick={() => setShowVoiceSettings(true)}>
          <Settings size={20} />
          <span className="settings-text">Settings</span>
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
