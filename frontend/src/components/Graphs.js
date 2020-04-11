import React from 'react'
import Chart from 'chart.js'
Chart.defaults.global.defaultFontFamily = 'Roboto, sans-serif'

class CumulChart extends React.Component {
  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidUpdate () {
    this.myChart.data.labels = this.props.data.map(d => d.time)
    this.myChart.data.datasets[0].data = this.props.data.map(d => d.value)
    this.myChart.options.title.text = this.props.title
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        title: {
          display: true,
          text: this.props.title
        },
        legend: {
          display: false
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              let label = ''
              label += Math.round(tooltipItem.yLabel * 100) / 100
              label += '%'
              return label
            }
          }
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'M-D'
                }
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                min: 0
              },
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Cumulative Test Positive Rate (%)'
              }
            }
          ]
        }
      },
      data: {
        labels: this.props.data.map(d => d.time),
        datasets: [{
          label: this.props.title, // Top legend lable
          data: this.props.data.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: this.props.color,
          pointRadius: 2,
          borderColor: this.props.color,
          borderWidth: 1,
          lineTension: 0
        }]
      }
    })
  }

  render () {
    return <canvas ref={this.canvasRef} />
  }
}

class DailyChart extends React.Component {
  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidUpdate () {
    this.myChart.data.labels = this.props.dataRate.map(d => d.time)
    this.myChart.data.datasets[0].data = this.props.dataRate.map(d => d.value)
    this.myChart.data.datasets[1].data = this.props.dataVol.map(d => d.value)
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        title: {
          display: true,
          text: ''
        },
        legend: {
          display: false
        },
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label || ''
              if (label) {
                label += ': '
              }
              if (tooltipItem.datasetIndex === 0) {
                label += Math.round(tooltipItem.yLabel * 100) / 100
                label += '%'
              } else {
                label += tooltipItem.yLabel
              }
              return label
            }
          }
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'M-D'
                }
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                fontColor: '#FF2D00'
              },
              display: true,
              position: 'left',
              scaleLabel: {
                display: true,
                labelString: 'Daily Test Positive Rate (%)',
                fontColor: '#FF2D00'
              },
              gridLines: {
                drawOnChartArea: false
              },
              id: 'y-axis-1'
            },
            {
              ticks: {
                min: 0,
                fontColor: '#1E8449'
              },
              display: true,
              position: 'right',
              scaleLabel: {
                display: true,
                labelString: 'Daily Test Volume',
                fontColor: '#1E8449'
              },
              gridLines: {
                drawOnChartArea: false
              },
              id: 'y-axis-2'
            }
          ]
        }
      },
      data: {
        labels: this.props.dataRate.map(d => d.time),
        datasets: [{
          yAxisID: 'y-axis-1',
          data: this.props.dataRate.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#FF2D00',
          pointRadius: 2,
          borderColor: '#FF2D00',
          borderWidth: 1,
          lineTension: 0
        },
        {
          yAxisID: 'y-axis-2',
          data: this.props.dataVol.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#1E8449',
          pointRadius: 2,
          borderColor: '#1E8449',
          borderWidth: 1,
          lineTension: 0
        }
        ]
      }
    })
  }

  render () {
    return <canvas ref={this.canvasRef} />
  }
}

class PredDailyChart extends React.Component {
  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidUpdate () {
    this.myChart.data.labels = this.props.dataModel.map(d => d.time)
    this.myChart.data.datasets[0].data = this.props.dataModel.map(d => d.value)
    this.myChart.data.datasets[1].data = this.props.dataActual.map(d => d.value)
    this.myChart.options.title.text = this.props.title
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        title: {
          display: true,
          text: this.props.title
        },
        legend: {
          display: true,
          position: 'right'
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'M-D'
                }
              }
            }
          ],
          yAxes: [
            {
              type: 'linear',
              ticks: {
                min: 0
              },
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Positive Cases'
              },
              id: 'y-axis-1'
            },
            {
              type: 'linear',
              ticks: {
                min: 0
              },
              display: false,
              gridLines: {
                drawOnChartArea: false
              },
              id: 'y-axis-2'
            }
          ]
        }
      },
      data: {
        labels: this.props.dataModel.map(d => d.time),
        datasets: [{
          label: 'Model', // Top legend lable
          yAxisID: 'y-axis-1',
          data: this.props.dataModel.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#2E86C1',
          pointRadius: 0,
          borderColor: '#2E86C1',
          borderWidth: 1
        },
        {
          label: 'Actual', // Top legend lable
          yAxisID: 'y-axis-2',
          data: this.props.dataActual.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#F39C12',
          pointRadius: 0,
          borderColor: '#F39C12',
          borderWidth: 1,
          lineTension: 0
        }
        ]
      }
    })
  }

  render () {
    return <canvas ref={this.canvasRef} />
  }
}

class PredCumulChart extends React.Component {
  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidUpdate () {
    this.myChart.data.labels = this.props.dataModel.map(d => d.time)
    this.myChart.data.datasets[0].data = this.props.dataModel.map(d => d.value)
    this.myChart.data.datasets[1].data = this.props.dataActual.map(d => d.value)
    this.myChart.options.title.text = this.props.title
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        title: {
          display: true,
          text: this.props.title
        },
        legend: {
          display: true,
          position: 'right'
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'M-D'
                }
              }
            }
          ],
          yAxes: [
            {
              type: 'linear',
              ticks: {
                min: 0
              },
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Cumulative Positive Cases'
              },
              id: 'y-axis-1'
            },
            {
              type: 'linear',
              ticks: {
                min: 0
              },
              display: false,
              gridLines: {
                drawOnChartArea: false
              },
              id: 'y-axis-2'
            }
          ]
        }
      },
      data: {
        labels: this.props.dataModel.map(d => d.time),
        datasets: [{
          label: 'Model', // Top legend lable
          yAxisID: 'y-axis-1',
          data: this.props.dataModel.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#2E86C1',
          pointRadius: 0,
          borderColor: '#2E86C1',
          borderWidth: 1
        },
        {
          label: 'Actual', // Top legend lable
          yAxisID: 'y-axis-2',
          data: this.props.dataActual.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#F39C12',
          pointRadius: 0,
          borderColor: '#F39C12',
          borderWidth: 1
        }
        ]
      }
    })
  }

  render () {
    return <canvas ref={this.canvasRef} />
  }
}

export {
  CumulChart,
  DailyChart,
  PredDailyChart,
  PredCumulChart
}
