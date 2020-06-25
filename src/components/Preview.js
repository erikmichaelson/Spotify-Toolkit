import React, { Component } from "react";
import ReactDOM from "react-dom";
import Chip from "@material-ui/core/Chip";


class PlaylistPreview extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="preview">
				<h3>Playlist Preview </h3>
				<h4> {this.props.toPreviewName} </h4>
				<ul className="playlist-preview-list">
					{this.props.toPreview.map(function (song, i) {
					const Artist = song.track.artists[0].name;
					const Title = song.track.name;

					return (
						<li className="song">
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
		)}
}

export default PlaylistPreview;