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
  data.push({
    title: `${state} State Test Positive Rate (%)`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.total_pos_rate
      }
    })
  })

  data.push({
    title: `${state} State Daily Test Positive Rate (%)`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.daily_pos_Rate
      }
    })
  })

  data.push({
    title: `${state} State Daily Test Volume (Count)`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.totalTestResultsIncrease
      }
    })
  })

  data.push({
    title: `${state} State Daily New Cases Prediction`,
    data: fetchedData.dataPred.map((row) => {
      return {
        time: row.date,
        value: row.positiveIncrease_pdf
      }
    })
  })
  data.push({
    title: 'DailyNewCaseActual',
    data: fetchedData.dataPred.map((row) => {
      return {
        time: row.date,
        value: row.positiveIncrease
      }
    })
  })
  data.push({
    title: `${state} State COVID-19 Cumulative Cases Prediction`,
    data: fetchedData.dataPred.map((row) => {
      return {
        time: row.date,
        value: row.positive_cdf
      }
    })
  })
  data.push({
    title: 'CumulCaseActual',
    data: fetchedData.dataPred.map((row) => {
      return {
        time: row.date,
        value: row.positive
      }
    })
  })

  data.push({
    title: `${state} State Recovered (Count)`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.recovered
      }
    })
  })

  data.push({
    title: `${state} State Death (Count)`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.death
      }
    })
  })

  data.push({
    title: `${state} State Active (Count)`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.active
      }
    })
  })

  return data
}

export {
  getData,
  fetchDataChoro
}
