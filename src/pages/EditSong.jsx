import React, { useState, useEffect } from 'react';
import { Song } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LyricsEditor from '../components/song-editor/LyricsEditor';

export default function EditSongPage() {
  const navigate = useNavigate();
  const [songData, setSongData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [textDirection, setTextDirection] = useState('rtl');
  
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get('id');

  useEffect(() => {
    if (songId) {
      loadSong();
    } else {
      setSongData({
        title: '',
        artist: '',
        lyrics: '',
        chords: [],
        intro: [],
        bridges: [],
        bridgePositions: [],
        direction: 'rtl',
        genre: '',
        youtube_id: ''
      });
    }
  }, [songId]);

  const loadSong = async () => {
    try {
      const data = await Song.get(songId);
      setSongData(data);
      setTextDirection(data.direction || 'rtl');
    } catch (error) {
      console.error("Error loading song:", error);
    }
  };

  const handleDirectionChange = (direction) => {
    setTextDirection(direction);
    updateSong({ ...songData, direction });
  };

  const updateSong = (updates) => {
    setSongData(prev => ({ ...prev, ...updates }));
  };

  const handleLyricsChange = (lyrics, chordsData) => {
    updateSong({ 
      lyrics, 
      chords: chordsData.chords || [], 
      intro: chordsData.intro || [],
      bridges: chordsData.bridges || [],
      bridgePositions: chordsData.bridgePositions || []
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (songId) {
        await Song.update(songId, songData);
      } else {
        const newSong = await Song.create(songData);
        navigate(createPageUrl(`Song?id=${newSong.id}`));
      }
    } catch (error) {
      console.error("Error saving song:", error);
    }
    setIsSaving(false);
  };

  if (!songData) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div 
            className="absolute inset-0 opacity-20 bg-center bg-cover"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1513883049090-d91fb22cf035?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')"
            }}
          ></div>
          <div className="relative p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{songId ? 'עריכת שיר' : 'הוספת שיר חדש'}</h1>
            <p className="text-lg text-white/90">הזן את פרטי השיר והאקורדים</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/60 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>כותרת השיר</Label>
              <Input
                value={songData.title}
                onChange={(e) => updateSong({ title: e.target.value })}
                placeholder="הכנס את שם השיר"
              />
            </div>
            <div>
              <Label>אמן</Label>
              <Input
                value={songData.artist}
                onChange={(e) => updateSong({ artist: e.target.value })}
                placeholder="שם האמן"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>סגנון מוזיקלי</Label>
              <Input
                value={songData.genre}
                onChange={(e) => updateSong({ genre: e.target.value })}
                placeholder="למשל: רוק, פופ, ג'אז"
              />
            </div>
            <div>
              <Label>מזהה יוטיוב (אופציונלי)</Label>
              <Input
                value={songData.youtube_id}
                onChange={(e) => updateSong({ youtube_id: e.target.value })}
                placeholder="הכנס את מזהה הסרטון מיוטיוב"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>כיוון טקסט:</Label>
            <div className="flex gap-2">
              <Button
                variant={textDirection === 'rtl' ? "default" : "outline"}
                size="sm"
                onClick={() => handleDirectionChange('rtl')}
              >
                עברית (RTL)
              </Button>
              <Button
                variant={textDirection === 'ltr' ? "default" : "outline"}
                size="sm"
                onClick={() => handleDirectionChange('ltr')}
              >
                English (LTR)
              </Button>
            </div>
          </div>

          <LyricsEditor
            initialLyrics={songData.lyrics}
            initialChords={songData}
            onChange={handleLyricsChange}
            direction={textDirection}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'שומר...' : (songId ? 'עדכן שיר' : 'צור שיר')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}