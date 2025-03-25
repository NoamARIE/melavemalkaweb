import Layout from "./Layout.jsx";

import Home from "./Home";

import Song from "./Song";

import AddSong from "./AddSong";

import EditSong from "./EditSong";

import Favorites from "./Favorites";

import Playlists from "./Playlists";

import Playlist from "./Playlist";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Song: Song,
    
    AddSong: AddSong,
    
    EditSong: EditSong,
    
    Favorites: Favorites,
    
    Playlists: Playlists,
    
    Playlist: Playlist,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Song" element={<Song />} />
                
                <Route path="/AddSong" element={<AddSong />} />
                
                <Route path="/EditSong" element={<EditSong />} />
                
                <Route path="/Favorites" element={<Favorites />} />
                
                <Route path="/Playlists" element={<Playlists />} />
                
                <Route path="/Playlist" element={<Playlist />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}