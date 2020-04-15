import React from 'react'
import Chart from 'chart.js'
import { CumulChart, DailyChart, PredDailyChart, PredCumulChart, StackedChart } from './components/Graphs.js'
import { getData } from './components/HelperFunc.js'
import ComboBox from './components/AutoCompleteBar.js'
import ChoroplethMap from './components/ChoroplethMap.js'
import { Tabs, Tab } from './components/Tabs.js'
Chart.defaults.global.defaultFontFamily = 'Roboto, sans-serif'

// App
class App extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.changeTab = this.changeTab.bind(this)
    this.state = {
      data: null,
      charts: [],
      activeTab: 'Prediction'
    }
  }

  changeTab (tab) {
    console.log('changeTab called')

    this.setState({
      activeTab: tab
    })
  }

  handleChange (event, value, reason) {
    if (value === null) return
    getData(value.input)
      .then((data) => {
        this.setState({
          data: data
        })
      })
  }

  // componentWillMount () {
  //   getData('NY')
  //     .then((data) => {
  //       this.setState({
  //         data: data
  //       })
  //     })
  // }

  componentDidMount () {
    getData('NY')
      .then((data) => {
        this.setState({
          data: data
        })
      })
  }

  render () {
    return (
      <div>
        <div className='dialog-box'>
          <h2 className='dialog-box__name'>Tips</h2>
          <p>Click on the <b>legend items</b> to show or hide all points.</p>
          <p>Hover over the points to see tooltips, or if you are on mobile, touch the points
          </p>
        </div>

        <div className='nook-phone'>
          <h1 className='h1'>COVID-19 Trends</h1>
          <div>
            <svg
              className='waves' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'
              viewBox='0 24 150 28' preserveAspectRatio='none' shapeRendering='auto'
            >
              <defs>
                <path id='gentle-wave' d='M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z' />
              </defs>
              <g className='parallax'>
                <use xlinkHref='#gentle-wave' x='48' y='0' fill='rgba(255,255,255,0.6' />
                <use xlinkHref='#gentle-wave' x='48' y='3' fill='rgba(255,255,255,0.4)' />
                <use xlinkHref='#gentle-wave' x='48' y='5' fill='rgba(255,255,255,0.2)' />
                <use xlinkHref='#gentle-wave' x='48' y='7' fill='#fff' />
              </g>
            </svg>
          </div>
          <div className='nook-phone-center'>
            <div className='main chart-wrapper'>
              <ComboBox onHandleChange={this.handleChange} />
            </div>
            <Tabs>
              <Tab label='Data'>
                <div>

                  {this.state.data &&
                    <div className='sub chart-wrapper'>
                      <StackedChart
                        titleActive={this.state.data[9].title}
                        titleRecovered={this.state.data[7].title}
                        titleDeath={this.state.data[8].title}
                        dataActive={this.state.data[9].data}
                        dataRecovered={this.state.data[7].data}
                        dataDeath={this.state.data[8].data}
                      />
                    </div>}
                  {this.state.data &&

                    <div className='sub chart-wrapper'>
                      <CumulChart
                        data={this.state.data[0].data}
                        title={this.state.data[0].title}
                        yLabel='Cumulative Test Positive Rate (%)'
                        color='#3498DB'
                      />
                    </div>}
                  {this.state.data &&
                    <div className='sub chart-wrapper'>
                      <DailyChart
                        titleRate={this.state.data[1].title}
                        dataRate={this.state.data[1].data}
                        titleVol={this.state.data[2].title}
                        dataVol={this.state.data[2].data}
                        color='#3E517A'
                      />
                    </div>}
                </div>
              </Tab>
              <Tab label='Prediction'>
                {this.state.data &&
                  <div className='sub chart-wrapper'>
                    <PredDailyChart
                      dataModel={this.state.data[3].data}
                      dataActual={this.state.data[4].data}
                      title={this.state.data[3].title}
                      yLabel='Positive Cases'
                      color='#3E517A'
                    />
                  </div>}
                {this.state.data &&
                  <div className='sub chart-wrapper'>
                    <PredCumulChart
                      dataModel={this.state.data[5].data}
                      dataActual={this.state.data[6].data}
                      title={this.state.data[5].title}
                      color='#3E517A'
                    />
                  </div>}
              </Tab>
              <Tab label='Map'>
                <ChoroplethMap />
              </Tab>
            </Tabs>
          </div>
          <div style={{ transform: 'rotate(180deg)' }}>
            <svg
              className='waves' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'
              viewBox='0 24 150 28' preserveAspectRatio='none' shapeRendering='auto'
            >
              <defs>
                <path id='gentle-wave' d='M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z' />
              </defs>
              <g className='parallax'>
                <use xlinkHref='#gentle-wave' x='48' y='0' fill='rgba(255,255,255,0.6' />
                <use xlinkHref='#gentle-wave' x='48' y='3' fill='rgba(255,255,255,0.4)' />
                <use xlinkHref='#gentle-wave' x='48' y='5' fill='rgba(255,255,255,0.2)' />
                <use xlinkHref='#gentle-wave' x='48' y='7' fill='#fff' />
              </g>
            </svg>
          </div>
        </div>

        <div className='dialog-box'>
          <p>This app is in constant development. Suggestions, support, and contributions are available through <a
            href='https://github.com/eestanleyland/COVID-19-Test-Positive-Rate'
                                                                                                                >Github
          </a>
          </p>
          <p>
            Website by <a
              href='https://www.linkedin.com/in/ronnylin/'
            >Ronny Lin
            </a>
          </p>
          <p>
            Data analytics by <a
              href='https://www.linkedin.com/in/kystanleylin/'
            >Stanley Lin
            </a>
          </p>
        </div>
      </div>
    )
  }
}

export default App
