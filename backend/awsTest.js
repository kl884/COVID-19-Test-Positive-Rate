const fs = require('fs')
const AWS = require('aws-sdk')
const csv = require('csv-parser')
const stream = require('stream')

AWS.config.update({ region: 'us-west-2' })

const BUCKET_NAME = 'covid-19-trends-stanley'

const options = {
  apiVersions: {
    s3: '2006-03-01',
    sts: '2011-06-15'
    // other service API versions
  },
  credentials: new AWS.SharedIniFileCredentials({
    profile: 'ronny-admin'
  })
}

const assumeRoleParams = {
  RoleArn: 'arn:aws:iam::352047137587:role/EC2_S3_full_Access',
  RoleSessionName: 'TestingAssumeRoleInMacBookWithRonnyCred'
}

const assumeRole = function () {
  const sts = new AWS.STS(options)
  return sts.assumeRole(assumeRoleParams).promise()
}

const fetchCsv = function (data) {
  options.accessKeyId = data.Credentials.AccessKeyId
  options.secretAccessKey = data.Credentials.SecretAccessKey
  options.sessionToken = data.Credentials.SessionToken
  const s3 = new AWS.S3(options)
  return s3.getObject({ Bucket: BUCKET_NAME, Key: 'test.csv' }).promise()
}

const convertToJsonPred = function (data) {
  return new Promise((resolve, reject) => {
    const state = 'NY'
    const results = []
    fs.createReadStream('../python/predData.csv')
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

const convertToJson = function (data) {
  return new Promise((resolve, reject) => {
    const state = 'NY'
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

const convertToJsonFile = function (data) {
  return new Promise((resolve, reject) => {
    const state = 'NY'
    const results = []
    fs.createReadStream('../python/test.csv')
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

const convertToJsonChoro = async function () {
  const result = []
  const numDataNeeded = 56
  let dataSoFar = 0
  const readStream = fs.createReadStream('../python/test.csv')
  readStream
    .pipe(csv())
    .on('data', (data) => {
      if (dataSoFar === numDataNeeded) return
      result.push([data.state, parseFloat(data.total_pos_rate)])
      dataSoFar++
    })
    .on('end', () => {
      console.log('readStream ended, ')
      return result
    })
}

const convertToJsonFileChoroTwo = function (data) {
  return new Promise((resolve, reject) => {
    const result = []
    const numDataNeeded = 56
    let dataSoFar = 0
    const readStream = fs.createReadStream('../python/test.csv')
    readStream
      .pipe(csv())
      .on('data', (data) => {
        if (dataSoFar === numDataNeeded) return
        result.push([data.state, parseFloat(data.total_pos_rate)])
        dataSoFar++
      })
      .on('end', () => {
        console.log('readStream ended, ')
        resolve(result)
      })
  })
}

// assumeRole()
//   .then(fetchCsv)
//   .then(convertToJson)
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((error) => {
//     console.log('error: ', error)
//   })

convertToJsonPred()
  .then((result) => {
    console.log(result)
  })

// async function mainTest () {
//   const result = await convertToJsonChoro()
//   console.log(result)
// }

// mainTest()

// convertToJsonFileChoroTwo().then((result) => {
//   console.log(result)
// })
