const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const http = require('http')
const AWS = require('aws-sdk')
const stream = require('stream')
const csv = require('csv-parser')

const BUCKET_NAME = 'covid-19-trends-stanley'
const CSV_NAME = 'test.csv'
const options = {
  apiVersions: {
    s3: '2006-03-01',
    sts: '2011-06-15'
    // other service API versions
  }
}

const router = express.Router()

const fetchCsv = function () {
  const s3 = new AWS.S3(options)
  return s3.getObject({ Bucket: BUCKET_NAME, Key: CSV_NAME }).promise()
}

const convertToJson = function (data, state) {
  return new Promise((resolve, reject) => {
    const results = []
    const bufferStream = new stream.PassThrough()
    bufferStream.end(data.Body)
    bufferStream
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

router.get('/data', async (req, res) => {
  console.log('fetching data request')
  const fetchedData = await fetchCsv()
  const dataArray = await convertToJson(fetchedData, req.query.state)
  const responseBody = {
    data: dataArray
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
