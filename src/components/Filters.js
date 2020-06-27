import React, { Component } from "react";
import ReactDOM from "react-dom";
import TextField from "@material-ui/core/TextField";

class FilterForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			  filteredArtist: "",
			  minDate: "",
        maxDate: "",
        minAdded: "",
        maxAdded: "",
    }
    
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleMinAddedChange = this.handleMinAddedChange.bind(this);
    this.handleMaxAddedChange = this.handleMaxAddedChange.bind(this);
    this.handleMinChange = this.handleMinChange.bind(this);
    this.handleMaxChange = this.handleMaxChange.bind(this);
  }

  notExplicit(song) {
    return !song.track.explicit;
  }

  removeArtist(song, artist) {
    return song.track.artists[0].name === artist;
  }

  betweenYears(song, start, end) {
    if(song.track.album.release_date != null){
      const relYear = song.track.album.release_date.substring(0, 4);
      console.log(start, end)
      console.log(relYear)
      console.log(start <= relYear)
      console.log(song.track.album.release_date.substring(0, 4) <= end)

      return (start <= relYear && relYear <= end);
    } else 
      return false;
  }

  removeArtist(song, artist) {
    return song.track.artists[0].name !== artist;
  }

  addedBetween(song, start, end) {
    console.log(start, end)
    if(song.track.album.release_date != null){
      const addYear = parseInt(song.added_at.substring(0, 4))
      console.log(addYear)
      console.log((addYear >= start && addYear <= end))

      return (addYear >= start && addYear <= end);
    } else 
      return false;
  }

  filterLength() {}

  handlePlaylistNameOnChange(event) {
    this.setState({
      playlistName: event.target.value,
    });
  }

  handleMinChange(event) {
    this.setState({
      minDate: event.target.value,
    });
  }

  handleMaxChange(event) {
    this.setState({
      maxDate: event.target.value,
    });
  }

  handleMinAddedChange(event) {
    this.setState({
      minAdded: event.target.value,
    });
  }

  handleMaxAddedChange(event) {
    this.setState({
      maxAdded: event.target.value,
    });
  }

  handleArtistChange(event) {
    this.setState({
      filteredArtist: event.target.value,
    });
  }
	
  render() { 
    return (<div className="filters">
              <h3>Edit Your Created Playlist </h3>

              <h3>Filters </h3>
              <ul className="playlist-preview-list">
                <li className="filter-object">
                  Remove Explicits
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => this.notExplicit(song))}
                    ></input>
                  </div>
                </li>
                <li className="filter-object">
                  Year Added<br></br>
                  <TextField
                    ref="yearAdded"
                    type="number"
                    placeholder="ex: 2016"
                    className="date"
                    value={this.state.textFieldValue}
                    onChange={this.handleMinAddedChange}
                  />
                  to
                  <TextField
                    ref="yearAdded"
                    type="number"
                    placeholder="ex: 2017"
                    className="date"
                    value={this.state.textFieldValue}
                    onChange={this.handleMaxAddedChange}
                  />
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => this.addedBetween(song, this.state.minAdded, this.state.maxAdded))}
                    ></input>
                  </div>
                </li>
                <li className="filter-object">
                  Year Released<br></br>
                  <TextField
                    ref="yearAdded"
                    type="number"
                    placeholder="ex: 2016"
                    className="date"
                    value={this.state.textFieldValue}
                    onChange={this.handleMinChange}
                  />
                  to
                  <TextField
                    ref="yearAdded"
                    type="number"
                    placeholder="ex: 2017"
                    className="date"
                    value={this.state.textFieldValue}
                    onChange={this.handleMaxChange}
                  />
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => this.betweenYears(song, this.state.minDate, this.state.maxDate))}
                    ></input>
                  </div>
                </li>
                <li className="filter-object">
                  Remove Artist
                  <TextField
                    className="date"
                    onChange={this.handleArtistChange}
                  />
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => this.removeArtist(song, this.state.filteredArtist))}
                      ></input>
                  </div>
                </li>
              </ul>
            </div>
    )}
}

export default FilterForm;
