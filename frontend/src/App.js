import React from 'react'
import Chart from 'chart.js'
import { CumulChart, DailyChart, PredDailyChart, PredCumulChart } from './components/Graphs.js'
import { getData } from './components/HelperFunc.js'
import ComboBox from './components/AutoCompleteBar.js'
Chart.defaults.global.defaultFontFamily = 'Roboto, sans-serif'

// App
class App extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      data: getData('NY')
    }
  }

  handleChange (event, value, reason) {
    if (value === null) return
    this.setState({
      data: getData(value.input)
    })
  }

  componentDidMount () {
    console.log('compoenent did mount')
  }

  render () {
    return (
      <div className='App'>
        <div className='main chart-wrapper'>
          <ComboBox onHandleChange={this.handleChange} />
        </div>
        <div className='sub-double chart-wrapper'>
          <div style={{ height: 300 }}>
            <CumulChart
              data={this.state.data[0].data}
              title={this.state.data[0].title}
              yLabel='Cumulative Test Positive Rate (%)'
              color='#3E517A'
            />
          </div>
          <div style={{ height: 300 }}>
            <DailyChart
              dataRate={this.state.data[1].data}
              dataVol={this.state.data[2].data}
              color='#3E517A'
            />
          </div>
        </div>
        <div className='sub-double chart-wrapper'>
          <div style={{ height: 300 }}>
            <PredDailyChart
              dataModel={this.state.data[3].data}
              dataActual={this.state.data[4].data}
              title={this.state.data[3].title}
              yLabel='Positive Cases'
              color='#3E517A'
            />
          </div>
          <div style={{ height: 300 }}>
            <PredCumulChart
              dataModel={this.state.data[5].data}
              dataActual={this.state.data[6].data}
              color='#3E517A'
            />
          </div>
        </div>
      </div>
    )
  }
}

export default App
