
import React, { useState, useEffect } from 'react';
import { Playlist, Song, User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Music, 
  PlaySquare, 
  ChevronRight,
  ChevronLeft,
  Share2,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const PITCH_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songPitches, setSongPitches] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = urlParams.get('id');

  useEffect(() => {
    if (playlistId) {
      loadPlaylist();
    }
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      setError(null);

      const playlistData = await Playlist.get(playlistId);
      setPlaylist(playlistData);
      
      if (playlistData.songs && playlistData.songs.length > 0) {
        const allSongs = await Song.list();
        const playlistSongs = playlistData.songs
          .map(songData => {
            const song = allSongs.find(s => s.id === songData.id);
            if (song) {
              return {
                ...song,
                playlistPitch: songData.pitch || 0
              };
            }
            return null;
          })
          .filter(Boolean);
        
        setSongs(playlistSongs);
        
        const pitches = {};
        playlistData.songs.forEach(song => {
          pitches[song.id] = song.pitch || 0;
        });
        setSongPitches(pitches);
      }
    } catch (error) {
      console.error("Error loading playlist:", error);
      setError("הפלייליסט לא נמצא או שאין לך הרשאות לצפות בו");
    } finally {
      setLoading(false);
    }
  };

  const adjustPitch = async (songId, change) => {
    const newPitch = (songPitches[songId] || 0) + change;
    setSongPitches(prev => ({ ...prev, [songId]: newPitch }));
    
    try {
      setIsSaving(true);
      const updatedSongs = playlist.songs.map(song => ({
        id: song.id,
        pitch: song.id === songId ? newPitch : (song.pitch || 0)
      }));
      
      await Playlist.update(playlistId, {
        ...playlist,
        songs: updatedSongs
      });
    } catch (error) {
      console.error("Error saving pitch adjustment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const transposeChord = (chord, pitch) => {
    if (!chord || pitch === 0) return chord;
    
    if (chord.includes('/')) {
      const [baseChord, bassNote] = chord.split('/');
      return `${transposeChord(baseChord, pitch)}/${transposeChord(bassNote, pitch)}`;
    }
    
    if (chord === '/') return chord;

    const chordPattern = /^([A-G][#b]?)(.*)/;
    const match = chord.match(chordPattern);
    
    if (!match) return chord;
    
    const [_, rootNote, suffix] = match;
    
    const currentIndex = PITCH_NOTES.findIndex(note => note === rootNote);
    if (currentIndex === -1) return chord;
    
    const newIndex = (currentIndex + Math.round(pitch) + PITCH_NOTES.length) % PITCH_NOTES.length;
    
    return PITCH_NOTES[newIndex] + suffix;
  };

  const renderSongContent = (song) => {
    if (!song) return null;
    const currentPitch = songPitches[song.id] || 0;

    const renderChordLine = (lineIndex, line) => {
      if (!song.chords) return null;
      
      const lineChords = song.chords
        .filter(chord => chord.position === lineIndex)
        .sort((a, b) => (a.gridPosition || 0) - (b.gridPosition || 0));
      
      if (lineChords.length === 0) return null;
      
      // חישוב רוחב ממוצע של תו
      const measureDiv = document.createElement('div');
      measureDiv.style.visibility = 'hidden';
      measureDiv.style.position = 'absolute';
      measureDiv.style.fontSize = '1.125rem'; // text-lg
      measureDiv.style.fontFamily = 'inherit';
      measureDiv.innerText = 'א';
      document.body.appendChild(measureDiv);
      const charWidth = measureDiv.offsetWidth;
      document.body.removeChild(measureDiv);
      
      // חישוב רוחב השורה
      const lineWidth = line.length * charWidth;
      
      return (
        <div className="flex relative h-6 font-mono text-blue-600 text-sm select-none" dir="ltr">
          {lineChords.map((chord, index) => {
            // חישוב המיקום באופן יחסי לאורך השורה
            const position = Math.min((chord.gridPosition || 0) / 24 * lineWidth, lineWidth - charWidth);
            
            return (
              <div
                key={index}
                className="absolute whitespace-nowrap"
                style={{
                  left: `${position}px`,
                  transform: 'translateX(-50%)', // מרכוז האקורד מעל הנקודה
                }}
              >
                {transposeChord(chord.name, currentPitch)}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">{song.title}</h2>
            <p className="text-gray-600">{song.artist}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 rounded-lg p-2 border">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustPitch(song.id, -1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium">
                {currentPitch > 0 ? `+${currentPitch}` : currentPitch}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustPitch(song.id, 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
            
            <Link to={createPageUrl(`Song?id=${song.id}`)}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                צפה בדף השיר המלא
              </Button>
            </Link>
          </div>
        </div>

        {song.genre && (
          <Badge variant="outline">{song.genre}</Badge>
        )}
        
        <div className="mt-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/60 p-6">
          {song.intro && song.intro.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
              <h3 className="text-blue-800 font-medium mb-2">פתיחה:</h3>
              <div className="flex flex-wrap gap-2 text-blue-700 font-mono" dir="ltr">
                {song.intro.map((chord, index) => (
                  <React.Fragment key={index}>
                    <span>{transposeChord(chord, currentPitch)}</span>
                    {index < song.intro.length - 1 && " / "}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {song.lyrics.split('\n').map((line, lineIndex) => {
            const bridgeIndex = song.bridgePositions?.indexOf(lineIndex);
            const hasBridge = bridgeIndex !== -1 && bridgeIndex !== undefined;
            const bridge = hasBridge && song.bridges && song.bridges[bridgeIndex];
            
            return (
              <React.Fragment key={lineIndex}>
                {hasBridge && bridge && (
                  <div className="bg-blue-50 rounded-lg p-4 my-3 border border-blue-100">
                    <h3 className="text-blue-800 font-medium mb-2">מעבר:</h3>
                    <div className="flex flex-wrap gap-2 text-blue-700 font-mono" dir="ltr">
                      {bridge.map((chord, idx) => (
                        <React.Fragment key={idx}>
                          <span>{transposeChord(chord, currentPitch)}</span>
                          {idx < bridge.length - 1 && " / "}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4 relative">
                  {renderChordLine(lineIndex, line)}
                  <div className="text-lg leading-relaxed min-h-[1.5em] whitespace-pre-wrap" style={{ lineHeight: '2' }}>
                    {line}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const previousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }
  };

  const nextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto flex justify-center items-center h-64">
          <span className="text-lg text-gray-500">טוען...</span>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-white/60 shadow-sm">
            <PlaySquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {error || "הפלייליסט לא נמצא"}
            </h3>
            <Button asChild className="mt-4">
              <Link to={createPageUrl("Playlists")}>חזור לפלייליסטים</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Button 
            variant="ghost" 
            className="mb-3 md:mb-4 px-2 h-9"
            asChild
          >
            <Link to={createPageUrl("Playlists")}>
              <ArrowLeft className="w-4 h-4 ml-1.5" />
              חזרה לפלייליסטים
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{playlist?.name}</h1>
              {playlist?.description && (
                <p className="text-gray-600 mt-1 md:mt-2">{playlist.description}</p>
              )}
              <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                {songs.length} שירים בפלייליסט
              </p>
            </div>
          </div>
        </div>

        {songs.length > 0 && (
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-md rounded-xl border border-white/60 p-3 md:p-4 mb-5 md:mb-6">
            <Button
              variant="outline"
              onClick={previousSong}
              disabled={currentSongIndex === 0}
              className="gap-1.5 text-sm h-9"
            >
              <ChevronRight className="w-4 h-4" />
              הקודם
            </Button>
            
            <span className="text-sm md:text-base text-gray-600">
              {currentSongIndex + 1} / {songs.length}
            </span>
            
            <Button
              variant="outline"
              onClick={nextSong}
              disabled={currentSongIndex === songs.length - 1}
              className="gap-1.5 text-sm h-9"
            >
              הבא
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/60 p-4 md:p-6">
          {songs.length > 0 ? (
            renderSongContent(songs[currentSongIndex])
          ) : (
            <div className="text-center py-8 md:py-12">
              <Music className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">אין שירים בפליילסט</h3>
              <p className="text-sm md:text-base text-gray-500 mb-5 md:mb-6">הוסף שירים כדי להתחיל</p>
              <Button asChild className="text-sm md:text-base py-2 px-4">
                <Link to={createPageUrl("Home")}>חפש שירים</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
