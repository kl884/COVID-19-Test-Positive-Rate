import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

export default function ComboBox (props) {
  return (
    <Autocomplete
      id='combo-box-demo'
      className='combo-box-demo'
      options={states}
      getOptionLabel={(option) => option.title}
      style={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label='States' variant='outlined' />}
      onChange={props.onHandleChange}
      defaultValue={{ title: 'New York, NY', input: 'NY' }}
    />
  )
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const states = [
  { title: 'New York, NY', input: 'NY' },
  { title: 'Washington, WA', input: 'WA' },
  { title: 'Illinoi, IL', input: 'IL' }
]
