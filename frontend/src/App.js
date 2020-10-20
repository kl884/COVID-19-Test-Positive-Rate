import React from 'react'
import Chart from 'chart.js'
import { CumulChart, DailyChart, PredDailyChart, PredCumulChart, StackedChart } from './components/Graphs.js'
import { getData } from './components/HelperFunc.js'
import ComboBox from './components/AutoCompleteBar.js'
import ChoroplethMap from './components/ChoroplethMap.js'
import { Tabs } from './components/Tabs.js'
import { CSSTransition } from 'react-transition-group'
import { withCookies } from 'react-cookie'
Chart.defaults.global.defaultFontFamily = 'Roboto, sans-serif'

// App
class App extends React.Component {
  constructor (props) {
    super(props)
    const { cookies } = props
    this.handleChange = this.handleChange.bind(this)
    this.changeTab = this.changeTab.bind(this)
    this.handleOnEnter = this.handleOnEnter.bind(this)
    this.handleOnLoad = this.handleOnLoad.bind(this)
    this.state = {
      data: null,
      charts: [],
      activeTab: cookies.get('lastTab') || 'Prediction',
      tabs: ['Data', 'Prediction', 'Map'],
      height: null,
      lastStateInput: cookies.get('stateInput', { doNotParse: false }) || { index: 0, input: 'NY' }
    }
  }

  changeTab (tab) {
    const { cookies } = this.props
    cookies.set('lastTab', tab, { path: '/', maxAge: 3600 * 24 * 5 })
    this.setState({
      activeTab: tab
    })
  }

  handleChange (event, value, reason) {
    if (value === null) return
    const { cookies } = this.props
    cookies.set('stateInput', { index: value.index, input: value.input }, { path: '/', maxAge: 3600 * 24 * 5 })
    getData(value.input)
      .then((data) => {
        this.setState({
          data: data
        })
      })
  }

  handleOnEnter (el) {
    const height = el.offsetHeight
    this.setState({
      height: height
    })
  }

  handleOnLoad (choroplethHeight) {
    this.setState({
      height: choroplethHeight + 100
    })
  }

  componentDidMount () {
    getData(this.state.lastStateInput.input)
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
          <h2 className='dialog-box__name'>Hello</h2>
          <p>Stay informed with <a href='https://www.ft.com/coronavirusfree' target='_blank'>COVID-19 reports</a> made free by the <a href='https://www.ft.com/' target='_blank'>Financial Times</a>.
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
              <ComboBox onHandleChange={this.handleChange} defaultInput={this.state.lastStateInput} />
            </div>
            <Tabs handleTabClick={this.changeTab} activeTab={this.state.activeTab} tabs={this.state.tabs} />
            <div
              className='overflow-hidden'
              style={{
                height: this.state.height !== null ? this.state.height
                  : window.innerWidth > 800 && this.state.activeTab === 'Data' ? '720px'
                    : window.innerWidth <= 800 && this.state.activeTab === 'Data' ? '950px'
                      : window.innerWidth > 800 ? '360px' : '650px'
              }} // Facebook in-app browser issue
            >
              <CSSTransition
                in={this.state.activeTab === 'Data'}
                timeout={500}
                classNames='data-tab'
                unmountOnExit
                label='Data'
                onEnter={this.handleOnEnter}
              >
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
                        dataNewCase={this.state.data[10].data}
                        title={this.state.data[0].title}
                        titleNewCase={this.state.data[10].title}
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
              </CSSTransition>
              <CSSTransition
                in={this.state.activeTab === 'Prediction'}
                timeout={500}
                classNames='prediction-tab'
                unmountOnExit
                label='Prediction'
                onEnter={this.handleOnEnter}
              >
                <div id='PredictionTab' style={{ width: '100%' }}>
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
                </div>
              </CSSTransition>
              <CSSTransition
                in={this.state.activeTab === 'Map'}
                timeout={500}
                classNames='map-tab'
                unmountOnExit
                label='Map'
              >
                <ChoroplethMap onLoad={this.handleOnLoad} />

              </CSSTransition>
            </div>
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
          <p>Data is pulled from  <a href='https://covidtracking.com/'>The COVID Tracking Project</a> and updated daily at 5:30PM PST
          </p>
          <p>This app is in constant development. Suggestions, support, and contributions are available
            through <a href='https://github.com/eestanleyland/COVID-19-Test-Positive-Rate'>Github</a>
          </p>
          <p>
            Website by <a href='https://www.linkedin.com/in/ronnylin/'>Ronny Lin</a>
          </p>
          <p>
            Data analytics by <a href='https://www.linkedin.com/in/kystanleylin/'>Stanley Lin</a>
          </p>
        </div>
      </div>
    )
  }
}

export default withCookies(App)
