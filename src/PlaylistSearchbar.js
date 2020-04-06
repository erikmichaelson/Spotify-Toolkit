import React from "react";
import ReactDOM from "react-dom";
import "./PlaylistSearchbar.css";
import SearchField from "react-search-field";
import Chip from "@material-ui/core/Chip";
import * as $ from "jquery";
import hash from "./hash";
import TextField from "@material-ui/core/TextField";

//import Button from "@material-ui/core/Button";

class PlaylistSearchbar extends React.Component {
  constructor() {
    super();

    this.state = {
      playlists: [],
    };
  }

  search(value) {
   
    var searchCleaned = value.replace(" ", "%20") + "&type=playlist";

    $.ajax({
      url: "https://api.spotify.com/v1/search?q=" + searchCleaned,
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      success: (data) => {
        if (!data) {
          return;
        }
        var playlistNames = [];
        data.playlists.items.forEach((playlist) => {
          console.log(playlist);
          playlistNames.push({
            name: playlist.name,
            owner: playlist.owner.id,
            tracks: playlist.tracks,
            id: playlist.id,
            uri: playlist.uri,
          });
        });
        this.setState({
          playlists: playlistNames,
        });

        this.forceUpdate();
      },
    });
  }


  addToPool(playlist){


      this.forceUpdate();
  }

  render() {
    return (
      <div>
        <h3>Search Public Playlists</h3>
        <SearchField
          classNames="searchbar"
          placeholder="Search for Playlist"
          onEnter={(value) => this.search(value)}
        />

        <ul className="playlist-search-list">
          {this.state.playlists.map(function (playlist, i) {
            const creator = "Creator : " + playlist.owner;
            const songs = "Playlist Length : " + playlist.tracks.total;
            return (
            <button onClick ={this.addToPool(playlist)} className = "playlist-button">
              <li className="playlist-search">
                <Chip
                  label={playlist.name}
                  style={{ backgroundColor: "#1DB954" }}
                />
                <Chip label={creator} />
                <Chip label={songs} />
              </li>
              </button>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}

export default PlaylistSearchbar;
