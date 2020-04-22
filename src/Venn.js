import React from "react";
import ReactDOM from "react-dom";
import * as venn from "venn.js";
import * as d3 from "d3";
import "./Venn.css";

class Venn extends React.Component {
  constructor(props) {
    super(props);

    this.addSongs = this.props.addSongs.bind(props.this);
  }

  componentDidUpdate() {
    var chart = venn.VennDiagram();
    var div = d3.select("#venn");
    d3.select("#venn")
      .datum(this.getSets(this.props.selectedPlaylists))
      .call(chart);

    // add a tooltip
    var tooltip = d3.select("#venn").append("div").attr("class", "venntooltip");

    d3.selectAll("#rings .venn-circle")
      .on("mouseover", function (d, i) {
        var node = d3.select(this).transition();
        node.select("path").style("fill-opacity", 0.2);
        node
          .select("text")
          .style("font-weight", "100")
          .style("font-size", "36px");
      })
      .on("mouseout", function (d, i) {
        var node = d3.select(this).transition();
        node.select("path").style("fill-opacity", 0);
        node
          .select("text")
          .style("font-weight", "100")
          .style("font-size", "24px");
      });

    // add listeners to all the groups to display tooltip on mouseover
    div
      .selectAll("g")
      .on("mouseover", function (d, i) {

        // sort all the areas relative to the current item
        venn.sortAreas(div, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", 0.9);
        tooltip.text(d.size + " songs");
        console.log("inside addSongs: " + this);

        // highlight the current path
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .style("stroke-width", 3)
          .style("fill-opacity", d.sets.length == 1 ? 0.4 : 0.1)
          .style("stroke-opacity", 1);
      })

      .on("mousemove", function () {
        tooltip
          .style("z-index", "10000")
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })

      .on("mouseout", function (d, i) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .style("stroke-width", 0)
          .style("fill-opacity", d.sets.length == 1 ? 0.25 : 0.0)
          .style("stroke-opacity", 0);
      })
      
      .on("click", (d, i) => this.addSongs(d.songs));
  }


  // this is the meat of the renderer that makes it show intersections
  getSets(playlists) {
    var sets = [];
    // this loop goes through the each playlist in the set SelectedPlaylists
    for (var i = 0; i < playlists.length; i++) {
      sets.push({ sets: [playlists[i].name], 
        size: playlists[i].tracks.total, 
        songs: playlists[i].trackList });
      // if there's only one playlist, end here
      if (i == playlists.length - 1) {
        break;
      }

      for (var j = i + 1; j < playlists.length; j++) {
        // added var = sharedSongs
        var sharedSongs = playlists[i].trackList.filter((songI) =>
          // if any song in playlist J is strictly equal to one in I, add it to the list
          playlists[j].trackList.some(
            (songJ) => songI.track.id === songJ.track.id
          )
        );
        // numIntersections is the size of sharedSongs
        var numIntersection = sharedSongs.length;

        sets.push({
          sets: [playlists[i].name, playlists[j].name],
          size: numIntersection,
          songs: sharedSongs
        });
      }
    }
    // so instead of just recording the NUMBER of songs that overlap, I want this to store
    // the intersection as a new "playlist"
    for(var i = 0; i < sets.length; i++)
      console.log(sets[i]);

    return sets;
  }

  render() {
    return <div className="Venn"></div>;
  }
}

export default Venn;
