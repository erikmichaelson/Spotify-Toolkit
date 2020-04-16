import React from "react";
import ReactDOM from "react-dom";
import "./Editing.css";
import SearchField from "react-search-field";
import Chip from "@material-ui/core/Chip";
import * as $ from "jquery";
import hash from "./hash";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';


//import Button from "@material-ui/core/Button";

class Editing extends React.Component {
  constructor() {
    super();

    this.state = {
      playlists: [],
    };
  }

  render() {
    return (
      <div className="editing">
        <div className="date">
        <h3> Filter Playlist By Date </h3>
          <TextField className="dateItem" id="standard-basic" label="Start Date"  color="white" />
          <TextField  className="dateItem"id="standard-basic" label="End Date" color="white"  />
          <Button
            style={{ backgroundColor: "#1DB954" }}
            className="dateItem"
          >Filter</Button>
        </div>



        <div className = "genre"> 
        <h3> Filter By Genre </h3>
        <SearchField
                    classNames="searchbar"
                    placeholder="Search Genre"
                   
                  />

        <Chip className = "chip" label= "rap"/>
        
        
        
        </div>



<div className = "explicit"> 
<h3> Filter By Explicit </h3>
<FormControlLabel
        control={
          <Switch
            name="checkedB"
            color="primary"
          />
        }
        label="Explicit"
        className = "switch"
      />

</div>

      </div>
    );
  }
}

export default Editing;
