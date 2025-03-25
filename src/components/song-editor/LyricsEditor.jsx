
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Music, ArrowRightLeft, Slash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COMMON_CHORDS = [
  'Am', 'C', 'Dm', 'Em', 'F', 'G',
  'A', 'Bm', 'D', 'E', 'Gm', 'F#m',
  'A7', 'C7', 'D7', 'E7', 'G7'
];

const CHORD_GRID_SIZE = 24; 
const CHORD_SEPARATOR = '/'; 

export default function LyricsEditor({ 
  initialLyrics = '', 
  initialChords = {}, 
  onChange,
  direction = 'rtl'
}) {
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [chords, setChords] = useState(Array.isArray(initialChords.chords) ? initialChords.chords : []);
  const [draggedChord, setDraggedChord] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null);
  const [specialSections, setSpecialSections] = useState({
    intro: Array.isArray(initialChords.intro) ? initialChords.intro : [],
    bridges: Array.isArray(initialChords.bridges) ? initialChords.bridges : []
  });
  const [bridgePositions, setBridgePositions] = useState(
    Array.isArray(initialChords.bridgePositions) ? initialChords.bridgePositions : []
  );
  const [currentCustomChord, setCurrentCustomChord] = useState('');

  const lines = lyrics.split('\n');
  
  useEffect(() => {
    const safeChords = Array.isArray(initialChords.chords) ? initialChords.chords : [];
    
    const gridCompatibleChords = safeChords.map(chord => {
      if (chord && chord.gridPosition === undefined) {
        const lineText = lines[chord.position] || '';
        const charPerGrid = Math.max(1, lineText.length / CHORD_GRID_SIZE);
        const gridPosition = Math.round(chord.char / charPerGrid);
        
        return {
          ...chord,
          gridPosition: Math.min(gridPosition, CHORD_GRID_SIZE - 1)
        };
      }
      return chord;
    });
    
    setChords(gridCompatibleChords);
    
    if (initialChords && Array.isArray(initialChords.bridgePositions)) {
      setBridgePositions(initialChords.bridgePositions);
    }
    
    if (initialChords) {
      const intro = Array.isArray(initialChords.intro) ? initialChords.intro : [];
      const bridges = Array.isArray(initialChords.bridges) ? initialChords.bridges : [];
      
      setSpecialSections({
        intro,
        bridges
      });
    }
  }, []);

  const addBridgePosition = (lineIndex) => {
    setBridgePositions(prev => {
      const newPositions = [...prev];
      if (!newPositions.includes(lineIndex)) {
        newPositions.push(lineIndex);
      }
      return newPositions;
    });
    setSpecialSections(prev => ({
      ...prev,
      bridges: [...prev.bridges, []]
    }));
    
    const updatedData = {
      lyrics,
      chords,
      intro: specialSections.intro,
      bridges: [...specialSections.bridges, []],
      bridgePositions: [...bridgePositions, lineIndex]
    };
    onChange(lyrics, updatedData);
  };

  const removeBridge = (bridgeIndex) => {
    setBridgePositions(prev => prev.filter((_, i) => i !== bridgeIndex));
    setSpecialSections(prev => ({
      ...prev,
      bridges: prev.bridges.filter((_, i) => i !== bridgeIndex)
    }));
    
    const newBridgePositions = bridgePositions.filter((_, i) => i !== bridgeIndex);
    const newBridges = specialSections.bridges.filter((_, i) => i !== bridgeIndex);
    
    const updatedData = {
      lyrics,
      chords,
      intro: specialSections.intro,
      bridges: newBridges,
      bridgePositions: newBridgePositions
    };
    onChange(lyrics, updatedData);
  };

  const handleLyricsChange = (event) => {
    const newLyrics = event.target.value;
    setLyrics(newLyrics);
    
    const updatedChords = chords.filter(chord => {
      const newLines = newLyrics.split('\n');
      return chord.position < newLines.length;
    });
    
    setChords(updatedChords);
    
    const updatedData = {
      lyrics: newLyrics,
      chords: updatedChords,
      intro: specialSections.intro,
      bridges: specialSections.bridges,
      bridgePositions
    };
    onChange(newLyrics, updatedData);
  };

  const handleDrop = (lineIndex, gridPosition, type = 'regular') => {
    if (!draggedChord) return;

    if (type.startsWith('bridge-')) {
      const bridgeIndex = parseInt(type.split('-')[1]);
      const updatedBridges = specialSections.bridges.map((bridge, idx) => 
        idx === bridgeIndex ? [...bridge, draggedChord.name] : bridge
      );
      
      setSpecialSections(prev => ({
        ...prev,
        bridges: updatedBridges
      }));
      
      const updatedData = {
        lyrics,
        chords,
        intro: specialSections.intro,
        bridges: updatedBridges,
        bridgePositions
      };
      onChange(lyrics, updatedData);
    } else if (type === 'intro') {
      const updatedIntro = [...specialSections.intro, draggedChord.name];
      
      setSpecialSections(prev => ({
        ...prev,
        intro: updatedIntro
      }));
      
      const updatedData = {
        lyrics,
        chords,
        intro: updatedIntro,
        bridges: specialSections.bridges,
        bridgePositions
      };
      onChange(lyrics, updatedData);
    } else {
      const newChordObj = {
        name: draggedChord.name,
        position: lineIndex,
        char: gridPosition * 3,
        gridPosition: gridPosition
      };

      const updatedChords = chords.filter(chord => 
        !(chord.position === lineIndex && chord.gridPosition === gridPosition)
      );
      
      updatedChords.push(newChordObj);
      
      setChords(updatedChords);
      
      const updatedData = {
        lyrics,
        chords: updatedChords,
        intro: specialSections.intro,
        bridges: specialSections.bridges,
        bridgePositions
      };
      onChange(lyrics, updatedData);
    }

    setDraggedChord(null);
    setDragOverPosition(null);
  };

  const addCustomChord = () => {
    if (currentCustomChord.trim()) {
      setDraggedChord({ name: currentCustomChord.trim() });
      setCurrentCustomChord('');
    }
  };

  const removeChordFromBridge = (bridgeIndex, chordIndex) => {
    const updatedBridges = specialSections.bridges.map((bridge, idx) => 
      idx === bridgeIndex ? bridge.filter((_, i) => i !== chordIndex) : bridge
    );
    
    setSpecialSections(prev => ({
      ...prev,
      bridges: updatedBridges
    }));
    
    const updatedData = {
      lyrics,
      chords,
      intro: specialSections.intro,
      bridges: updatedBridges,
      bridgePositions
    };
    onChange(lyrics, updatedData);
  };

  const removeChordFromIntro = (chordIndex) => {
    const updatedIntro = specialSections.intro.filter((_, i) => i !== chordIndex);
    
    setSpecialSections(prev => ({
      ...prev,
      intro: updatedIntro
    }));
    
    const updatedData = {
      lyrics,
      chords,
      intro: updatedIntro,
      bridges: specialSections.bridges,
      bridgePositions
    };
    onChange(lyrics, updatedData);
  };

  const getChordAtGridPosition = (lineIndex, gridPosition) => {
    return chords.find(chord => 
      chord && chord.position === lineIndex && chord.gridPosition === gridPosition
    );
  };

  return (
    <div className="space-y-5 md:space-y-6" dir={direction}>
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
        <Label className="mb-2 md:mb-3 block text-sm md:text-base">אקורדים נפוצים - גרור ושחרר מעל התיבה הרצויה</Label>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {COMMON_CHORDS.map((chord) => (
            <div
              key={chord}
              draggable
              onDragStart={(e) => {
                setDraggedChord({ name: chord });
                e.dataTransfer.setData('text/plain', chord);
              }}
              className="cursor-grab bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg border shadow-sm hover:shadow-md transition-all text-xs md:text-sm font-mono touch-manipulation"
            >
              {chord}
            </div>
          ))}
          
          <div
            draggable
            onDragStart={(e) => {
              setDraggedChord({ name: CHORD_SEPARATOR });
              e.dataTransfer.setData('text/plain', CHORD_SEPARATOR);
            }}
            className="cursor-grab bg-gray-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border shadow-sm hover:shadow-md transition-all text-xs md:text-sm font-mono flex items-center touch-manipulation"
          >
            <Slash className="w-3 h-3 md:w-4 md:h-4" />
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 md:mt-4">
          <Input
            placeholder="הכנס אקורד מותאם אישית"
            value={currentCustomChord}
            onChange={(e) => setCurrentCustomChord(e.target.value)}
            className="max-w-[180px] md:max-w-[200px] text-sm"
          />
          <Button 
            variant="outline" 
            onClick={addCustomChord}
            disabled={!currentCustomChord.trim()}
            className="text-sm h-9"
          >
            הוסף
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="p-3 bg-white border border-dashed rounded-lg hover:bg-blue-50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(null, null, 'intro')}
        >
          <div className="text-center mb-2">
            <h3 className="font-medium">פתיחה</h3>
            <p className="text-xs text-gray-500">גרור לכאן אקורדים לפתיחה</p>
          </div>
          {specialSections.intro.length > 0 && (
            <div className="flex flex-wrap gap-2" dir="ltr">
              {specialSections.intro.map((chord, index) => (
                <React.Fragment key={index}>
                  <Badge 
                    className="bg-blue-100 text-blue-800"
                  >
                    {chord}
                    <button
                      onClick={() => removeChordFromIntro(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                  {index < specialSections.intro.length - 1 && <span className="text-gray-400">/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 bg-white p-4 rounded-lg border">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="relative space-y-1 group">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
              onClick={() => addBridgePosition(lineIndex)}
            >
              <ArrowRightLeft className="w-4 h-4 mr-1" />
              הוסף מעבר
            </Button>

            {bridgePositions.map((pos, bridgeIndex) => pos === lineIndex && (
              <div key={bridgeIndex} className="my-2 py-2 px-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-blue-700">מעבר:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBridge(bridgeIndex)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    הסר מעבר
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 items-center" dir="ltr">
                  {specialSections.bridges[bridgeIndex]?.map((chord, chordIndex) => (
                    <React.Fragment key={chordIndex}>
                      <Badge 
                        className="bg-blue-100 text-blue-800"
                      >
                        {chord}
                        <button
                          onClick={() => removeChordFromBridge(bridgeIndex, chordIndex)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                      {chordIndex < specialSections.bridges[bridgeIndex].length - 1 && 
                        <span className="text-gray-400">/</span>}
                    </React.Fragment>
                  ))}
                  <div 
                    className="min-w-[100px] min-h-[2em] border border-dashed border-blue-300 rounded"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(null, null, `bridge-${bridgeIndex}`)}
                  />
                </div>
              </div>
            ))}

            <div className="h-8 flex relative border-b border-gray-100" dir="ltr">
              {Array.from({ length: CHORD_GRID_SIZE }).map((_, gridPosition) => {
                const chord = getChordAtGridPosition(lineIndex, gridPosition);
                return (
                  <div
                    key={gridPosition}
                    className={`
                      flex-1 relative h-full cursor-cell
                      ${dragOverPosition?.line === lineIndex && dragOverPosition?.grid === gridPosition 
                        ? 'bg-blue-50' : ''}
                      ${chord ? 'bg-blue-50/50' : ''}
                    `}
                    onDragEnter={() => setDragOverPosition({ line: lineIndex, grid: gridPosition })}
                    onDragLeave={() => setDragOverPosition(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(lineIndex, gridPosition)}
                  >
                    {chord && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono text-blue-600">
                        {chord.name}
                      </div>
                    )}
                    {gridPosition % 4 === 0 && (
                      <div className="absolute -top-3 left-0 text-[8px] text-gray-300">
                        {gridPosition}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative pt-6">
              <span className="block py-1 text-base">{line}</span>
            </div>
          </div>
        ))}
      </div>

      <Textarea
        value={lyrics}
        onChange={handleLyricsChange}
        placeholder="הכנס את מילות השיר כאן..."
        className="font-mono min-h-[150px] md:min-h-[200px] text-sm md:text-base"
        dir={direction}
      />
    </div>
  );
}
