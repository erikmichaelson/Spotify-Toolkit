import React, { Component } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import hash from "./hash";
import Venn from "./Venn.js";
import SearchField from "react-search-field";
import ReactTooltip from "react-tooltip";
import "./App.css";
import { axisRight } from "d3";

//much of this code is inspired by Joel Karlsson's "How to Build A Spotify Player with React in 15 Minutes"

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      uris: [],
      unselectedPlaylists: [],
      selectedPlaylists: [],
      previewedPlaylist: [],

      selectedPreviewedPlaylist: "",
      searchedPlaylists: [],
      songSet: [],
    };

    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.addSelectedPlaylist = this.addSelectedPlaylist.bind(this);
    this.removeSelectedPlaylist = this.removeSelectedPlaylist.bind(this);
    this.showPlaylist = this.showPlaylist.bind(this);
    this.getPlaylistTracks = this.getPlaylistTracks.bind(this);
    this.search = this.search.bind(this);
    this.addToPool = this.addToPool.bind(this);
    //  this.removeSongs = this.removeSongs.bind(this);
    // this.replaceSongs = this.replaceSongs.bind(this);
    this.playSongs = this.playSongs.bind(this);

    this.savePlaylist = this.savePlaylist.bind(this);
    this.saveClick = this.saveClick.bind(this);
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token,
      });
      this.getCurrentlyPlaying(_token);
      this.getUserPlaylists(_token);
    }
  }

  // this method gets the current playlists and puts them in state's
  // playlist variable
  getUserPlaylists(token) {
    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: (data) => {
        //console.log(data);

        if (!data) {
          return;
        }
        var playlistNames = [];
        data.items.forEach((playlist) => {
          //console.log(playlist);
          playlistNames.push({
            name: playlist.name,
            owner: playlist.owner.id,
            tracks: playlist.tracks,
            id: playlist.id,
            uri: playlist.uri,
          });
        });
        this.setState({
          unselectedPlaylists: playlistNames,
        });
      },
    });
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: (data) => {
        console.log(data);

        if (!data) {
          return;
        }
        // handling a bug where only one song is being played and context = null
        const contextURI = data.context ? data.context.uri : data.item.uri;

        this.setState({
          uris: [
            contextURI,
            data.item.uri,
            data.item.artists[0].uri,
            data.item.album.uri,
          ],
        });

        console.log(this.state.uris);
      },
    });
  }

  getPlaylistTracks(playlist) {
    //console.log(playlist);
    var url = "https://api.spotify.com/v1/playlists/" + playlist.id + "/tracks";
    $.ajax({
      url: url,
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      success: (data) => {
        //console.log(data);

        if (!data) {
          return;
        }

        this.setState({
          previewedPlaylist: data.items,
        });
        this.forceUpdate();
      },
    });
  }

  showPlaylist(playlist) {
    this.setState({
      selectedPreviewedPlaylist: playlist.name,
    });
    this.getPlaylistTracks(playlist);
  }

  removeSelectedPlaylist(playlist, i) {
    //add to history and add snapshot of previous
    this.setState((prevState, props) => {
      //remove rfrom selected playlists
      var placeHolderSelected = prevState.selectedPlaylists;
      placeHolderSelected.splice(i, 1);

      //add to selected playlists
      var placeHolderUnselectedPlaylists = prevState.unselectedPlaylists;
      placeHolderUnselectedPlaylists.push(playlist);

      //remove songs
      var newSongSet = prevState.songSet.filter((song) => {
        return song.playListID != playlist.id;
      });

      return {
        selectedPlaylists: placeHolderSelected,
        unselectedPlaylists: placeHolderUnselectedPlaylists,
        songSet: newSongSet,
      };
    });

    this.forceUpdate();
  }

  addSelectedPlaylist(playlist, i) {
    var selectedPlaylist = playlist;

    var url = "https://api.spotify.com/v1/playlists/" + playlist.id + "/tracks";
    $.ajax({
      url: url,
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      success: (data) => {
        if (!data) {
          return;
        }


        selectedPlaylist.trackList = data.items;

        //add to  selected playlists
        var placeHolderSelected = this.state.selectedPlaylists;
        placeHolderSelected.push(selectedPlaylist);

        //take out from unselectd playlists playlists
        var placeHolderUnselectedPlaylists = this.state.unselectedPlaylists;
        placeHolderUnselectedPlaylists.splice(i, 1);

        //add new songs
        var newSongSet = this.state.songSet;

        data.items.forEach((song) => {
          song.playListID = playlist.id;
          newSongSet.push(song);
        });

        this.setState((prevState, props) => {
          // selectedPlaylist.trackList = data.items;

          return {
            selectedPlaylists: placeHolderSelected,
            unselectedPlaylists: placeHolderUnselectedPlaylists,
            songSet: newSongSet,
          };
        });

        this.forceUpdate();
      },
    });
  }

  search(value) {
    //console.log("hi");
    var searchCleaned = value.replace(" ", "%20") + "&type=playlist";
    $.ajax({
      url: "https://api.spotify.com/v1/search?q=" + searchCleaned,
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      success: (data) => {
        //console.log(data);
        if (!data) {
          return;
        }
        var playlistNames = [];
        data.playlists.items.forEach((playlist) => {
          playlistNames.push({
            name: playlist.name,
            owner: playlist.owner.id,
            tracks: playlist.tracks,
            id: playlist.id,
            uri: playlist.uri,
          });
        });
        this.setState({
          searchedPlaylists: playlistNames,
        });
        //console.log(this.state);
        this.forceUpdate();
      },
    });
  }

  addToPool(playlist) {
    this.setState((prevState, props) => {
      prevState.unselectedPLaylists.push(playlist);
      prevState.searchedPlaylists.splice(0, prevState.searchedPlaylists.length);
    });

    this.forceUpdate();
  }

  /*
  removeSongs(songs) {
    console.log(songs);
    this.removeSongs.bind(this);
    this.setState((prevState, props) => {
        this.state.songSet = prevState.songSet.filter(x => !second.includes(x));
      }
    );

    this.forceUpdate();
  }

  replaceSongs(songs) {
    this.replaceSongs.bind(this);
    this.setState((prevState, props) => {
      prevState.songSet = songs;
    });

    this.forceUpdate();
  }
  
  */

  playSongs(song) {
    this.setState({
      uris: [song.track.uri, song.track.artists[0].uri, song.track.album.uri],
    });
  }

  savePlaylist(name) {
    var sharing = true;
    var collab = false;

    // I need to update permissions for the website
    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      type: "POST",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      data: name + sharing + collab,
      success: () => {
        this.forceUpdate();
      },
    });
  }

  saveClick() {
    var name = prompt("Name your new playlist");
    this.savePlaylist(name);
  }

  // inspired by the React Tutorial on facebook's website
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="banner"> The Spotify Toolkit </h1>
        </header>
        {!this.state.token && (
          <div className="login-button">
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          </div>
        )}

        {this.state.token && (
          <div>
            <div className="grid-container">
              <div className="selectedPlaylists">
                <h3>Playlists </h3>
                <div>
                  <SearchField
                    classNames="searchbar"
                    placeholder="Search for Playlist"
                    onEnter={(value) => this.search(value)}
                  />

                  <ul className="playlist-search-list">
                    {this.state.searchedPlaylists.map(function (playlist, i) {
                      const creator = playlist.owner;
                      const songs = playlist.tracks.total;
                      return (
                        <button
                          onClick={() => this.addToPool(playlist)}
                          className="playlist-button"
                        >
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
                <ul className="playlist-select-list playlist-selected-list">
                  {this.state.selectedPlaylists.map(function (playlist, i) {
                    const creator = playlist.owner;
                    const songs = playlist.tracks.total;
                    const test = creator + "\n" + songs + " songs";
                    return (
                      <li className="playlist">
                        {/*
                        <Chip
                          label={playlist.name}
                          style={{ backgroundColor: "#1DB954" }}
                        />
                        <Chip label={creator} />
                        <Chip label={songs} />
                        */}
                        <a
                          data-for={playlist.name}
                          data-tip={test}
                          data-iscapture="true"
                        >
                          {playlist.name}
                        </a>

                        <ButtonGroup
                          variant="contained"
                          color="primary"
                          aria-label="contained primary button group"
                          className="playlist-button-group"
                        >
                          <Button
                            style={{ backgroundColor: "red" }}
                            onClick={() =>
                              this.removeSelectedPlaylist(playlist, i)
                            }
                          >
                            -
                          </Button>
                          <Button
                            style={{ backgroundColor: "#1DB954" }}
                            onClick={() => this.showPlaylist(playlist)}
                          >
                            ≡
                          </Button>
                        </ButtonGroup>
                        <ReactTooltip
                          id={playlist.name}
                          place="right"
                          type="light"
                          effect="solid"
                          multiline={true}
                        />
                      </li>
                    );
                  }, this)}
                </ul>
                <ul class="playlist-select-list">
                  {this.state.unselectedPlaylists.map(function (playlist, i) {
                    const creator = "Creator : " + playlist.owner;
                    const songs = "Playlist Length " + playlist.tracks.total;
                    const test = creator + "\n" + songs + " songs";
                    return (
                      <li className="playlist">
                        <a
                          data-for={playlist.name}
                          data-tip={test}
                          data-iscapture="true"
                        >
                          {playlist.name}
                        </a>

                        <ButtonGroup
                          variant="contained"
                          color="primary"
                          aria-label="contained primary button group"
                          className="playlist-button-group"
                        >
                          <Button
                            style={{ backgroundColor: "#1DB954" }}
                            onClick={() =>
                              this.addSelectedPlaylist(playlist, i)
                            }
                          >
                            +
                          </Button>

                          <Button
                            style={{ backgroundColor: "#1DB954" }}
                            onClick={() => this.showPlaylist(playlist)}
                          >
                            ≡
                          </Button>
                        </ButtonGroup>
                        <ReactTooltip
                          id={playlist.name}
                          place="right"
                          type="light"
                          effect="solid"
                          multiline={true}
                        />
                      </li>
                    );
                  }, this)}
                </ul>
              </div>

              <div className="venn" id="venn">
                <h3>Venn Diagram of Selected Playlists </h3>
                <Venn selectedPlaylists={this.state.selectedPlaylists} />
              </div>

              <div className="songSet">
                <h3>
                  Current Created Playlist : {this.state.songSet.length} Songs
                </h3>

                <div>
                  <ul className="song-set-list">
                    {this.state.songSet.map(function (song, i) {
                      const Artist = song.track.artists[0].name;
                      const Title = song.track.name;
                      return (
                        <li className="song">
                          <Button
                            className="song-chip"
                            onClick={() => this.playSongs(song)}
                            style={{ backgroundColor: "#1DB954" }}
                          >
                            ►
                          </Button>
                          <Chip
                            className="song-chip"
                            label={Title}
                            style={{ backgroundColor: "#1DB954" }}
                          />
                          <Chip className="song-chip" label={Artist} />
                        </li>
                      );
                    }, this)}
                  </ul>
                </div>
              </div>

              <div className="playlistPreview">
                <h3>Playlist Preview </h3>
                <h4> {this.state.selectedPreviewedPlaylist} </h4>
                <ul className="playlist-preview-list">
                  {this.state.previewedPlaylist.map(function (song, i) {
                    const Artist = "Artist : " + song.track.artists[0].name;
                    const Album = "Album : " + song.track.album.name;
                    const Title = "Track : " + song.track.name;

                    return (
                      <li className="song">
                        <Chip
                          label={Title}
                          style={{ backgroundColor: "#1DB954" }}
                        />
                        <Chip label={Artist} />
                        <Chip label={Album} />
                      </li>
                    );
                  }, this)}
                </ul>
              </div>

              <div className="filters">
                <h3>Edit Your Created Playlist </h3>

                <h3>Filters </h3>
                <ol className="playlist-preview-list">
                  <li>
                    Remove Explicits
                    <input type="checkbox"></input>
                  </li>
                  <li>
                    Year Released<br></br>
                    <input type="date" id="min"></input>
                    to
                    <input type="date" id="max"></input>
                  </li>
                  <li>
                    Year Released<br></br>
                    <input id="min"></input>
                    to
                    <input id="max"></input>
                  </li>
                </ol>
              </div>

              <div className="savePlaylist">
                <h3>Playlist Options </h3>
                <Button
                  style={{ backgroundColor: "#1DB954" }}
                  onClick={() => this.savePlaylist("hello")}
                >
                  Save Song Set as Playlist
                </Button>
                <h4>Playlist Name</h4>
                <input id="name"></input>
                <ul className="playlist-preview-list"></ul>
              </div>
            </div>

            <SpotifyPlayer
              token={this.state.token}
              uris={this.state.uris}
              className="webPlayer"
              styles={{
                bgColor: "#333",
                color: "#fff",
                loaderColor: "#fff",
                sliderColor: "#1cb954",
                savedColor: "#fff",
                trackArtistColor: "#ccc",
                trackNameColor: "#fff",
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default App;
