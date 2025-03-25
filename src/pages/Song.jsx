
import React, { useState, useEffect, useRef } from 'react';
import { Song, User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { 
  Music, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ChevronsUp,
  ChevronsDown,
  Star,
  StarOff,
  Share2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import ChordDiagram from '../components/chord-display/ChordDiagram';

const PITCH_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function SongPage() {
  const [song, setSong] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [pitchChange, setPitchChange] = useState(0);
  const [chordsVisible, setChordsVisible] = useState(false);
  const scrollIntervalRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get('id');

  useEffect(() => {
    if (songId) {
      loadSong();
      loadUser();
    }
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [songId]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.favorites && userData.favorites.includes(songId)) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadSong = async () => {
    try {
      const songData = await Song.get(songId);
      setSong(songData);
      
      try {
        await Song.update(songId, {
          views: (songData.views || 0) + 1
        });
      } catch (error) {
        console.error("Error updating view count:", error);
      }
    } catch (error) {
      console.error("Error loading song:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר תחילה כדי להוסיף למועדפים",
          variant: "destructive"
        });
        return;
      }
      
      const favorites = user.favorites || [];
      
      if (isFavorite) {
        const updatedFavorites = favorites.filter(id => id !== songId);
        await User.updateMyUserData({ favorites: updatedFavorites });
        setIsFavorite(false);
        toast({
          title: "הוסר מהמועדפים",
          description: "השיר הוסר מרשימת המועדפים שלך"
        });
      } else {
        const updatedFavorites = [...favorites, songId];
        await User.updateMyUserData({ favorites: updatedFavorites });
        setIsFavorite(true);
        toast({
          title: "נוסף למועדפים",
          description: "השיר נוסף לרשימת המועדפים שלך"
        });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון המועדפים",
        variant: "destructive"
      });
    }
  };

  const toggleAutoScroll = () => {
    if (isScrolling && scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    } else {
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
      }, 50);
    }
    setIsScrolling(!isScrolling);
  };

  const adjustPitch = (halfSteps) => {
    setPitchChange(prev => prev + halfSteps);
  };

  const transposeChord = (chord) => {
    if (!chord || pitchChange === 0) return chord;
    
    if (chord.includes('/')) {
      const [baseChord, bassNote] = chord.split('/');
      return `${transposeChord(baseChord)}/${transposeChord(bassNote)}`;
    }
    
    if (chord === '/') return chord;

    const chordPattern = /^([A-G][#b]?)(.*)/;
    const match = chord.match(chordPattern);
    
    if (!match) return chord;
    
    const [_, rootNote, suffix] = match;
    
    const currentIndex = PITCH_NOTES.findIndex(note => note === rootNote);
    if (currentIndex === -1) return chord;
    
    const newIndex = (currentIndex + Math.round(pitchChange) + PITCH_NOTES.length) % PITCH_NOTES.length;
    
    return PITCH_NOTES[newIndex] + suffix;
  };

  const renderSongContent = () => {
    if (!song) return null;

    const renderChordLine = (lineIndex, line) => {
      if (!song.chords) return null;
      
      const lineChords = song.chords
        .filter(chord => chord.position === lineIndex)
        .sort((a, b) => (a.gridPosition || 0) - (b.gridPosition || 0));
      
      if (lineChords.length === 0) return null;
      
      return (
        <div className="flex relative h-6 font-mono text-blue-600 text-sm select-none" dir="ltr">
          {lineChords.map((chord, index) => {
            return (
              <div
                key={index}
                className="absolute whitespace-nowrap"
                style={{
                  left: `${(chord.gridPosition / 24) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {transposeChord(chord.name)}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/60 p-6 md:p-8 shadow-sm">
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
                        <span>{transposeChord(chord)}</span>
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
    );
  };

  const handleAddToPlaylist = async () => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר תחילה כדי להוסיף לפלייליסט",
        variant: "destructive"
      });
      return;
    }
    window.location.href = createPageUrl("Playlists");
  };

  if (!song) return null;

  const uniqueChords = [...new Set(song.chords ? song.chords.map(chord => transposeChord(chord.name)).filter(name => name !== '/') : [])];

  return (
    <div className="min-h-screen p-3 md:p-6" dir={song?.direction || 'rtl'}>
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-xl overflow-hidden mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div 
            className="absolute inset-0 opacity-20 bg-center bg-cover"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')"
            }}
          ></div>
          <div className="relative p-5 md:p-8 text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{song?.title}</h1>
            <p className="text-lg md:text-xl text-white/90">{song?.artist}</p>
            
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
              <Button 
                variant={isFavorite ? "default" : "outline"}
                className="gap-1.5 md:gap-2 text-sm md:text-base py-1.5 h-auto md:h-10"
                onClick={toggleFavorite}
              >
                {isFavorite ? (
                  <>
                    <StarOff className="w-4 h-4 shrink-0" />
                    <span>הסר ממועדפים</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 shrink-0" />
                    <span>הוסף למועדפים</span>
                  </>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="gap-1.5 md:gap-2 text-sm md:text-base py-1.5 h-auto md:h-10"
                  >
                    <Music className="w-4 h-4 shrink-0" />
                    <span>הוסף לפלייליסט</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleAddToPlaylist}>
                    הוסף לפלייליסט
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="secondary" 
                className="gap-1.5 md:gap-2 text-sm md:text-base py-1.5 h-auto md:h-10"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>שתף</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="sticky top-0 bg-white/90 backdrop-blur-md rounded-xl border border-white/60 shadow-sm mb-6 md:mb-8 z-10 p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={isScrolling ? "secondary" : "outline"}
                className="gap-1.5 text-sm h-9"
                onClick={toggleAutoScroll}
              >
                <Music className="w-4 h-4" />
                {isScrolling ? 'עצור גלילה' : 'גלילה אוטומטית'}
              </Button>
              
              {isScrolling && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setScrollSpeed(Math.max(0.5, scrollSpeed - 0.5))}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <span className="text-sm min-w-[60px] text-center">מהירות: {scrollSpeed}x</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setScrollSpeed(scrollSpeed + 0.5)}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">טון:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => adjustPitch(-1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center text-sm">
                  {pitchChange > 0 ? `+${pitchChange}` : pitchChange}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => adjustPitch(1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                className="gap-1.5 text-sm h-9"
                onClick={() => setChordsVisible(!chordsVisible)}
              >
                {chordsVisible ? <ChevronsDown className="w-4 h-4" /> : <ChevronsUp className="w-4 h-4" />}
                {chordsVisible ? 'הסתר' : 'הצג אקורדים'}
              </Button>
            </div>
          </div>
        </div>

        {chordsVisible && uniqueChords.length > 0 && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
            {uniqueChords.map(chord => (
              <ChordDiagram key={chord} name={chord} />
            ))}
          </div>
        )}

        {song.intro && song.intro.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <h3 className="text-blue-800 font-medium mb-2">פתיחה:</h3>
            <div className="flex flex-wrap gap-2 text-blue-700 font-mono" dir="ltr">
              {song.intro.map((chord, index) => (
                <React.Fragment key={index}>
                  <span>{transposeChord(chord)}</span>
                  {index < song.intro.length - 1 && " / "}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {renderSongContent()}

        {song.youtube_id && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">הקלטה:</h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${song.youtube_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
