const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const http = require('http')
const csv = require('csv-parser')
const fs = require('fs')

const CSV_NAME_TREND = '/home/ubuntu/test.csv'
const CSV_NAME_PRED = '/home/ubuntu/predData.csv'

const router = express.Router()

const convertToJson = function (state, csvName) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(csvName)
      .pipe(csv())
      .on('data', (data) => {
        if (data.state !== state) return
        const keys = Object.keys(data)
        keys.shift()
        for (const key of keys) {
          data[key] = parseFloat(data[key])
        }
        results.push(data)
      })
      .on('end', () => {
        resolve(results)
      })
  })
}

const convertToJsonChoro = function (csvName) {
  return new Promise((resolve, reject) => {
    const result = []
    const numDataNeeded = 56
    let dataSoFar = 0
    const readStream = fs.createReadStream(csvName)
    readStream
      .pipe(csv())
      .on('data', (data) => {
        if (dataSoFar === numDataNeeded) return
        result.push([data.state, parseFloat(data.averageDailyTestPositiveRate), parseFloat(data.averageNewCasePer100k), data.active])
        dataSoFar++
      })
      .on('end', () => {
        resolve(result)
      })
  })
}

router.get('/data', async (req, res) => {
  console.log('GET /data:\n' + `\theaders: ${JSON.stringify(req.headers)}\n` + `\turl: ${req.url}`)
  // const fetchedData = await fetchCsv()
  let dataArray, dataArrayTrend, dataArrayPred
  if (req.query.choropleth === 'true') {
    dataArrayTrend = await convertToJsonChoro(CSV_NAME_TREND)
  } else if (req.query.state) {
    dataArrayTrend = await convertToJson(req.query.state, CSV_NAME_TREND)
    dataArrayPred = await convertToJson(req.query.state, CSV_NAME_PRED)
  } else {
    return res.status(404).send()
  }
  const responseBody = {
    data: dataArrayTrend,
    dataTrend: dataArrayTrend,
    dataPred: dataArrayPred
  }
  return res.json(responseBody)
})

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
app.use('/api', router)
app.use(express.static(path.join(__dirname, 'build')))
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
http.createServer(app).listen(80, () => console.log('http server ready at 80'))

const formstackApp = express()
formstackApp.use(express.static(path.join(__dirname, 'buildFormStack')))
formstackApp.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'buildFormStack', 'index.html'))
})
formstackApp.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'buildFormStack', 'index.html'))
})
http.createServer(formstackApp).listen(3000, () => console.log('http server ready at 3000'))
