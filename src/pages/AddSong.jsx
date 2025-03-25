import React, { useState, useRef, useEffect } from 'react';
import { Song } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Save, ArrowLeft, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ChordDiagram from "../components/chord-display/ChordDiagram";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "מתחילים" },
  { value: "intermediate", label: "בינוני" },
  { value: "advanced", label: "מתקדם" }
];

const GENRES = [
  "פופ", "רוק", "פולק", "חסידי", "מזרחי", "ג'אז", "בלוז", "קאנטרי", "אלטרנטיבי", "קלאסי", "אחר"
];

export default function AddSongPage() {
  const navigate = useNavigate();
  const [songData, setSongData] = useState({
    title: "",
    artist: "",
    genre: "פופ",
    difficulty: "beginner",
    lyrics: "",
    chords: [],
    youtube_id: ""
  });
  
  const [activeTab, setActiveTab] = useState("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChord, setCurrentChord] = useState("");
  const [currentWord, setCurrentWord] = useState(null);
  const lyricsRef = useRef(null);
  
  // Parse YouTube URL to extract ID
  const handleYoutubeUrl = (url) => {
    if (!url) {
      setSongData(prev => ({ ...prev, youtube_id: "" }));
      return;
    }
    
    try {
      let youtubeId = url;
      
      // Handle full YouTube URLs
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const urlObj = new URL(url);
        
        if (url.includes('youtube.com/watch')) {
          youtubeId = urlObj.searchParams.get('v');
        } else if (url.includes('youtu.be/')) {
          youtubeId = urlObj.pathname.split('/')[1];
        } else if (url.includes('youtube.com/embed/')) {
          youtubeId = urlObj.pathname.split('/')[2];
        }
      }
      
      setSongData(prev => ({ ...prev, youtube_id: youtubeId }));
    } catch (error) {
      // If URL parsing fails, just use the input as is
      setSongData(prev => ({ ...prev, youtube_id: url }));
    }
  };
  
  // Add chord to the current line at the specific word
  const addChord = () => {
    if (!currentChord || currentWord === null) return;
    
    const newChords = [...songData.chords.filter(c => 
      !(c.position === currentLine && c.word === currentWord)
    )];
    
    newChords.push({
      name: currentChord,
      position: currentLine,
      word: currentWord
    });
    
    setSongData(prev => ({ ...prev, chords: newChords }));
    setCurrentChord("");
  };
  
  // Remove chord from a specific position
  const removeChord = (line, word) => {
    const newChords = songData.chords.filter(c => 
      !(c.position === line && c.word === word)
    );
    setSongData(prev => ({ ...prev, chords: newChords }));
  };
  
  // Handle click on a word to add a chord
  const handleWordClick = (lineIndex, wordIndex) => {
    setCurrentLine(lineIndex);
    setCurrentWord(wordIndex);
  };
  
  // Extract the words from a line for chord placement
  const getWords = (line) => {
    if (!line) return [];
    return line.split(/\s+/);
  };
  
  // Process lyrics to render with chords
  const processedLyrics = () => {
    if (!songData.lyrics) return [];
    return songData.lyrics.split('\n');
  };
  
  // Find a chord at a specific position
  const getChordAtPosition = (lineIndex, wordIndex) => {
    return songData.chords.find(c => 
      c.position === lineIndex && c.word === wordIndex
    );
  };
  
  // Submit the song to the database
  const handleSubmit = async () => {
    if (!songData.title || !songData.artist || !songData.lyrics) {
      alert("נא למלא את כל השדות החובה: שם השיר, אמן ומילים");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert the chord format to match the database schema
      const processedChords = songData.chords.map(chord => ({
        name: chord.name,
        position: chord.position
      }));
      
      const songToSave = {
        ...songData,
        chords: processedChords,
        views: 0,
        rating: 0
      };
      
      await Song.create(songToSave);
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error saving song:", error);
      alert("אירעה שגיאה בשמירת השיר. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update chord data when changing lyrics
  useEffect(() => {
    const lines = processedLyrics();
    const validChords = songData.chords.filter(chord => 
      chord.position < lines.length && 
      chord.word < getWords(lines[chord.position]).length
    );
    
    if (validChords.length !== songData.chords.length) {
      setSongData(prev => ({ ...prev, chords: validChords }));
    }
  }, [songData.lyrics]);
  
  // Get unique chords to display diagrams
  const uniqueChords = [...new Set(songData.chords.map(c => c.name))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">הוספת שיר חדש</h1>
            <p className="text-gray-500">הוסף שיר חדש למאגר עם אקורדים</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="edit">עריכה</TabsTrigger>
            <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>פרטי שיר</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">כותרת השיר *</Label>
                    <Input
                      id="title"
                      value={songData.title}
                      onChange={(e) => setSongData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="הכנס את שם השיר"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artist">אמן / להקה *</Label>
                    <Input
                      id="artist"
                      value={songData.artist}
                      onChange={(e) => setSongData(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="הכנס את שם האמן"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="genre">ז'אנר</Label>
                    <Select
                      value={songData.genre}
                      onValueChange={(value) => setSongData(prev => ({ ...prev, genre: value }))}
                    >
                      <SelectTrigger id="genre">
                        <SelectValue placeholder="בחר ז'אנר" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">רמת קושי</Label>
                    <Select
                      value={songData.difficulty}
                      onValueChange={(value) => setSongData(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="בחר רמת קושי" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="youtube">קישור לסרטון YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="הכנס קישור יוטיוב או מזהה סרטון"
                      onChange={(e) => handleYoutubeUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      אפשר להזין URL מלא או רק את מזהה הסרטון (לדוגמה: dQw4w9WgXcQ)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="border-b">
                <CardTitle>מילים ואקורדים</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <Label htmlFor="lyrics">מילים *</Label>
                    <Textarea
                      id="lyrics"
                      ref={lyricsRef}
                      value={songData.lyrics}
                      onChange={(e) => setSongData(prev => ({ ...prev, lyrics: e.target.value }))}
                      placeholder="הכנס את מילות השיר"
                      className="h-64 font-mono text-base"
                    />
                    <p className="text-xs text-gray-500">
                      הכנס כל שורה בשורה נפרדת. לאחר מכן לחץ על מילה כדי להוסיף אקורד.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chord">הוסף אקורד</Label>
                      <div className="flex gap-2">
                        <Input
                          id="chord"
                          value={currentChord}
                          onChange={(e) => setCurrentChord(e.target.value)}
                          placeholder="דוגמה: Am"
                        />
                        <Button 
                          onClick={addChord} 
                          disabled={!currentChord || currentWord === null}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        בחר מילה בטקסט ואז הוסף אקורד
                      </p>
                    </div>
                    
                    {uniqueChords.length > 0 && (
                      <div className="space-y-2 border-t pt-4">
                        <Label>אקורדים בשימוש</Label>
                        <div className="flex flex-wrap gap-2">
                          {uniqueChords.map(chord => (
                            <Badge 
                              key={chord} 
                              variant="secondary"
                              className="text-base py-1 px-3"
                            >
                              <Music className="w-3 h-3 mr-1" />
                              {chord}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {songData.chords.length > 0 && (
                      <div>
                        <ChordDiagram name={songData.chords[0].name} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Chord placement interface */}
            {songData.lyrics && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>מיקום אקורדים</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500 mb-4">
                    לחץ על מילה כדי להוסיף אקורד. לחץ על אקורד קיים כדי להסיר.
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    {processedLyrics().map((line, lineIndex) => (
                      <div key={lineIndex} className="mb-4">
                        {getWords(line).map((word, wordIndex) => {
                          const chord = getChordAtPosition(lineIndex, wordIndex);
                          return (
                            <span 
                              key={wordIndex} 
                              className="relative inline-block mr-2 mb-6 cursor-pointer"
                              onClick={() => handleWordClick(lineIndex, wordIndex)}
                            >
                              {chord && (
                                <Badge 
                                  className="absolute -top-6 bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeChord(lineIndex, wordIndex);
                                  }}
                                >
                                  {chord.name}
                                </Badge>
                              )}
                              <span className={`${
                                currentLine === lineIndex && currentWord === wordIndex 
                                  ? 'bg-blue-100 rounded px-1' 
                                  : chord 
                                    ? 'underline decoration-blue-300' 
                                    : ''
                              }`}>
                                {word}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="preview">
            {/* Preview how the song will look */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">{songData.title || "כותרת השיר"}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <span>{songData.artist || "שם האמן"}</span>
                    <Badge variant="secondary">{songData.genre}</Badge>
                    <Badge 
                      variant="outline" 
                      className={
                        songData.difficulty === 'beginner' ? 'text-green-600 border-green-600' :
                        songData.difficulty === 'intermediate' ? 'text-yellow-600 border-yellow-600' :
                        'text-red-600 border-red-600'
                      }
                    >
                      {DIFFICULTY_LEVELS.find(d => d.value === songData.difficulty)?.label}
                    </Badge>
                  </div>
                </div>
                
                {songData.youtube_id && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${songData.youtube_id}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
                
                {/* Chord Diagrams */}
                {uniqueChords.length > 0 && (
                  <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uniqueChords.map(chord => (
                      <ChordDiagram key={chord} name={chord} />
                    ))}
                  </div>
                )}
                
                {/* Lyrics with Chords */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  {processedLyrics().map((line, lineIndex) => (
                    <div key={lineIndex} className="mb-4 text-lg leading-relaxed">
                      {getWords(line).map((word, wordIndex) => {
                        const chord = getChordAtPosition(lineIndex, wordIndex);
                        return (
                          <span key={wordIndex} className="relative inline-block mr-2">
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("Home"))}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !songData.title || !songData.artist || !songData.lyrics}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            שמור שיר
          </Button>
        </div>
      </div>
    </div>
  );
}