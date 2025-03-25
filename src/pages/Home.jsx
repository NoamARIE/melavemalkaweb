
import React, { useState, useEffect } from 'react';
import { Song } from '@/api/entities';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Clock, Star, Music, Guitar, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function HomePage() {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    const data = await Song.list('-views');
    setSongs(data);
    setLoading(false);
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchResults = searchQuery.length > 0 
    ? songs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const genreGroups = songs.reduce((acc, song) => {
    if (!song.genre) return acc;
    if (!acc[song.genre]) acc[song.genre] = [];
    acc[song.genre].push(song);
    return acc;
  }, {});

  const featuredGenres = Object.keys(genreGroups).slice(0, 3);

  return (
    <div dir="rtl">
      {/* Hero Section - Improved for mobile */}
      <div className="relative w-full mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div 
          className="absolute inset-0 opacity-30 bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')"
          }}
        ></div>
        
        {/* Musical notes decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26.7,16c0,4.142-3.358,7.5-7.5,7.5S11.7,20.642,11.7,16c0-4.142,3.358-7.5,7.5-7.5 4.142 0 7.5 3.358 7.5 7.5zm15 0c0,4.142-3.358,7.5-7.5,7.5S26,20.642,26,16c0-4.142,3.358-7.5,7.5-7.5 4.142 0 7.5 3.358 7.5 7.5z' fill='%23FFFFFF' fill-opacity='0.4'/%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative px-4 py-20 md:px-6 md:py-28">
          <div className="text-center text-white max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-8 md:mb-12 drop-shadow-lg">מלווה מלכה</h1>

            <div className="relative max-w-xl mx-auto">
              <Popover open={searchOpen && searchQuery.length > 0} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="חפש שירים לפי שם או אמן..."
                      className="pr-12 h-12 text-base md:h-14 md:text-lg bg-white/15 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 rounded-full w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchOpen(true)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[calc(100vw-2rem)] max-w-xl" align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
                      <CommandGroup heading="שירים">
                        {searchResults.map(song => (
                          <Link 
                            key={song.id} 
                            to={createPageUrl(`Song?id=${song.id}`)}
                            onClick={() => setSearchOpen(false)}
                          >
                            <CommandItem className="cursor-pointer py-3">
                              <Music className="ml-2 h-4 w-4" />
                              <span className="font-medium">{song.title}</span>
                              <span className="text-gray-500 mr-2">- {song.artist}</span>
                            </CommandItem>
                          </Link>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Quick Actions - Better grid for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <Link to={createPageUrl("EditSong")} className="block">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all h-full">
              <CardContent className="p-4 md:p-6 flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-blue-800">הוסף שיר חדש</h3>
                  <p className="text-blue-600 text-sm md:text-base">שתף שירים עם הקהילה</p>
                </div>
                <Guitar className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to={createPageUrl("Playlists")} className="block">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all h-full">
              <CardContent className="p-4 md:p-6 flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-purple-800">פלייליסטים</h3>
                  <p className="text-purple-600 text-sm md:text-base">צור אוספים מותאמים אישית</p>
                </div>
                <Music className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to={createPageUrl("Favorites")} className="block">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-md transition-all h-full">
              <CardContent className="p-4 md:p-6 flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-indigo-800">מועדפים</h3>
                  <p className="text-indigo-600 text-sm md:text-base">שמור שירים לגישה מהירה</p>
                </div>
                <Star className="w-10 h-10 md:w-12 md:h-12 text-indigo-400" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabs - Improved for touch */}
        <Tabs defaultValue="trending" className="mb-8 md:mb-12">
          <TabsList className="w-full justify-start border-b p-0 bg-white/80 backdrop-blur-md rounded-xl overflow-x-auto flex-nowrap">
            <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-blue-100 py-3">
              <TrendingUp className="w-4 h-4" />
              פופולרי
            </TabsTrigger>
            <TabsTrigger value="latest" className="gap-2 data-[state=active]:bg-blue-100 py-3">
              <Clock className="w-4 h-4" />
              חדש
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-2 data-[state=active]:bg-blue-100 py-3">
              <Star className="w-4 h-4" />
              הכי נצפה
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSongs.map(song => (
                <Link 
                  key={song.id} 
                  to={createPageUrl(`Song?id=${song.id}`)}
                  className="block group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md border-white/60 group-hover:bg-white/95 h-full">
                    <CardHeader>
                      <CardTitle className="font-semibold">{song.title}</CardTitle>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Guitar className="w-4 h-4" />
                          {song.genre || "כללי"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {song.views || 0} צפיות
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="latest" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Display songs sorted by creation date */}
              {[...filteredSongs]
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                .map(song => (
                <Link 
                  key={song.id} 
                  to={createPageUrl(`Song?id=${song.id}`)}
                  className="block group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md border-white/60 group-hover:bg-white/95 h-full">
                    <CardHeader>
                      <CardTitle className="font-semibold">{song.title}</CardTitle>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Guitar className="w-4 h-4" />
                          {song.genre || "כללי"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          חדש
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="popular" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Display songs sorted by view count */}
              {[...filteredSongs]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .map(song => (
                <Link 
                  key={song.id} 
                  to={createPageUrl(`Song?id=${song.id}`)}
                  className="block group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md border-white/60 group-hover:bg-white/95 h-full">
                    <CardHeader>
                      <CardTitle className="font-semibold">{song.title}</CardTitle>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Guitar className="w-4 h-4" />
                          {song.genre || "כללי"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {song.views || 0} צפיות
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Browse by genre */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">דפדף לפי סגנון</h2>
          
          <div className="space-y-8">
            {featuredGenres.map(genre => (
              <div key={genre}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">{genre}</h3>
                  <Button variant="ghost" className="text-blue-600">הצג הכל</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {genreGroups[genre].slice(0, 4).map(song => (
                    <Link 
                      key={song.id} 
                      to={createPageUrl(`Song?id=${song.id}`)}
                      className="block group"
                    >
                      <Card className="hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-md border-white/60 group-hover:bg-white/95">
                        <CardContent className="p-4">
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-gray-500">{song.artist}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
