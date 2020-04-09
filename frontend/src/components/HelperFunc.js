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

export function getData (value) {
  const data = []
  data.push({
    title: `${value} State COVID-19 Test Positive Rate`,
    data: getRandomDateArray(20, 0, 80)
  })

  data.push({
    title: 'DailyTestPos',
    data: getRandomDateArray(20, 0, 100)
  })

  data.push({
    title: 'DailyTestVol',
    data: getRandomDateArray(20, 0, 30000)
  })

  data.push({
    title: `${value} State COVID-19 Daily New Cases Prediction`,
    data: getRandomDateArray(40, 0, 30000)
  })
  data.push({
    title: 'DailyNewCaseActual',
    data: getRandomDateArray(20, 0, 30000)
  })
  data.push({
    title: 'CumulCaseModel',
    data: getRandomDateArray(40, 0, 30000)
  })
  data.push({
    title: 'CumulCaseActual',
    data: getRandomDateArray(20, 0, 30000)
  })

  return data
}
