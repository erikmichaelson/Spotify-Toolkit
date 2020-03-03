import React, { Component } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import "./App.css";
//much of this code is inspired by Joel Karlsson's "How to Build A Spotify Player with React in 15 Minutes"
class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      uris: [],
      playlists: []
    };
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      this.getCurrentlyPlaying(_token);
      this.getUserPlaylists(_token);
    }
  }

  getUserPlaylists(token) {
    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        console.log(data);

        if (!data) {
          return;
        }
        var playlistNames = [];
        data.items.forEach(playlist => {
          playlistNames.push(playlist.name);
        });
        this.setState({
          playlists: playlistNames
        });
      }
    });
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        console.log(data);

        if (!data) {
          return;
        }

        this.setState({
          uris: [
            data.context.uri,
            data.item.uri,
            data.item.artists[0].uri,
            data.item.album.uri
          ]
        });

        console.log(this.state.uris);
      }
    });
  }

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
            <div className="playlists">
              <h3 className="your-playlists"> Your Playlists</h3>
              <ul>
                {this.state.playlists.map(function(song, i) {
                  return <li className="playlist"> {song} </li>;
                })}
              </ul>
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
                trackNameColor: "#fff"
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default App;
