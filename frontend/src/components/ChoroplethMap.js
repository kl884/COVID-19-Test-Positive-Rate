import React from 'react'
import Datamap from 'datamaps/dist/datamaps.usa.min.js'
import d3 from 'd3'
import USAJson from './usa.topo.json'
import { fetchDataChoro } from './HelperFunc.js'

class ChoroplethMap extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: []
    }
    this.createMap = this.createMap.bind(this)
  }

  createMap () {
    const dataset = {}

    // We need to colorize every country based on "numberOfWhatever"
    // colors should be uniq for every value.
    // For this purpose we create palette(using min/max this.props.data-value)
    const onlyValues = this.state.data.map((row) => row[1])
    const minValue = Math.min.apply(null, onlyValues)
    const maxValue = Math.max.apply(null, onlyValues)

    // create color palette function
    // color can be whatever you wish
    const paletteScale = d3.scale.linear()
      .domain([minValue, maxValue])
      .range(['#EFEFFF', '#02386F']) // blue color

    // fill dataset in appropriate format
    this.state.data.forEach(function (item) { //
      // item example value ["USA", 70]
      const iso = item[0]
      const avgPos = item[1] * 100
      const avg100k = item[2]
      const active = item[3]
      dataset[iso] = { avgPos: avgPos, avg100k: avg100k, fillColor: paletteScale(avgPos), active: active }
    })

    var map = new Datamap({
      element: document.getElementById('cloropleth_map'),
      scope: 'usa',
      responsive: true,
      geographyConfig: {
        popupOnHover: true,
        highlightOnHover: true,
        borderColor: '#444',
        highlightBorderWidth: 1,
        borderWidth: 0.5,
        dataJson: USAJson,
        popupTemplate: function (geo, data) {
          // don't show tooltip if country don't present in dataset
          if (!data) { return }
          // tooltip content
          return '<div class="hoverinfo">' +
            '<strong>' + geo.properties.name + '</strong>' +
            // '<br>active cases: <strong>' + data.active.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</strong>' +
            '<br>avg. new case per 100k for past 7 days: <strong>' + data.avg100k.toFixed(1) + '</strong>' +
            '<br>avg. test positive rate for past 7 days: <strong>' + data.avgPos.toFixed(1) + '%</strong>' +
            // '<br>test positive rate: <strong>' + data.numberOfThings.toFixed(1) + '%</strong>' +
            '</div>'
        }
      },
      fills: {
        HIGH: '#afafaf',
        LOW: '#123456',
        MEDIUM: 'blue',
        UNKNOWN: 'rgb(0,0,0)',
        defaultFill: '#eee'
      },
      data: dataset
      // setProjection: function (element) {
      //   var projection = d3.geo.mercator()
      //     .center([-106.3468, 68.1304]) // always in [East Latitude, North Longitude]
      //     .scale(200)
      //     .translate([element.offsetWidth / 2, element.offsetHeight / 2])

      //   var path = d3.geo.path().projection(projection)
      //   return { path: path, projection: projection }
      // }
    })
    window.addEventListener('resize', function () {
      map.resize()
    })
  }

  componentDidMount () {
    fetchDataChoro()
      .then((data) => {
        console.log(data)
        this.setState({
          data: data.data
        })
        this.createMap()
        this.props.onLoad(document.getElementById('cloropleth_map').offsetHeight)
      })
  }

  render () {
    return (
      <div
        id='cloropleth_map' style={{
          position: 'relative',
          margin: '0 auto'
        }}
      />)
  }
}

export default ChoroplethMap
