import React from 'react'
import { TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column'
  },
});

function Survey() {
  const classes = useStyles()

  const [formValues, setFormValues] = React.useState({})

  const questions = {
    "email": "What is your email address?",
    "name": "What is your name?",
    "excelleeEmail": "Email address of the person who has excelled",
    "excelleeName": "Name of the person who has excelled",
    "excelleePosition": "What is their role / job title and where do they work?",
    "excellence": "Describe what was done that shows excellence",
    "learn": "What can the organisation learn from this example?",
    "values": "Which of the trust's values does this demonstrate?"
  }

  const handleInputChange = e => {
    setFormValues({...formValues, [e.target.name]: e.target.value})
  }

  const handleSubmit = e => {
    e.preventDefault()
    alert(JSON.stringify(formValues, 2, "\n"))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.section}>
        {Object.entries(questions).map(([key, question]) => (
          <TextField key={key} onChange={handleInputChange} name={key} label={question} value={formValues[key]} />
        ))}
      </div>
      <input type="submit" value="Submit" />
    </form>
  )
}

export default Survey
