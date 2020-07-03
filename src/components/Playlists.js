import React, { Component } from "react";
import ReactDOM from "react-dom";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Chip from "@material-ui/core/Chip";
import SearchField from "react-search-field";
import ReactTooltip from "react-tooltip";


import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "../config";
import hash from "../hash";
import { data } from "jquery";


class PlaylistViewer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPlaylists: [],
			searchedPlaylists: [],
			unselectedPlaylists: [],
			previewedPlaylist: [],
			token: "",

		}

		this.search = this.search.bind(this);
		this.addToPool = this.addToPool.bind(this);
		this.addSelectedPlaylist = this.addSelectedPlaylist.bind(this);
		this.removeSelectedPlaylist = this.removeSelectedPlaylist.bind(this);
		this.playSongs = this.playSongs.bind(this);
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

	addSelectedPlaylist(playlist, i) {
		var selectedPlaylist = playlist;
	
		const url = "https://api.spotify.com/v1/playlists/" + playlist.id + "/tracks";
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
			let placeHolderSelected = this.state.selectedPlaylists;
			placeHolderSelected.push(selectedPlaylist);
	
			//take out from unselectd playlists playlists
			let placeHolderUnselectedPlaylists = this.state.unselectedPlaylists;
			placeHolderUnselectedPlaylists.splice(i, 1);
	
			this.props.addSongs(selectedPlaylist.trackList);
			
			this.setState((prevState, props) => {
	
			  return {
				selectedPlaylists: placeHolderSelected,
				unselectedPlaylists: placeHolderUnselectedPlaylists,
			  };
			});
	
			this.forceUpdate();
		  },
		});
	}

	removeSelectedPlaylist(playlist, i) {
		// full trash manuvure
		// REDO this immediately
		this.getPlaylistTracks(playlist)

		//add to history and add snapshot of previous
		this.setState((prevState, props) => {
		  //remove from selected playlists
		  var placeHolderSelected = prevState.selectedPlaylists;
		  placeHolderSelected.splice(i, 1);
	
		  //add to unselected playlists
		  var placeHolderUnselectedPlaylists = prevState.unselectedPlaylists;
		  placeHolderUnselectedPlaylists.push(playlist);
	
		  //remove songs
			this.props.removeSongs(this.state.previewedPlaylist);
	
		  return {
			selectedPlaylists: placeHolderSelected,
			unselectedPlaylists: placeHolderUnselectedPlaylists,
		  };
		});
	
		this.forceUpdate();
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
			if (!data) {
			  return;
			}
			console.log(data.items);
	
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

	search(value) {
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

	playSongs(song) {
		this.setState({
		  uris: [song.track.uri, song.track.artists[0].uri, song.track.album.uri],
		});
	}

	addToPool(playlist) {
		this.setState((prevState, props) => {
		  prevState.unselectedPlaylists.push(playlist);
		  prevState.searchedPlaylists.splice(0, prevState.searchedPlaylists.length);
		});
	
		this.forceUpdate();
	}

	componentDidMount() {
		// Set token
		let _token = hash.access_token;
	
		if (_token) {
		  // Set token
		  this.setState({
			token: _token,
		  });
		  this.getUserPlaylists(_token);
		}
	}

	render() {
		return (
			<div className="allPlaylists">
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

						<span className="playlist-button-group">
							<a className="removeButton playlistButton"
							onClick={() => this.removeSelectedPlaylist(playlist, i)}
							>-</a>
							<a className="previewButton playlistButton"
							onClick={() => this.showPlaylist(playlist)}
							>≡</a>
						</span>
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
						<span className="playlist-button-group">
							<a className="addButton playlistButton"
							onClick={() => this.addSelectedPlaylist(playlist, i)}
							>+</a>
							<a className="previewButton playlistButton"
							onClick={() => this.showPlaylist(playlist)}
							>≡</a>
						</span>
						{/*
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
						*/}
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
		  </div>
		)	
	}
}

export default PlaylistViewer;