import React from "react";
import ReactDOM from "react-dom";
import * as venn from "venn.js";
import * as d3 from "d3";
import "./Venn.css";

class Venn extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    var chart = venn.VennDiagram();
    var div = d3.select("#venn");
    d3.select("#venn")
      .datum(this.getSets(this.props.selectedPlaylists))
      .call(chart);

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

    // add a tooltip
    var tooltip = d3.select("body").append("div").attr("class", "venntooltip");

    // add listeners to all the groups to display tooltip on mouseover
    div
      .selectAll("g")
      .on("mouseover", function (d, i) {
        // sort all the areas relative to the current item
        venn.sortAreas(div, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", 0.9);
        tooltip.text(d.size + " users");

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
      });
  }

  getSets(playlists) {
    var sets = [];
    for (var i = 0; i < playlists.length; i++) {
      sets.push({ sets: [playlists[i].name], size: playlists[i].tracks.total });
      if (i == playlists.length - 1) {
        break;
      }
      for (var j = i + 1; j < playlists.length; j++) {
        var numIntersection = playlists[i].trackList.filter((songI) =>
          playlists[j].trackList.some(
            (songJ) => songI.track.id === songJ.track.id
          )
        ).length;
        sets.push({
          sets: [playlists[i].name, playlists[j].name],
          size: numIntersection,
        });
      }
    }

    return sets;
  }

  render() {
    return <div className="Venn"></div>;
  }
}

export default Venn;
