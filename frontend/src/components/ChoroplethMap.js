import React from 'react'
import Datamap from 'datamaps/dist/datamaps.world.min.js'
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
    const onlyValues = this.props.data.map((row) => row[1])
    const minValue = Math.min.apply(null, onlyValues)
    const maxValue = Math.max.apply(null, onlyValues)

    // create color palette function
    // color can be whatever you wish
    const paletteScale = d3.scale.linear()
      .domain([minValue, maxValue])
      .range(['#EFEFFF', '#02386F']) // blue color

    // fill dataset in appropriate format
    this.props.data.forEach(function (item) { //
      // item example value ["USA", 70]
      const iso = item[0]
      const value = item[1]
      dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value) }
    })

    const map = new Datamap({
      element: document.getElementById('cloropleth_map'),
      scope: 'usa',
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
          return ['<div class="hoverinfo">',
            '<strong>', geo.properties.name, '</strong>',
            '<br>Count: <strong>', data.numberOfThings, '</strong>',
            '</div>'].join('')
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
      //   setProjection: function (element) {
      //     var projection = d3.geo.mercator()
      //       .center([-106.3468, 68.1304]) // always in [East Latitude, North Longitude]
      //       .scale(200)
      //       .translate([element.offsetWidth / 2, element.offsetHeight / 2])

    //     var path = d3.geo.path().projection(projection)
    //     return { path: path, projection: projection }
    //   }
    })
  }

  componentDidMount () {
    fetchDataChoro()
      .then((data) => {
        this.setState({
          data: data
        })
        this.createMap()
      })
  }

  render () {
    return (
      <div
        id='cloropleth_map' style={{
          height: '100%',
          width: '100%'
        }}
      />)
  }
}

export default ChoroplethMap
