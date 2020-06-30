import React, { Component } from "react";
import ReactDOM from "react-dom";
import TextField from "@material-ui/core/TextField";
import Slider from "@material-ui/core/Slider";


class FilterForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			  filteredArtist: "",
        relDates: [1950, 2020],
        addDates: [2006, 2020],
        lengths: [0, 64],
    }
    
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleRelChange = this.handleRelChange.bind(this);
    this.handleAddChange = this.handleAddChange.bind(this);
    this.handleLenChange = this.handleLenChange.bind(this);
  }

  notExplicit(song) {
    return !song.track.explicit;
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

  addedBetween(song, start, end) {
    console.log(start, end)
    if(song.track.album.release_date != null){
      const addYear = parseInt(song.added_at.substring(0, 4))
      console.log(addYear)
      console.log((addYear >= start && addYear <= end))

      return (start <= addYear && addYear <= end);
    } else 
      return false;
  }

  removeArtist(song, artist) {
    return song.track.artists[0].name !== artist;
  }

  filterLength(song, shortest, longest) {
    // convert to minutes for human intuition
    let length = (song.track.duration_ms * 0.00001666667);
    return (shortest <= length && length <= longest);
  }

  handleLenChange(event, newValues) {
    this.setState({
      lengths: newValues,
    });
  }

  handleRelChange(event, newValues) {
    console.log(newValues);
    this.setState({
      relDates: newValues,
    });
  }

  handleAddChange(event, newValues) {
    console.log(newValues);
    this.setState({
      addDates: newValues,
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
                  <Slider
                    ref="yearAdded"
                    min={2006}
                    max={2020}
                    value={this.state.addDates}
                    onChange={this.handleAddChange}
                    valueLabelDisplay="auto"
                  />
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => 
                        this.addedBetween(song, this.state.minAdded, this.state.maxAdded))}
                    ></input>
                  </div>
                </li>
                <li className="filter-object">
                  Year Released<br></br>
                  <Slider
                    ref="yearReleased"
                    min={1950}
                    max={2020}
                    value={this.state.relDates}
                    onChange={this.handleRelChange}
                    valueLabelDisplay="auto"
                  />
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => 
                        this.betweenYears(song, this.state.relDates[0], this.state.relDates[1]))}
                    ></input>
                  </div>
                </li>
                <li className="filter-object">
                  Song Length<br></br>
                  <Slider
                    ref="length_minutes"
                    min={0}
                    max={6}
                    step={.3}
                    scale={(x) => Math.round((2 ** x) * 10)/10}
                    marks={[1, 2, 3, 4, 10, 20]}
                    value={this.state.lengths}
                    onChange={this.handleLenChange}
                    valueLabelDisplay="auto"
                  />
                  <div className="apply-button">
                    <input
                      type="submit"
                      value="Apply"
                      onClick={() => this.props.filterSongSet((song) => 
                        this.filterLength(song, this.state.lengths[0], this.state.lengths[1]))}
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
