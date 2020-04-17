const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const http = require('http')
const csv = require('csv-parser')
const fs = require('fs')
const https = require('https')
const line = require('@line/bot-sdk')

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}
const client = new line.Client(config)

const CSV_NAME_TREND = 'data.csv'
const CSV_NAME_PRED = 'predData.csv'

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
        result.push([data.state, parseFloat(data.total_pos_rate), data.active])
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

// Line Bot
const httpsApp = express()
httpsApp.use(line.middleware(config))

httpsApp.post('/line', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

function getProfileName (event) {
  if (event.source.type !== 'user') return Promise.resolve(null)
  client.getProfile(event.source.userId)
    .then((profile) => {
      console.log(profile.displayName)
      console.log(profile.userId)
      console.log(profile.pictureUrl)
      console.log(profile.statusMessage)
      return Promise.resolve(profile.displayName)
    })
    .catch((err) => {
      console.error('Error when getProfile: ', err)
      return Promise.resolve('Something went wrong when getting user profile')
    })
}

function handleEvent (event) {
  console.log('handle line event: ', event)

  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null)
  }

  getProfileName(event)
    .then((displayName) => {
      const echo = { type: 'text', text: `${displayName} 說 ${event.message.text}` }
      return client.replyMessage(event.replyToken, echo)
    })
    .catch((err) => {
      console.log('Error in getProfile', err)
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '我在處理訊息時出了問題'
      })
    })

  // create a echoing text message

  // use reply API
}
httpsApp.use((err, req, res, next) => {
  if (err instanceof line.SignatureValidationFailed) {
    res.status(401).send(err.signature)
    return
  } else if (err instanceof line.JSONParseError) {
    res.status(400).send(err.raw)
    return
  }
  next(err) // will throw default 500
})

const optionshttps = {
  key: fs.readFileSync('/home/ubuntu/ssl/private.key', 'utf8'),
  cert: fs.readFileSync('/home/ubuntu/ssl/certificate.crt', 'utf8'),
  ca: fs.readFileSync('/home/ubuntu/ssl/ca_bundle.crt', 'utf8')
}
https.createServer(optionshttps, httpsApp).listen(443, () => console.log('https server ready at 443!'))
