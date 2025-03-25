import React, { useState, useEffect } from 'react';
import { Song, User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Music, Guitar, Eye, Star, StarOff, Search, X } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.favorites) {
        loadFavorites(userData.favorites);
      } else {
        // Initialize favorites if not set
        await User.updateMyUserData({ favorites: [] });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const loadFavorites = async (favoriteIds) => {
    try {
      if (!favoriteIds || favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Load all songs first
      const allSongs = await Song.list();
      
      // Filter only favorites
      const favoriteSongs = allSongs.filter(song => 
        favoriteIds.includes(song.id)
      );
      
      setFavorites(favoriteSongs);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (songId) => {
    try {
      if (!user || !user.favorites) return;
      
      const updatedFavorites = user.favorites.filter(id => id !== songId);
      await User.updateMyUserData({ favorites: updatedFavorites });
      
      setFavorites(prev => prev.filter(song => song.id !== songId));
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const filteredFavorites = favorites.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">השירים המועדפים שלי</h1>
          <p className="text-gray-600 mt-2">גישה מהירה לשירים האהובים עליך</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-lg text-gray-500">טוען...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-white/60 shadow-sm">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">אין לך שירים מועדפים</h3>
            <p className="text-gray-500 mb-6">סמן שירים כמועדפים כדי שיופיעו כאן לגישה מהירה</p>
            <Button asChild>
              <Link to={createPageUrl("Home")}>עבור לדף הבית</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="חפש בין המועדפים שלך..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map(song => (
                <Card key={song.id} className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md border-white/60 hover:bg-white/95">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="font-semibold">{song.title}</CardTitle>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(song.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <StarOff className="w-5 h-5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Link 
                      to={createPageUrl(`Song?id=${song.id}`)}
                      className="block"
                    >
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
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}