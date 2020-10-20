/* global fetch */

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
    title: `${state} State Test Positive Rate`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.total_pos_rate
      }
    })
  })

  data.push({
    title: `${state} State Daily Test Positive Rate`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.daily_pos_Rate
      }
    })
  })

  data.push({
    title: `${state} State Daily Test Volume`,
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
    title: `${state} State Recovered`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.recovered
      }
    })
  })

  data.push({
    title: `${state} State Death`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.death
      }
    })
  })

  data.push({
    title: `${state} State Active`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.active
      }
    })
  })

  data.push({
    title: `${state} State New Cases per 100k residents`,
    data: fetchedData.data.map((row) => {
      return {
        time: row.date,
        value: row.newCasePer100k
      }
    })
  })

  return data
}

export {
  getData,
  fetchDataChoro
}
