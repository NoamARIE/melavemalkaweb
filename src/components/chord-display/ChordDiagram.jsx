import React from 'react';

// Basic chord patterns for common chords
const basicChordPatterns = {
  // Major chords
  'C': { frets: [-1, 3, 2, 0, 1, 0], name: 'C Major' },
  'D': { frets: [-1, -1, 0, 2, 3, 2], name: 'D Major' },
  'E': { frets: [0, 2, 2, 1, 0, 0], name: 'E Major' },
  'F': { frets: [1, 3, 3, 2, 1, 1], name: 'F Major' },
  'G': { frets: [3, 2, 0, 0, 0, 3], name: 'G Major' },
  'A': { frets: [0, 0, 2, 2, 2, 0], name: 'A Major' },
  'B': { frets: [-1, 2, 4, 4, 4, 2], name: 'B Major' },
  
  // Minor chords
  'Am': { frets: [0, 0, 2, 2, 1, 0], name: 'A Minor' },
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], name: 'B Minor' },
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], name: 'C Minor' },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], name: 'D Minor' },
  'Em': { frets: [0, 2, 2, 0, 0, 0], name: 'E Minor' },
  'Fm': { frets: [1, 3, 3, 1, 1, 1], name: 'F Minor' },
  'Gm': { frets: [3, 5, 5, 3, 3, 3], name: 'G Minor' },
  
  // 7th chords
  'A7': { frets: [0, 0, 2, 0, 2, 0], name: 'A7' },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], name: 'B7' },
  'C7': { frets: [0, 3, 2, 3, 1, 0], name: 'C7' },
  'D7': { frets: [-1, -1, 0, 2, 1, 2], name: 'D7' },
  'E7': { frets: [0, 2, 0, 1, 0, 0], name: 'E7' },
  'F7': { frets: [1, 3, 1, 2, 1, 1], name: 'F7' },
  'G7': { frets: [3, 2, 0, 0, 0, 1], name: 'G7' }
};

export default function ChordDiagram({ name }) {
  // Parse the chord name to determine if it has flats, sharps, or other modifiers
  const baseChord = name.replace(/b/g, '').replace(/#/g, '').substring(0, 1);
  
  // Get the chord pattern (default to C if not found)
  const chordPattern = basicChordPatterns[name] || basicChordPatterns[baseChord + 'm'] || basicChordPatterns[baseChord] || basicChordPatterns['C'];
  
  // Create a simpler version for mobile displays
  const displayFrets = chordPattern.frets;
  
  return (
    <div className="bg-white rounded-lg border p-2 md:p-3">
      <h3 className="text-center font-medium text-blue-700 mb-1 text-xs md:text-sm">{name}</h3>
      
      <div className="flex justify-center">
        <div className="relative w-[100px] md:w-[120px]">
          {/* Fretboard */}
          <div className="relative bg-amber-100 rounded border-amber-300 border pb-[120%]">
            {/* Strings */}
            {[0, 1, 2, 3, 4, 5].map(string => (
              <div 
                key={string} 
                className="absolute top-0 bottom-0 bg-gray-400 w-[1px] md:w-[1.5px]"
                style={{ left: `${string * 20}%` }}
              />
            ))}
            
            {/* Frets */}
            {[0, 1, 2, 3, 4].map(fret => (
              <div 
                key={fret} 
                className="absolute left-0 right-0 bg-gray-700 h-[1px] md:h-[1.5px]"
                style={{ top: `${fret * 25}%` }}
              />
            ))}
            
            {/* Finger positions */}
            {displayFrets.map((fret, string) => {
              if (fret === -1) return null; // Don't play this string
              if (fret === 0) {
                // Open string - circle at the top
                return (
                  <div 
                    key={string}
                    className="absolute w-[12px] h-[12px] md:w-[14px] md:h-[14px] rounded-full border-2 border-green-500 bg-white flex items-center justify-center"
                    style={{ 
                      left: `${string * 20}%`, 
                      top: '2%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              }
              // Finger on a fret
              return (
                <div 
                  key={string}
                  className="absolute w-[14px] h-[14px] md:w-[18px] md:h-[18px] rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] md:text-xs font-bold"
                  style={{ 
                    left: `${string * 20}%`, 
                    top: `${(fret * 25) - 12.5}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {fret}
                </div>
              );
            })}
            
            {/* X marks for strings not played */}
            {displayFrets.map((fret, string) => {
              if (fret !== -1) return null;
              return (
                <div 
                  key={string}
                  className="absolute text-red-500 font-bold text-xs md:text-sm"
                  style={{ 
                    left: `${string * 20}%`, 
                    top: '2%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  ✕
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}