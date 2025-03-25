import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Plus } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SongHeader({ song, onAddToPlaylist }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
      <div className="flex items-center gap-4 text-gray-600 mb-4 flex-wrap">
        <span>{song.artist}</span>
        <Badge variant="secondary">{song.genre}</Badge>
        <Badge 
          variant="outline" 
          className={
            song.difficulty === 'beginner' ? 'text-green-600 border-green-600' :
            song.difficulty === 'intermediate' ? 'text-yellow-600 border-yellow-600' :
            'text-red-600 border-red-600'
          }
        >
          {song.difficulty === 'beginner' ? 'מתחילים' : 
           song.difficulty === 'intermediate' ? 'בינוני' : 'מתקדם'}
        </Badge>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" className="gap-2">
          <Heart className="w-4 h-4" />
          מועדפים
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              הוסף לפלייליסט
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onAddToPlaylist && onAddToPlaylist('new')}>
              צור פלייליסט חדש
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          שתף
        </Button>
      </div>
    </div>
  );
}