
import React, { useState, useEffect } from 'react';
import { Playlist, Song, User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Music, 
  PlaySquare, 
  Plus, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Search, 
  Save,
  Check,
  X
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    is_public: true,
    songs: []
  });
  const [songs, setSongs] = useState([]);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [showNewPlaylistDialog, setShowNewPlaylistDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('playlists');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playlistsData, songsData] = await Promise.all([
        Playlist.list(),
        Song.list()
      ]);
      setPlaylists(playlistsData);
      setSongs(songsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name) return;
    
    try {
      await Playlist.create({
        name: newPlaylist.name,
        description: newPlaylist.description,
        songs: [],
        is_public: newPlaylist.is_public
      });
      
      setNewPlaylist({
        name: '',
        description: '',
        is_public: true,
        songs: []
      });
      
      await loadData();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const handleCreatePlaylistFromSelection = async () => {
    if (!newPlaylistName) return;
    
    try {
      await Playlist.create({
        name: newPlaylistName,
        description: newPlaylistDescription,
        songs: selectedSongs.map(songId => ({
          id: songId,
          pitch: 0
        })),
        is_public: true
      });
      
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setSelectedSongs([]);
      setShowNewPlaylistDialog(false);
      setShowMultiSelect(false);
      
      await loadData();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!editingPlaylist) return;
    
    try {
      const updatedSongs = editingPlaylist.songs.map(songId => ({
        id: typeof songId === 'object' ? songId.id : songId,
        pitch: typeof songId === 'object' ? songId.pitch || 0 : 0
      }));

      await Playlist.update(editingPlaylist.id, {
        name: editingPlaylist.name,
        description: editingPlaylist.description,
        songs: updatedSongs,
        is_public: editingPlaylist.is_public
      });
      
      setEditingPlaylist(null);
      await loadData();
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הפלייליסט?")) return;
    
    try {
      await Playlist.delete(playlistId);
      await loadData();
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const getPlaylistSongs = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || !playlist.songs) return [];
    
    return songs.filter(song => 
      playlist.songs.some(playlistSong => 
        (typeof playlistSong === 'object' ? playlistSong.id : playlistSong) === song.id
      )
    );
  };

  const toggleSongInPlaylist = (songId) => {
    if (!editingPlaylist) return;
    
    const currentSongs = Array.isArray(editingPlaylist.songs) ? editingPlaylist.songs : [];
    let updatedSongs;
    
    if (currentSongs.some(song => (typeof song === 'object' ? song.id : song) === songId)) {
      updatedSongs = currentSongs.filter(song => (typeof song === 'object' ? song.id : song) !== songId);
    } else {
      updatedSongs = [...currentSongs, { id: songId, pitch: 0 }];
    }
    
    setEditingPlaylist({
      ...editingPlaylist,
      songs: updatedSongs
    });
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongs(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlaylistsTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <span className="text-lg text-gray-500">טוען...</span>
        </div>
      );
    }
    
    if (playlists.length === 0) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-white/60 shadow-sm">
          <PlaySquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">אין לך פלייליסטים</h3>
          <p className="text-gray-500 mb-6">צור את הפלייליסט הראשון שלך כדי לארגן את השירים האהובים עליך</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button>צור פלייליסט חדש</Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-lg" dir="rtl">
            </SheetContent>
          </Sheet>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map(playlist => (
          <Card 
            key={playlist.id} 
            className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md border-white/60"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="font-semibold">{playlist.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingPlaylist(playlist)}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {playlist.description && (
                <p className="text-sm text-gray-500">{playlist.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm text-gray-600 mb-2">
                  {getPlaylistSongs(playlist.id).length} שירים
                </div>
                {getPlaylistSongs(playlist.id).slice(0, 3).map(song => (
                  <div 
                    key={song.id}
                    className="flex items-center justify-between py-1 border-b last:border-0"
                  >
                    <div className="flex items-center">
                      <Music className="w-3.5 h-3.5 text-gray-500 ml-2" />
                      <span className="text-sm text-gray-700">{song.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{song.artist}</span>
                  </div>
                ))}
                {getPlaylistSongs(playlist.id).length > 3 && (
                  <div className="text-center text-xs text-blue-600 mt-2">
                    +{getPlaylistSongs(playlist.id).length - 3} שירים נוספים
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                asChild
              >
                <Link to={createPageUrl(`Playlist?id=${playlist.id}`)}>
                  <span className="flex items-center gap-1">
                    <ChevronRight className="w-4 h-4" />
                    צפה בפלייליסט
                  </span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderSongsTab = () => {
    return (
      <>
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="חפש שירים לפי שם או אמן..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {selectedSongs.length > 0 && showMultiSelect && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200 flex justify-between items-center">
            <div className="flex items-center">
              <Badge className="bg-blue-500">{selectedSongs.length} שירים נבחרו</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSongs([])}
              >
                נקה בחירה
              </Button>
              <Button
                onClick={() => setShowNewPlaylistDialog(true)}
              >
                צור פלייליסט
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map(song => (
            <Card 
              key={song.id} 
              className={`
                bg-white/90 transition-all 
                ${showMultiSelect ? 'cursor-pointer hover:bg-blue-50' : 'hover:shadow-md'}
                ${selectedSongs.includes(song.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              `}
              onClick={() => showMultiSelect && toggleSongSelection(song.id)}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {showMultiSelect && (
                      <Checkbox
                        checked={selectedSongs.includes(song.id)}
                        onCheckedChange={() => toggleSongSelection(song.id)}
                        className="mt-1"
                      />
                    )}
                    <div>
                      <CardTitle className="text-base font-medium">{song.title}</CardTitle>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                      {song.genre && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {song.genre}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!showMultiSelect && (
                    <Link to={createPageUrl(`Song?id=${song.id}`)}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">הפלייליסטים שלי</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">ארגן את השירים שלך באוספים</p>
          </div>
          
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="gap-1.5 text-sm h-9 md:h-10">
                  <Plus className="w-4 h-4" />
                  פלייליסט חדש
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-lg" dir="rtl">
                <SheetHeader>
                  <SheetTitle>יצירת פלייליסט חדש</SheetTitle>
                  <SheetDescription>
                    צור פלייליסט חדש ומלא אותו בשירים
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">שם הפלייליסט</Label>
                    <Input
                      id="name"
                      value={newPlaylist.name}
                      onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                      placeholder="הכנס שם לפלייליסט"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">תיאור</Label>
                    <Textarea
                      id="description"
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                      placeholder="תיאור קצר (אופציונלי)"
                    />
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Switch
                      id="public"
                      checked={newPlaylist.is_public}
                      onCheckedChange={(checked) => setNewPlaylist({...newPlaylist, is_public: checked})}
                    />
                    <Label htmlFor="public">פלייליסט ציבורי</Label>
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button 
                      disabled={!newPlaylist.name} 
                      onClick={handleCreatePlaylist}
                      className="w-full md:w-auto"
                    >
                      צור פלייליסט
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <Button
              variant={showMultiSelect ? "secondary" : "outline"}
              onClick={() => setShowMultiSelect(!showMultiSelect)}
              className="gap-1.5 text-sm h-9 md:h-10"
            >
              <Check className="w-4 h-4" />
              בחירה מרובה
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-5 md:mb-6">
          <TabsList className="overflow-x-auto flex-nowrap">
            <TabsTrigger value="playlists" className="py-2">
              <PlaySquare className="w-4 h-4 mr-1.5" />
              הפלייליסטים שלי
            </TabsTrigger>
            <TabsTrigger value="songs" className="py-2">
              <Music className="w-4 h-4 mr-1.5" />
              כל השירים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="playlists" className="mt-0">
            {renderPlaylistsTab()}
          </TabsContent>

          <TabsContent value="songs" className="mt-0">
            {renderSongsTab()}
          </TabsContent>
        </Tabs>
      </div>

      {editingPlaylist && (
        <Sheet open={!!editingPlaylist} onOpenChange={() => setEditingPlaylist(null)}>
          <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
            <SheetHeader>
              <SheetTitle>עריכת פלייליסט</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">שם הפלייליסט</Label>
                <Input
                  id="edit-name"
                  value={editingPlaylist.name}
                  onChange={(e) => setEditingPlaylist({...editingPlaylist, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">תיאור</Label>
                <Textarea
                  id="edit-description"
                  value={editingPlaylist.description || ''}
                  onChange={(e) => setEditingPlaylist({...editingPlaylist, description: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <Switch
                  id="edit-public"
                  checked={editingPlaylist.is_public}
                  onCheckedChange={(checked) => setEditingPlaylist({...editingPlaylist, is_public: checked})}
                />
                <Label htmlFor="edit-public">פלייליסט ציבורי</Label>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <Label>שירים בפלייליסט</Label>
                  <Input
                    placeholder="חפש שירים..."
                    className="w-[180px]"
                    size="sm"
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {songs.map(song => (
                    <div 
                      key={song.id} 
                      className={`
                        flex items-center justify-between p-2 rounded-lg transition-colors ${
                          editingPlaylist.songs.includes(song.id) 
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-100'
                        }`}
                      onClick={() => toggleSongInPlaylist(song.id)}
                    >
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-500">{song.artist}</div>
                      </div>
                      <div className="flex items-center">
                        {editingPlaylist.songs.includes(song.id) ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            ✓
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleUpdatePlaylist}>
                שמור שינויים
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {showNewPlaylistDialog && (
        <Sheet open={showNewPlaylistDialog} onOpenChange={setShowNewPlaylistDialog}>
          <SheetContent side="left" className="w-full sm:max-w-lg" dir="rtl">
            <SheetHeader>
              <SheetTitle>יצירת פלייליסט חדש מהשירים שנבחרו</SheetTitle>
              <SheetDescription>
                {selectedSongs.length} שירים נבחרו
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">שם הפלייליסט</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="הכנס שם לפלייליסט"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playlist-description">תיאור</Label>
                <Textarea
                  id="playlist-description"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="תיאור קצר (אופציונלי)"
                />
              </div>
              
              <div className="py-2">
                <h3 className="text-sm font-medium mb-2">שירים שנבחרו:</h3>
                <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2">
                  {selectedSongs.map(songId => {
                    const song = songs.find(s => s.id === songId);
                    return song ? (
                      <div key={songId} className="py-1 flex justify-between border-b last:border-b-0">
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-500">{song.artist}</div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
            <SheetFooter>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewPlaylistDialog(false)}
                >
                  ביטול
                </Button>
                <Button
                  className="flex-1"
                  disabled={!newPlaylistName}
                  onClick={handleCreatePlaylistFromSelection}
                >
                  <Save className="w-4 h-4 mr-2" />
                  צור פלייליסט
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
