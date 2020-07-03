import React, { Component } from "react";
import ReactDOM from "react-dom";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "../config";
import hash from "../hash";


class PlaylistSaver extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playlistName: "",
		}

    this.handlePlaylistNameOnChange = this.handlePlaylistNameOnChange.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
  }
  
  handlePlaylistNameOnChange(event) {
    this.setState({
      playlistName: event.target.value,
    });
  }

  savePlaylist() {
    if (this.state.playlistName == "" || this.props.songSet.length == 0) {
      alert(
        "Please Enter A Name for Your Playlist Or Add Songs To Your Playlist"
      );
      return;
    } else {
      var sharing = true;
      var collab = false;

      if (
        window.confirm(
          "Are you sure you want to create " +
            this.state.playlistName +
            " playlist"
        )
      ) {
        // I need to update permissions for the website
        $.ajax({
          url: "https://api.spotify.com/v1/me/playlists",
          type: "POST",
          beforeSend: (xhr) => {
            xhr.setRequestHeader(
              "Authorization",
              "Bearer " + hash.access_token
            );
          },
          data: JSON.stringify({
            name: this.state.playlistName,
            public: "true",
          }),
          dataType: "json",
          success: (data) => {
//            console.log(this.state.playlistNames)
            var uris = [];
            this.props.songSet.forEach((song) => {
              uris.push(song.track.uri);
            });

            var url = data.href + "/tracks?uris=";

            for (var i = 0; i < uris.length; i++) {
              url = url + uris[i] + ",";
            }

            //add songs to the playlist
            $.ajax({
              url: url,
              type: "POST",
              beforeSend: (xhr) => {
                xhr.setRequestHeader(
                  "Authorization",
                  "Bearer " + hash.access_token
                );
              },
              data: JSON.stringify({
                uris: uris,
              }),
              dataType: "json",
              success: (data) => {
                alert(this.state.playlistName + " was created successfully");
                this.props.reset();
              },
            });
          },
        });

        this.forceUpdate();
      }
    }
  }

	render(){
		return (
			<div className="savePlaylist">
        <div id="playlist-name">
          <TextField
            size="small"
            borderColor="green"
            value={this.state.playlistName}
            // style={{ backgroundColor: "white" }}
            variant="outlined"
            label="Required"
            onChange={this.handlePlaylistNameOnChange}
          ></TextField>
        </div>
        <Button
          style={{ backgroundColor: "#1DB954" }}
          onClick={() => this.savePlaylist()}
        >
          Save
        </Button>
        <ul className="playlist-preview-list"></ul>
      </div>
    )}
}

export default PlaylistSaver;