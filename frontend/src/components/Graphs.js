import React from 'react'
import Chart from 'chart.js'
Chart.defaults.global.defaultFontFamily = 'Roboto, sans-serif'

const defaultSetting = (context) => {
  // console.log('context: ', context)
  return {
    type: 'time',
    time: {
      unit: 'week',
      displayFormats: {
        week: 'M/D'
      }
    },
    gridLines: {
      drawOnChartArea: false,
      drawBorder: false
    },
    ticks: {
      min: context.ticksMin.time - 24 * 60 * 60 * 1000,
      max: context.ticksMax.time + 3 * 24 * 60 * 60 * 1000
    }
  }
}

class CumulChart extends React.Component {
  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
    this.yLabel = 'Cumulative Test Positive Rate (%)'
  }

  componentDidUpdate () {
    this.myChart.data.labels = this.props.data.map(d => d.time)
    this.myChart.data.datasets[0].data = this.props.data.map(d => d.value)
    this.myChart.data.datasets[0].label = this.props.title
    this.myChart.options.title.text = this.props.title
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        title: {
          display: false,
          text: this.props.title
        },
        legend: {
          display: true,
          labels: {
            // usePointStyle: true
          },
          onClick: function (e, legendItem) {
            const datasetIndex = legendItem.datasetIndex
            const ci = this.chart
            const meta = ci.getDatasetMeta(datasetIndex)
            if (meta.showAllPoint) {
              ci.data.datasets[datasetIndex].pointRadius = function (context) {
                return context.dataIndex < 3 ? 2 : 0
              }
            } else {
              ci.data.datasets[datasetIndex].pointRadius = 2
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              let label = 'Test Positive Rate: '
              label += Math.round(tooltipItem.yLabel * 100) / 100
              label += '%'
              return label
            },
            labelColor: function (tooltipItem, data) {
              return {
                backgroundColor: '#3498DB'
              }
            }
          }
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            defaultSetting({ ticksMax: this.props.data[0], ticksMin: this.props.data[this.props.data.length - 1] })
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                stepSize: 20,
                max: 100
              },
              display: true,
              scaleLabel: {
                display: false,
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
          pointRadius: function (context) {
            return context.dataIndex < 3 ? 2 : 0
          },
          pointBorderWidth: 1,
          pointBackgroundColor: '#FFFFFF ',
          pointHoverBackgroundColor: this.props.color,
          borderColor: this.props.color,
          borderWidth: 1
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
          display: false,
          text: ''
        },
        legend: {
          display: true,
          labels: {
            // usePointStyle: true
          },
          onClick: function (e, legendItem) {
            // const datasetIndex = legendItem.datasetIndex
            const ci = this.chart
            const meta = ci.getDatasetMeta(0)
            if (meta.showAllPoint) {
              ci.data.datasets[0].pointRadius = function (context) {
                return context.dataIndex < 3 ? 2 : 0
              }
              ci.data.datasets[1].pointRadius = function (context) {
                return context.dataIndex < 3 ? 2 : 0
              }
            } else {
              ci.data.datasets[0].pointRadius = 2
              ci.data.datasets[1].pointRadius = 2
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        maintainAspectRatio: false,
        tooltips: {
          mode: 'index',
          callbacks: {
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label.replace(/.* state/gi, '')
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
            },
            labelColor: function (tooltipItem, data) {
              return tooltipItem.datasetIndex === 0 ? { backgroundColor: '#FF2D00' } : { backgroundColor: '#1E8449' }
            }
          }
        },
        scales: {
          xAxes: [
            defaultSetting({ ticksMax: this.props.dataRate[0], ticksMin: this.props.dataRate[this.props.dataRate.length - 1] })
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                fontColor: '#FF2D00',
                max: 100,
                stepSize: 20
              },
              display: true,
              position: 'left',
              scaleLabel: {
                display: false,
                labelString: 'Daily Test Positive Rate (%)',
                fontColor: '#FF2D00'
              },
              gridLines: {
                drawOnChartArea: true
              },
              id: 'y-axis-1'
            },
            {
              ticks: {
                min: 0,
                fontColor: '#1E8449',
                maxTicksLimit: 5,
                callback: function (value, index, values) {
                  if (value > 1000) {
                    return value / 1000 + 'k'
                  }
                }
              },
              display: true,
              position: 'right',
              scaleLabel: {
                display: false,
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
          label: this.props.titleRate,
          data: this.props.dataRate.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#FF2D00',
          pointRadius: function (context) {
            return context.dataIndex < 3 ? 2 : 0
          },
          pointBorderWidth: 1,
          pointBackgroundColor: '#FFFFFF ',
          pointHoverBackgroundColor: '#FF2D00',
          borderColor: '#FF2D00',
          borderWidth: 1
        },
        {
          yAxisID: 'y-axis-2',
          label: this.props.titleVol,
          data: this.props.dataVol.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#1E8449',
          pointRadius: function (context) {
            return context.dataIndex < 3 ? 2 : 0
          },
          pointBorderWidth: 1,
          pointBackgroundColor: '#FFFFFF ',
          pointHoverBackgroundColor: '#1E8449',
          borderColor: '#1E8449',
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
        legend: {
          display: true
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
              },
              gridLines: {
                drawOnChartArea: false
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
              id: 'y-axis-1'
            },
            {
              type: 'linear',
              ticks: {
                min: 0,
                maxTicksLimit: 5
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
          label: 'Daily Model', // Top legend lable
          yAxisID: 'y-axis-1',
          data: this.props.dataModel.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#2E86C1',
          pointRadius: 0,
          borderColor: '#2E86C1',
          borderWidth: 1
        },
        {
          label: 'Daily Actual', // Top legend lable
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
        legend: {
          display: true
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
              },
              gridLines: {
                drawOnChartArea: false
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
              id: 'y-axis-1'
            },
            {
              type: 'linear',
              ticks: {
                min: 0,
                maxTicksLimit: 5
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
          label: 'Cumulative Model', // Top legend lable
          yAxisID: 'y-axis-1',
          data: this.props.dataModel.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#2E86C1',
          pointRadius: 0,
          borderColor: '#2E86C1',
          borderWidth: 1
        },
        {
          label: 'Cumulative Actual', // Top legend lable
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

class StackedChart extends React.Component {
  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidUpdate () {
    this.myChart.data.labels = this.props.dataActive.map(d => d.time)
    this.myChart.data.datasets[2].data = this.props.dataActive.map(d => d.value)
    this.myChart.data.datasets[0].data = this.props.dataDeath.map(d => d.value)
    this.myChart.data.datasets[1].data = this.props.dataRecovered.map(d => d.value)
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        title: {
          display: false,
          text: ''
        },
        legend: {
          display: true,
          labels: {
            // usePointStyle: true
          },
          onClick: function (e, legendItem) {
            // const datasetIndex = legendItem.datasetIndex
            const ci = this.chart
            const meta = ci.getDatasetMeta(0)
            if (!meta.showAllPoint) {
              ci.data.datasets[0].pointRadius = 0
              ci.data.datasets[1].pointRadius = 0
              ci.data.datasets[2].pointRadius = 0
            } else {
              ci.data.datasets[0].pointRadius = 2
              ci.data.datasets[1].pointRadius = 2
              ci.data.datasets[2].pointRadius = 2
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        maintainAspectRatio: false,
        tooltips: {
          mode: 'index',
          callbacks: {
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label.replace(/.* state/gi, '')
              if (label) {
                label += ': '
              }

              label += tooltipItem.yLabel
              return label
            },
            labelColor: function (tooltipItem, data) {
              return tooltipItem.datasetIndex === 0 ? { backgroundColor: '#FF2D00' } : { backgroundColor: '#1E8449' }
            }
          }
        },
        scales: {
          xAxes: [
            defaultSetting({ ticksMax: this.props.dataActive[0], ticksMin: this.props.dataActive[this.props.dataActive.length - 1] })
          ],
          yAxes: [
            {
              ticks: {
                maxTicksLimit: 5,
                callback: function (value, index, values) {
                  if (value > 1000) {
                    return value / 1000 + 'k'
                  }
                }
              },
              stacked: true
            }
          ]
        }
      },
      data: {
        labels: this.props.dataActive.map(d => d.time),
        datasets: [
          {
            label: this.props.titleDeath,
            data: this.props.dataDeath.map(d => d.value), // d is array of objects with properties time and value
            backgroundColor: '#E74C3C',
            pointRadius: 2,
            pointBorderWidth: 1,
            pointBackgroundColor: '#FFFFFF ',
            pointHoverBackgroundColor: '#E74C3C',
            borderColor: '#E74C3C',
            borderWidth: 1
          },
          {
            label: this.props.titleRecovered,
            data: this.props.dataRecovered.map(d => d.value), // d is array of objects with properties time and value
            backgroundColor: '#2ECC71',
            pointRadius: 2,
            pointBorderWidth: 1,
            pointBackgroundColor: '#FFFFFF ',
            pointHoverBackgroundColor: '#2ECC71',
            borderColor: '#2ECC71',
            borderWidth: 1
          },
          {
            label: this.props.titleActive,
            data: this.props.dataActive.map(d => d.value), // d is array of objects with properties time and value
            backgroundColor: '#3498DB',
            pointRadius: 2,
            pointBorderWidth: 1,
            pointBackgroundColor: '#FFFFFF ',
            pointHoverBackgroundColor: '#3498DB',
            borderColor: '#3498DB',
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
  PredCumulChart,
  StackedChart
}
