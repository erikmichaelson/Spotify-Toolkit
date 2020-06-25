import React, { Component } from "react";
import ReactDOM from "react-dom";
import TextField from "@material-ui/core/TextField";

class FilterForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			  filteredArtist: "",
			  filteredDate: "",
			  minDate: "",
			  maxDate: "",
    }
    
    this.setSuperState = this.props.setSuperState.bind(props.this);

    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleMinChange = this.handleMinChange.bind(this);
    this.handleMaxChange = this.handleMaxChange.bind(this);
  }

  testBoolean(song) {
    console.log("Test Boolean called")
    return true;
  }

  filterExplicit() {
    const props = this.props;
    console.log(props);
    this.props.setSuperState((prevState, props) => {
      var newSongSet = this.props.songSet.filter((s) => !s.track.explicit);
      return { songSet: newSongSet };
    });

    super.forceUpdate();
  }

  filterArtist() {
    var filteredName = this.state.filteredArtist;
    this.setState((prevState, props) => {
      console.log(prevState.songSet[0].track.artists[0]);
      var newSongSet = prevState.songSet.filter(
        (s) =>
          s.track.artists[0].name.toLowerCase() != filteredName.toLowerCase()
      );
      return { songSet: newSongSet };
    });

    this.forceUpdate();
  }

  filterAge(min, max) {
    var min = this.state.minDate;
    var max = this.state.maxDate;

    this.setState((prevState, props) => {
      var newSongSet = prevState.songSet.filter(
        (s) =>
          s.track.album.release_date.substring(0, 4) < min ||
          s.track.album.release_date.substring(0, 4) > max
      );
      return { songSet: newSongSet };
    });
    this.forceUpdate();
  }

  filterAdded() {
    var year = this.state.filteredDate;
    /*  this.state.songSet.forEach(s => {
      var rYear = s.track.album.release_date.substring(0,4);
          if(rYear < min || rYear > max){
              songs.remove(s);
          }
      });   */
    this.setState((prevState, props) => {
      console.log(year); //[0].track.album.release_date.substring(0,4));
      var newSongSet = prevState.songSet.filter((s) => {
        return parseInt(s.added_at.substring(0, 4)) >= parseInt(year);
      });

      return { songSet: newSongSet };
    });

    this.forceUpdate();
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

  handleArtistChange(event) {
    this.setState({
      filteredArtist: event.target.value,
    });
  }

  handleDateChange(event) {
    this.setState({
      filteredDate: event.target.value,
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
                        onClick={() => this.props.filter(this.testBoolean)}
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
                      onChange={this.handleDateChange}
                    />
                    <div className="apply-button">
                      <input
                        type="submit"
                        value="Apply"
                        onClick={() => this.filterAdded()}
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
                        onClick={() => this.filterAge()}
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
                        onClick={() => this.filterArtist()}
                      ></input>
                    </div>
                  </li>
                </ul>
              </div>
      )}
}

export default FilterForm;
