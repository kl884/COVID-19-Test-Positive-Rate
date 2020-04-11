const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const http = require('http')
const AWS = require('aws-sdk')
const stream = require('stream')
const csv = require('csv-parser')
const fs = require('fs')
const https = require('https')

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

const convertToJson = function (state) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream('data.csv')
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

const convertToJsonChoro = function (data) {
  return new Promise((resolve, reject) => {
    const result = []
    const numDataNeeded = 56
    let dataSoFar = 0
    const readStream = fs.createReadStream('data.csv')
    readStream
      .pipe(csv())
      .on('data', (data) => {
        if (dataSoFar === numDataNeeded) return
        result.push([data.state, parseFloat(data.total_pos_rate)])
        dataSoFar++
      })
      .on('end', () => {
        resolve(result)
      })
  })
}

router.get('/data', async (req, res) => {
  console.log('fetching data request')
  // const fetchedData = await fetchCsv()
  let dataArray = null
  if (req.query.choropleth === 'true') {
    dataArray = await convertToJsonChoro()
  } else {
    dataArray = await convertToJson(req.query.state)
  }
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

const httpsApp = express()
const httpsRouter = express.Router()

httpsRouter.get('/', function (req, res) {
  console.log('verify line webhook called')
  res.send(200)
})
httpsRouter.get('/test', async function (req, res) {
  console.log('test line webhook called')
  const responseBody = {
    data: 'cool'
  }
  return res.json(responseBody)
})
httpsApp.use(bodyParser.urlencoded({
  extended: true
}))
httpsApp.use(bodyParser.json())

httpsApp.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
httpsApp.use('/line', httpsRouter)
const optionshttps = {
  key: fs.readFileSync('/home/ubuntu/ssl/private.key', 'utf8'),
  cert: fs.readFileSync('/home/ubuntu/ssl/certificate.crt', 'utf8'),
  ca: fs.readFileSync('/home/ubuntu/ssl/ca_bundle.crt', 'utf8')
}
https.createServer(optionshttps, httpsApp).listen(443, () => console.log('https server ready at 443!'))
