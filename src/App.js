import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import "./App.css";

//taken from https://github.com/JoeKarlsson/react-spotify-player

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null
  }
}
  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
    }
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className = "App-name"> The Spotify Toolkit </h1>
          <Button variant="contained"  href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`} 
              className="App-button">
  Log In
</Button>
        </header>
      </div>
    );
  }
}

export default App;