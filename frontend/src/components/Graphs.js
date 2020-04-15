import React from 'react'
import Chart from 'chart.js'
Chart.defaults.global.defaultFontFamily = 'Roboto, sans-serif'

Chart.defaults.LineWithLine = Chart.defaults.line
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
  draw: function (ease) {
    Chart.controllers.line.prototype.draw.call(this, ease)
    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0]
      var ctx = this.chart.ctx
      var x = activePoint.tooltipPosition().x
      const Y = this.chart.scales['y-axis-0'] || this.chart.scales['y-axis-1']
      var topY = Y.top
      var bottomY = Y.bottom

      // draw line
      ctx.lineWidth = 1
      ctx.strokeStyle = '#E5E7E9'
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x, topY)
      ctx.lineTo(x, bottomY)
      ctx.stroke()
      ctx.restore()
    }
  }
})

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

const defaultOptionsForAllGraph = {
  title: { display: false },
  pointRadius: 3,
  legendDisplay: true,
  tooltipItemTitle: (tooltipItem) => {
    return tooltipItem[0].label.replace(/, [0-9]{1,2}:.*m/gi, '')
  },
  tooltipItemPercentage: (tooltipItem) => {
    return Math.round(tooltipItem.yLabel * 100) / 100
  },
  tooltipItemLabel: (tooltipItem, data) => {
    return data.datasets[tooltipItem.datasetIndex].label.replace(/.* state/gi, '')
  },
  tooltipItemCount: (tooltipItem) => {
    return Math.round(tooltipItem.yLabel).toLocaleString()
  },
  percentTicks: {
    min: 0,
    stepSize: 20,
    max: 100
  },
  countTicks: (context) => {
    return {
      min: 0,
      fontColor: context.fontColor || null,
      maxTicksLimit: context.maxTicksLimit || 5,
      callback: function (value, index, values) {
        if (value >= 1000) {
          return value / 1000 + 'k'
        } else {
          return value
        }
      }
    }
  },
  hover: {
    intersect: false,
    mode: 'index'
  },
  tooltipMode: 'index',
  pointBorderWidth: 1.5,
  borderWidth: 2,
  pointBackgroundColor: '#FFFFFF ',
  borderDash: [5, 5],
  tooltipIntersect: false
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
      type: 'LineWithLine',
      options: {
        title: defaultOptionsForAllGraph.title,
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
                return context.dataIndex < 3 ? defaultOptionsForAllGraph.pointRadius : 0
              }
            } else {
              ci.data.datasets[datasetIndex].pointRadius = defaultOptionsForAllGraph.pointRadius
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        hover: defaultOptionsForAllGraph.hover,
        tooltips: {
          mode: defaultOptionsForAllGraph.tooltipMode,
          intersect: defaultOptionsForAllGraph.tooltipIntersect,
          callbacks: {
            title: function (tooltipItem, data) {
              const title = defaultOptionsForAllGraph.tooltipItemTitle(tooltipItem) + ' (%)'
              return title
            },
            label: function (tooltipItem, data) {
              let label = 'Test Positive Rate: '
              label += defaultOptionsForAllGraph.tooltipItemPercentage(tooltipItem)
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
              ticks: defaultOptionsForAllGraph.percentTicks,
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
            return context.dataIndex < 3 ? defaultOptionsForAllGraph.pointRadius : 0
          },
          pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
          pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
          pointHoverBackgroundColor: this.props.color,
          borderColor: this.props.color,
          borderWidth: defaultOptionsForAllGraph.borderWidth
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
    this.myChart.data.datasets[0].label = this.props.titleRate
    this.myChart.data.datasets[1].label = this.props.titleVol
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'LineWithLine',
      options: {
        title: defaultOptionsForAllGraph.title,
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
                return context.dataIndex < 3 ? defaultOptionsForAllGraph.pointRadius : 0
              }
              ci.data.datasets[1].pointRadius = function (context) {
                return context.dataIndex < 3 ? defaultOptionsForAllGraph.pointRadius : 0
              }
            } else {
              ci.data.datasets[0].pointRadius = defaultOptionsForAllGraph.pointRadius
              ci.data.datasets[1].pointRadius = defaultOptionsForAllGraph.pointRadius
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        maintainAspectRatio: false,
        hover: defaultOptionsForAllGraph.hover,
        tooltips: {
          mode: defaultOptionsForAllGraph.tooltipMode,
          intersect: defaultOptionsForAllGraph.tooltipIntersect,
          callbacks: {
            title: function (tooltipItem, data) {
              const title = defaultOptionsForAllGraph.tooltipItemTitle(tooltipItem)
              return title
            },
            label: function (tooltipItem, data) {
              let label = defaultOptionsForAllGraph.tooltipItemLabel(tooltipItem, data)

              if (tooltipItem.datasetIndex === 0) {
                label += ' (%): '
                label += defaultOptionsForAllGraph.tooltipItemPercentage(tooltipItem)
              } else {
                label += ' (Count): '
                label += defaultOptionsForAllGraph.tooltipItemCount(tooltipItem)
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
              ticks: defaultOptionsForAllGraph.percentTicks,
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
              ticks: defaultOptionsForAllGraph.countTicks({ fontColor: '#1E8449' }),
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
            return context.dataIndex < 3 ? defaultOptionsForAllGraph.pointRadius : 0
          },
          pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
          pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
          pointHoverBackgroundColor: '#FF2D00',
          borderColor: '#FF2D00',
          borderWidth: defaultOptionsForAllGraph.borderWidth
        },
        {
          yAxisID: 'y-axis-2',
          label: this.props.titleVol,
          data: this.props.dataVol.map(d => d.value), // d is array of objects with properties time and value
          fill: 'none',
          backgroundColor: '#1E8449',
          pointRadius: function (context) {
            return context.dataIndex < 3 ? defaultOptionsForAllGraph.pointRadius : 0
          },
          pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
          pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
          pointHoverBackgroundColor: '#1E8449',
          borderColor: '#1E8449',
          borderWidth: defaultOptionsForAllGraph.borderWidth
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
    this.myChart.data.datasets[1].data = this.props.dataModel.map(d => d.value)
    this.myChart.data.datasets[0].data = this.props.dataActual.map(d => d.value)
    this.myChart.options.title.text = this.props.title
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'LineWithLine',
      options: {
        legend: {
          display: true,
          onClick: function (e, legendItem) {
            const datasetIndex = legendItem.datasetIndex
            const ci = this.chart
            const meta = ci.getDatasetMeta(datasetIndex)
            if (meta.showAllPoint) {
              ci.data.datasets[0].pointRadius = 0
              ci.data.datasets[1].pointRadius = 0
            } else {
              ci.data.datasets[0].pointRadius = defaultOptionsForAllGraph.pointRadius
              ci.data.datasets[1].pointRadius = defaultOptionsForAllGraph.pointRadius
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        maintainAspectRatio: false,
        hover: defaultOptionsForAllGraph.hover,
        tooltips: {
          mode: defaultOptionsForAllGraph.tooltipMode,
          intersect: defaultOptionsForAllGraph.tooltipIntersect,
          callbacks: {
            title: function (tooltipItem, data) {
              const title = defaultOptionsForAllGraph.tooltipItemTitle(tooltipItem) + ' (Count)'
              return title
            },
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label + ': '

              label += defaultOptionsForAllGraph.tooltipItemCount(tooltipItem)
              return label
            },
            labelColor: function (tooltipItem, data) {
              return tooltipItem.datasetIndex === 0 ? { backgroundColor: '#F39C12' } : { backgroundColor: '#2E86C1' }
            }
          }
        },
        // plugins: {
        //   crosshair: {
        //     line: {
        //       color: '#F66', // crosshair line color
        //       width: 1, // crosshair line width
        //       dashPattern: [5, 5] // crosshair line dash pattern
        //     }
        //   }
        // },
        scales: {
          xAxes: [
            {
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
              }
            }
          ],
          yAxes: [
            {
              ticks: defaultOptionsForAllGraph.countTicks({ maxTicksLimit: 8 })
            }
          ]
        }
      },
      data: {
        labels: this.props.dataModel.map(d => d.time),
        datasets: [
          {
            label: 'Daily Actual', // Top legend lable
            data: this.props.dataActual.map(d => d.value), // d is array of objects with properties time and value
            fill: 'none',
            backgroundColor: '#F39C12',
            pointRadius: 0,
            borderColor: '#F39C12',
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#F39C12',
            borderWidth: defaultOptionsForAllGraph.borderWidth
          },
          {
            label: 'Daily Model', // Top legend lable
            data: this.props.dataModel.map(d => d.value), // d is array of objects with properties time and value
            fill: 'none',
            backgroundColor: '#2E86C1',
            borderDash: defaultOptionsForAllGraph.borderDash,
            pointRadius: 0,
            borderColor: '#2E86C1',
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#2E86C1',
            borderWidth: defaultOptionsForAllGraph.borderWidth
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
    this.myChart.data.datasets[1].data = this.props.dataModel.map(d => d.value)
    this.myChart.data.datasets[0].data = this.props.dataActual.map(d => d.value)
    this.myChart.options.title.text = this.props.title
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'LineWithLine',
      options: {
        legend: {
          display: true,
          onClick: function (e, legendItem) {
            const datasetIndex = legendItem.datasetIndex
            const ci = this.chart
            const meta = ci.getDatasetMeta(datasetIndex)
            if (meta.showAllPoint) {
              ci.data.datasets[0].pointRadius = 0
              ci.data.datasets[1].pointRadius = 0
            } else {
              ci.data.datasets[0].pointRadius = defaultOptionsForAllGraph.pointRadius
              ci.data.datasets[1].pointRadius = defaultOptionsForAllGraph.pointRadius
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        hover: defaultOptionsForAllGraph.hover,
        maintainAspectRatio: false,
        tooltips: {
          mode: 'index',
          intersect: defaultOptionsForAllGraph.tooltipIntersect,
          callbacks: {
            title: function (tooltipItem, data) {
              const title = defaultOptionsForAllGraph.tooltipItemTitle(tooltipItem) + ' (Count)'
              return title
            },
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label + ': '

              label += defaultOptionsForAllGraph.tooltipItemCount(tooltipItem)
              return label
            },
            labelColor: function (tooltipItem, data) {
              return tooltipItem.datasetIndex === 0 ? { backgroundColor: '#F39C12' } : { backgroundColor: '#2E86C1' }
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
                  week: 'M/D'
                }
              },
              gridLines: {
                drawOnChartArea: false,
                drawBorder: false
              }
            }
          ],
          yAxes: [
            {
              ticks: defaultOptionsForAllGraph.countTicks({ maxTicksLimit: 8 })
            }
          ]
        }
      },
      data: {
        labels: this.props.dataModel.map(d => d.time),
        datasets: [
          {
            label: 'Cumulative Actual', // Top legend lable
            data: this.props.dataActual.map(d => d.value), // d is array of objects with properties time and value
            fill: 'none',
            backgroundColor: '#F39C12',
            pointRadius: 0,
            borderColor: '#F39C12',
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#F39C12',
            borderWidth: defaultOptionsForAllGraph.borderWidth
          },
          {
            label: 'Cumulative Model', // Top legend lable
            data: this.props.dataModel.map(d => d.value), // d is array of objects with properties time and value
            fill: 'none',
            backgroundColor: '#2E86C1',
            borderDash: defaultOptionsForAllGraph.borderDash,
            pointRadius: 0,
            borderColor: '#2E86C1',
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#2E86C1',
            borderWidth: defaultOptionsForAllGraph.borderWidth
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
    this.myChart.data.datasets[1].data = this.props.dataDeath.map(d => d.value)
    this.myChart.data.datasets[0].data = this.props.dataRecovered.map(d => d.value)
    this.myChart.data.datasets[1].label = this.props.titleDeath
    this.myChart.data.datasets[0].label = this.props.titleRecovered
    this.myChart.data.datasets[2].label = this.props.titleActive
    this.myChart.update()
  }

  componentDidMount () {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'LineWithLine',
      options: {
        title: defaultOptionsForAllGraph.title,
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
              ci.data.datasets[0].pointRadius = defaultOptionsForAllGraph.pointRadius
              ci.data.datasets[1].pointRadius = defaultOptionsForAllGraph.pointRadius
              ci.data.datasets[2].pointRadius = defaultOptionsForAllGraph.pointRadius
            }
            meta.showAllPoint = meta.showAllPoint === null || meta.showAllPoint === undefined ? !meta.showAllPoint : null
            ci.update()
          }
        },
        maintainAspectRatio: false,
        hover: defaultOptionsForAllGraph.hover,
        tooltips: {
          mode: defaultOptionsForAllGraph.tooltipMode,
          intersect: defaultOptionsForAllGraph.tooltipIntersect,
          callbacks: {
            title: function (tooltipItem, data) {
              const title = defaultOptionsForAllGraph.tooltipItemTitle(tooltipItem) + ' (Count)'
              return title
            },
            label: function (tooltipItem, data) {
              let label = defaultOptionsForAllGraph.tooltipItemLabel(tooltipItem, data)
              if (label) {
                label += ': '
              }

              label += defaultOptionsForAllGraph.tooltipItemCount(tooltipItem)
              return label
            },
            labelColor: function (tooltipItem, data) {
              return tooltipItem.datasetIndex === 1 ? { backgroundColor: '#E74C3C' }
                : tooltipItem.datasetIndex === 0 ? { backgroundColor: '#2ECC71' } : { backgroundColor: '#3498DB' }
            }
          }
        },
        scales: {
          xAxes: [
            defaultSetting({ ticksMax: this.props.dataActive[0], ticksMin: this.props.dataActive[this.props.dataActive.length - 1] })
          ],
          yAxes: [
            {
              ticks: defaultOptionsForAllGraph.countTicks({ maxTicksLimit: 8 }),
              stacked: true
            }
          ]
        }
      },
      data: {
        labels: this.props.dataActive.map(d => d.time),
        datasets: [
          {
            label: this.props.titleRecovered,
            data: this.props.dataRecovered.map(d => d.value), // d is array of objects with properties time and value
            backgroundColor: '#2ECC71',
            pointRadius: defaultOptionsForAllGraph.pointRadius,
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#2ECC71',
            borderColor: '#2ECC71',
            borderWidth: defaultOptionsForAllGraph.borderWidth
          },
          {
            label: this.props.titleDeath,
            data: this.props.dataDeath.map(d => d.value), // d is array of objects with properties time and value
            backgroundColor: '#E74C3C',
            pointRadius: defaultOptionsForAllGraph.pointRadius,
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#E74C3C',
            borderColor: '#E74C3C',
            borderWidth: defaultOptionsForAllGraph.borderWidth
          },
          {
            label: this.props.titleActive,
            data: this.props.dataActive.map(d => d.value), // d is array of objects with properties time and value
            backgroundColor: '#3498DB',
            pointRadius: defaultOptionsForAllGraph.pointRadius,
            pointBorderWidth: defaultOptionsForAllGraph.pointBorderWidth,
            pointBackgroundColor: defaultOptionsForAllGraph.pointBackgroundColor,
            pointHoverBackgroundColor: '#3498DB',
            borderColor: '#3498DB',
            borderWidth: defaultOptionsForAllGraph.borderWidth
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
