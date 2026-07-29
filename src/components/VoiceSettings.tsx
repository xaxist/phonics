import React, { useState, useEffect } from 'react';
import { Volume2, X, Settings as SettingsIcon } from 'lucide-react';

interface VoiceSettingsProps {
  onClose: () => void;
  selectedVoiceURI: string;
  onSelectVoice: (uri: string) => void;
  voiceSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onClose, selectedVoiceURI, onSelectVoice, voiceSpeed, onSpeedChange }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const curatedVoices = allVoices.filter(v => {
        const lowerName = v.name.toLowerCase();
        return (lowerName.includes('google') && lowerName.includes('english')) ||
               ['samantha', 'alex', 'daniel'].includes(lowerName);
      });
      
      setVoices(curatedVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const sampleText = "Hello! I am ready to help you learn phonics.";

  const testVoice = (voice: SpeechSynthesisVoice) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.voice = voice;
    utterance.rate = voiceSpeed;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'white', padding: '2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={24} color="var(--primary)" />
            <h2 style={{ margin: 0, color: 'var(--primary)' }}>Settings</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="var(--text-light)" />
          </button>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#ffebee', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#d32f2f' }}>Reset Progress</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#c62828' }}>Delete all earned stars.</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all your stars?")) {
                localStorage.removeItem('phonics_completed');
                window.location.reload();
              }
            }}
            style={{ padding: '0.8rem 1.5rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
            Reset
          </button>
        </div>

        <p style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Select a voice for reading words and sentences:
        </p>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Reading Speed</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{Math.round(voiceSpeed * 100)}%</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { label: 'Very Slow', value: 0.4, icon: '🐢' },
              { label: 'Slow', value: 0.7, icon: '🚶' },
              { label: 'Normal', value: 1.0, icon: '🗣️' },
              { label: 'Fast', value: 1.3, icon: '🏃' },
              { label: 'Very Fast', value: 1.6, icon: '🚀' }
            ].map(setting => (
              <button
                key={setting.value}
                onClick={() => {
                  onSpeedChange(setting.value);
                  localStorage.setItem('phonics_speed', setting.value.toString());
                }}
                style={{
                  flex: 1,
                  padding: '0.8rem 0.2rem',
                  borderRadius: '10px',
                  border: voiceSpeed === setting.value ? '2px solid var(--primary)' : '1px solid #ddd',
                  background: voiceSpeed === setting.value ? 'var(--bg-gradient)' : 'white',
                  color: voiceSpeed === setting.value ? 'white' : 'var(--text-dark)',
                  fontWeight: voiceSpeed === setting.value ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: voiceSpeed === setting.value ? '0 4px 10px rgba(102, 126, 234, 0.3)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{setting.icon}</span>
                <span>{setting.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {voices.map(voice => {
            let displayName = voice.name;
            const lowerName = voice.name.toLowerCase();
            if (lowerName.includes('google')) {
              if (lowerName.includes('female') || lowerName.includes('us')) displayName = 'Female Voice (Google)';
              else if (lowerName.includes('male') || lowerName.includes('uk')) displayName = 'Male Voice (Google)';
              else displayName = 'Voice (Google)';
            } else if (lowerName === 'samantha') displayName = 'Female Voice (Apple US)';
            else if (lowerName === 'alex') displayName = 'Male Voice (Apple US)';
            else if (lowerName === 'daniel') displayName = 'Male Voice (Apple UK)';

            return (
              <div key={voice.voiceURI} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem', borderRadius: '12px',
                background: selectedVoiceURI === voice.voiceURI ? 'var(--bg-gradient)' : '#f8f9fa',
                border: selectedVoiceURI === voice.voiceURI ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer'
              }} onClick={() => onSelectVoice(voice.voiceURI)}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{displayName}</strong>
                  <span style={{ fontSize: '0.8rem', color: selectedVoiceURI === voice.voiceURI ? 'white' : 'var(--text-light)' }}>
                    {voice.localService ? 'Local (Works offline)' : 'Remote (Requires internet)'}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); testVoice(voice); }}
                  style={{ padding: '0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Volume2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
