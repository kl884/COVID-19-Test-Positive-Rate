/* global fetch */
function getRandomArray (numItems) {
  // Create random array of objects
  const names = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const data = []
  for (var i = 0; i < numItems; i++) {
    data.push({
      label: names[i],
      value: Math.round(20 + 80 * Math.random())
    })
  }
  return data
}

function getRandomDateArray (numItems, min, max) {
  // Create random array of objects (with date)
  const data = []
  const baseTime = new Date('2020-03-01T00:00:00').getTime()
  const dayMs = 24 * 60 * 60 * 1000
  for (var i = 0; i < numItems; i++) {
    data.push({
      time: new Date(baseTime + i * dayMs),
      value: Math.round(min + max * Math.random())
    })
  }
  return data
}

async function fetchData (state) {
  const data = await fetch(`http://54.244.209.103/api/data?state=${state}`, {
    method: 'GET'
  })
  return data.json()
}
async function fetchDataChoro () {
  const data = await fetch('http://54.244.209.103/api/data?choropleth=true', {
    method: 'GET'
  })
  return data.json()
}

async function getData (state) {
  const data = []
  const fetchedData = await fetchData(state)
  console.log(fetchedData.data)
  data.push({
    title: `${state} State COVID-19 Test Positive Rate`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.total_pos_rate
      }
    })
  })

  data.push({
    title: 'DailyTestPos',
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.daily_pos_Rate
      }
    })
  })

  data.push({
    title: 'DailyTestVol',
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.totalTestResultsIncrease
      }
    })
  })

  data.push({
    title: `${state} State COVID-19 Daily New Cases Prediction`,
    data: getRandomDateArray(40, 0, 30000)
  })
  data.push({
    title: 'DailyNewCaseActual',
    data: getRandomDateArray(20, 0, 30000)
  })
  data.push({
    title: `${state} State COVID-19 Cumulative Cases Prediction`,
    data: getRandomDateArray(40, 0, 30000)
  })
  data.push({
    title: 'CumulCaseActual',
    data: getRandomDateArray(20, 0, 30000)
  })

  return data
}

export {
  getData,
  fetchDataChoro
}
