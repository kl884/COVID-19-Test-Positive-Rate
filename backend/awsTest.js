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
  return s3.getObject({ Bucket: BUCKET_NAME, Key: 'NY/test.csv' }).promise()
}

const convertToJson = function (data) {
  return new Promise((resolve, reject) => {
    const results = []
    const bufferStream = new stream.PassThrough()
    bufferStream.end(data.Body)
    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        const keys = Object.keys(data)
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

assumeRole()
  .then(fetchCsv)
  .then(convertToJson)
  .then((result) => {
    console.log(result)
  })
  .catch((error) => {
    console.log('error: ', error)
  })

// const s3 = new AWS.S3(options)

// s3.listBuckets(function (err, data) {
//   if (err) {
//     console.log('Error', err)
//   } else {
//     console.log('success', data.Buckets)
//   }
// })
