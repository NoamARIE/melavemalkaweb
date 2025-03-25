import React from 'react';

export default function ChordLine({ line, chords }) {
  if (!line) return <div className="h-4"></div>;
  
  const words = line.split(/\s+/);
  
  return (
    <div className="mb-4 text-lg leading-relaxed">
      {words.map((word, index) => {
        const chord = chords.find(c => c.word === index || c.position === index);
        return (
          <span key={index} className="relative inline-block mr-2 mb-2">
            {chord && (
              <span className="absolute -top-6 text-blue-600 font-mono">
                {chord.name}
              </span>
            )}
            {word}
          </span>
        );
      })}
    </div>
  );
}