function filterExplicit(songs) {
    songs.forEach(s => {
        if(s.track.explicit == true)
            songs.remove(s);
    });
    return songs;
}

function filterAge(songs, min, max) {
    violations = [];
    songs.forEach(s => {
        rYear = s.track.album.release_date.substring(0,4);
        if(rYear < min || rYear > max)
        songs.remove(s);
    });
    return songs;
}

function filter(songs, min, max) {
    violations = [];
    songs.forEach(s => {
        rYear = s.track.album.release_date.substring(0,4);
        if(rYear < min || rYear > max){
            songs.remove(s);
        }
    });
    return songs;
}

function filterArtist(artist, min, max) {
    violations = [];
    songs.forEach(s => {
        var lowerName = s.track.artist[0].name.toLowerCase();
        if(lowerName.equals(artist)){
            songs.remove(s);
        }
    });
    return songs;
}