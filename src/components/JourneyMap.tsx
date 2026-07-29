import React, { useState, useEffect } from 'react';
import { World, Lesson } from '../types';
import database from '../database.json';
import { Lock, CheckCircle2 } from 'lucide-react';

interface JourneyMapProps {
  onSelectLesson: (lesson: Lesson, world: World) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ onSelectLesson }) => {
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('phonics_completed');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  const worlds = database.worlds as World[];

  return (
    <div className="journey-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="journey-title" style={{ fontWeight: 900, color: 'var(--primary)' }}>Phonics Adventure</h1>
        <p className="journey-subtitle" style={{ color: 'var(--text-light)' }}>Complete lessons to earn stars and travel across the worlds!</p>
      </div>

      <div className="worlds-list" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {worlds.map((world) => {
          const isUnlocked = true;

          return (
            <div key={world.id} className="world-section" style={{ 
              marginBottom: '4rem', 
              background: `url('/backgrounds/world${world.id}.jpg')`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '32px',
              padding: '3rem 2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
              opacity: isUnlocked ? 1 : 0.7
            }}>
              {!isUnlocked && (
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#fff', zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '50%' }}>
                  <Lock size={28} />
                </div>
              )}

              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.3) 100%)',
                zIndex: 0
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
                <h3 className="world-title" style={{ color: 'var(--primary)', fontWeight: 900, marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
                  World {world.id}: {world.name}
                </h3>
                <p className="world-subtitle" style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{world.description}</p>
              </div>

              <div className="map-path" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '2.5rem 1.5rem',
                justifyItems: 'center',
                padding: '1rem',
                position: 'relative',
                zIndex: 1
              }}>
                {world.lessons.map((lesson, idx) => {
                  const isCompleted = completedLessons[lesson.id];
                  
                  // Symmetrical emojis
                  const emojis = ['🎈', '🚀', '🌟', '🍎', '🦊', '🎨', '🧩', '🎸', '🐢', '🦄'];
                  const icon = emojis[idx % emojis.length];
                  
                  return (
                    <button
                      key={lesson.id}
                      disabled={!isUnlocked}
                      onClick={() => onSelectLesson(lesson, world)}
                      className={`map-node ${isUnlocked ? 'pulse-hover' : ''}`}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        border: isUnlocked ? '4px solid rgba(255,255,255,0.9)' : '4px solid rgba(255,255,255,0.3)',
                        background: isCompleted ? 'linear-gradient(135deg, #4ade80, #22c55e)' : (isUnlocked ? 'rgba(255, 255, 255, 0.85)' : 'rgba(240, 240, 240, 0.4)'),
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: isCompleted ? 'white' : 'var(--text-dark)',
                        fontWeight: 900,
                        fontSize: '1.6rem',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isUnlocked ? '0 12px 24px rgba(0,0,0,0.15), inset 0 2px 10px rgba(255,255,255,1)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        padding: 0
                      }}
                      onMouseEnter={e => { if(isUnlocked) e.currentTarget.style.transform = `scale(1.15) translateY(-5px)`; }}
                      onMouseLeave={e => { if(isUnlocked) e.currentTarget.style.transform = `scale(1) translateY(0)`; }}
                    >
                      {isCompleted ? <CheckCircle2 size={36} /> : (
                        <>
                          <span style={{ fontSize: '1.2rem', marginBottom: '-2px' }}>{icon}</span>
                          <span style={{ fontSize: '1.4rem' }}>{idx + 1}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
