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
import { useHistory } from "react-router-dom";
import "./App.css";

//much of this code is inspired by Joel Karlsson's "How to Build A Spotify Player with React in 15 Minutes"

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      uris: [],
      yourPlaylists: [],
      selectedPlaylists: [],
      previewedPlaylist: [],
      selectedPreviewedPlaylist: "",
      searchedPlaylists: [],
    };

    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.addSelectedPlaylist = this.addSelectedPlaylist.bind(this);
    this.removeSelectedPlaylist = this.removeSelectedPlaylist.bind(this);
    this.showPlaylist = this.showPlaylist.bind(this);
    this.getPlaylistTracks = this.getPlaylistTracks.bind(this);
    this.search = this.search.bind(this);
    this.addToPool = this.addToPool.bind(this);
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
        console.log(data);

        if (!data) {
          return;
        }
        var playlistNames = [];
        data.items.forEach((playlist) => {
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
          yourPlaylists: playlistNames,
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

        this.setState({
          uris: [
            data.context.uri,
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
    console.log(playlist);
    var url = "https://api.spotify.com/v1/playlists/" + playlist.id + "/tracks";
    $.ajax({
      url: url,
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      success: (data) => {
        console.log(data);

        if (!data) {
          return;
        }

        this.setState({
          previewedPlaylist: data.items,
        });
        this.forceUpdate();
      },
    });
    console.log(this.state);
  }

  showPlaylist(playlist) {
    this.setState({
      selectedPreviewedPlaylist: playlist.name,
    });
    this.getPlaylistTracks(playlist);
  }

  removeSelectedPlaylist(playlist, i) {
    this.setState((prevState, props) => {
      prevState.selectedPlaylists.splice(i, 1);
      prevState.yourPlaylists.push(playlist);
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
        console.log(selectedPlaylist);
        selectedPlaylist.trackList = data.items;
        this.setState((prevState, props) => {
          prevState.selectedPlaylists.push(selectedPlaylist);
          prevState.yourPlaylists.splice(i, 1);
        });
        this.forceUpdate();
      },
    });
  }

  search(value) {
    console.log("hi");
    var searchCleaned = value.replace(" ", "%20") + "&type=playlist";
    $.ajax({
      url: "https://api.spotify.com/v1/search?q=" + searchCleaned,
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + hash.access_token);
      },
      success: (data) => {
        console.log(data);
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
        console.log(this.state);
        this.forceUpdate();
      },
    });
  }

  addToPool(playlist) {
    this.setState((prevState, props) => {
      prevState.yourPlaylists.push(playlist);
      prevState.searchedPlaylists.splice(
        0,
        prevState.searchedPlaylists.length
      );
    });

    this.forceUpdate();
  }

  goEditing() {
    const history = useHistory();
    history.push("/editing", {selectedPlaylist: this.state.selectedPlaylists});
  }

  // inspired by the React Tutorial on facebook's website
  // this code *should* creat a venn.js object for each playlist
  // in the user's library
  /*	class Visualizer extends React.Component {
		// i'm way over my head

		render() {
			return(<div id="venn">
				</div>
			)
		}
	}    */

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="banner"> The Spotify Toolkit </h1>
        </header>
        <div className="login-button">
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
        </div>

        {this.state.token && (
          <div>
            <div className="grid-container">
              <div className="selectedPlaylists">
                <h3>Selected Playlists </h3>
                <ul className="playlist-selected-list">
                  {this.state.selectedPlaylists.map(function (playlist, i) {
                    const creator = "Creator : " + playlist.owner;
                    const songs = "Playlist Length : " + playlist.tracks.total;
                    return (
                      <li className="playlist">
                        <Chip
                          label={playlist.name}
                          style={{ backgroundColor: "#1DB954" }}
                        />
                        <Chip label={creator} />
                        <Chip label={songs} />

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
                            Remove Playlist
                          </Button>
                          <Button
                            style={{ backgroundColor: "#1DB954" }}
                            onClick={() => this.showPlaylist(playlist)}
                          >
                            Preview Playlist
                          </Button>
                        </ButtonGroup>
                      </li>
                    );
                  }, this)}
                </ul>
                <Button  onClick = {() => this.goEditing()} style={{ backgroundColor: "#1DB954" }}>
                  Go to Editing Area
                </Button>
              </div>

              <div className="venn" id="venn">
                <h3>Venn Diagram of Selected Playlists </h3>
                <Venn selectedPlaylists={this.state.selectedPlaylists} />
              </div>

              <div className="selectPlaylists">
                <h3> Select Playlists</h3>
                <ul class="playlist-select-list">
                  {this.state.yourPlaylists.map(function (playlist, i) {
                    const creator = "Creator : " + playlist.owner;
                    const songs = "Playlist Length " + playlist.tracks.total;
                    return (
                      <li className="playlist">
                        <Chip
                          label={playlist.name}
                          style={{ backgroundColor: "#1DB954" }}
                        />
                        <Chip label={creator} />
                        <Chip label={songs} />

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
                            Select Playlist
                          </Button>

                          <Button
                            style={{ backgroundColor: "#1DB954" }}
                            onClick={() => this.showPlaylist(playlist)}
                          >
                            Preview Playlist
                          </Button>
                        </ButtonGroup>
                      </li>
                    );
                  }, this)}
                </ul>
                <div>
                  <h3>Search Public Playlists</h3>
                  <SearchField
                    classNames="searchbar"
                    placeholder="Search for Playlist"
                    onEnter={(value) => this.search(value)}
                  />

                  <ul className="playlist-search-list">
                    {this.state.searchedPlaylists.map(function (playlist, i) {
                      const creator = "Creator : " + playlist.owner;
                      const songs =
                        "Playlist Length : " + playlist.tracks.total;
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
