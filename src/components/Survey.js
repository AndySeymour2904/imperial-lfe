import React, {useEffect, useState} from 'react'
import { Button, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column'
  },
});

function Survey() {
  const classes = useStyles()

  const [formValues, setFormValues] = useState({})
  const [step, setStep] = useState(-1)

  useEffect(
    () => {
      document.addEventListener('keyup', handleKeyUp);
      
      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      }
    }
  )

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

  const numQuestions = Object.keys(questions).length
  const handleInputChange = e => {
    setFormValues({...formValues, [e.target.name]: e.target.value})
  }

  const handleSubmit = e => {
    e.preventDefault()
    alert(JSON.stringify(formValues, 2, "\n"))
  }

  const handleStepChange = (increment) => () => {
    setStep(step + increment)
  }

  const handleRestart = () => {
    setStep(-1)
    setFormValues({})
  }

  const renderQuestion = () => {
    const [key, question] = Object.entries(questions)[step]
    return (
      <div className={classes.section}>
        <TextField autoComplete='off' autoFocus key={key} onChange={handleInputChange} name={key} label={question} value={formValues[key]} />
        <Button color='primary' variant='contained' disabled={!formValues[key]} onClick={handleStepChange(1)}>Next {`\u2B95`}</Button>
        {formValues[key] && <Typography>or press Enter {`\u21B5`}</Typography>}
      </div>
    )
  }

  const handleKeyUp = (event) => {
    if (event.keyCode === 13 && step < numQuestions) {
      if (step === -1) {
        handleStepChange(1)()
      } else if (formValues[Object.keys(questions)[step]]) {
        handleStepChange(1)()
      }
    }
  }


  return (
    <div>
      <div>
        <Typography>Debug</Typography>
        <p>{'step: ' + step}</p>
        <p>{'formValues: ' + JSON.stringify(formValues)}</p>
      </div>
      {step === -1 && (
        <div>
          <Typography>Welcome to the survey</Typography>
          <Button color='primary' variant='contained' onClick={handleStepChange(1)}>Start</Button>
        </div>
      )}
      {step >= 0 && step < numQuestions && renderQuestion()}
      {step === numQuestions && (
        <div>
          <Typography>Review and submit</Typography>
          <Typography variant='body1'>{JSON.stringify(formValues, 2, "\n")}</Typography>
          <Button color='primary' variant='contained' onClick={handleStepChange(1)}>Submit</Button>
        </div>
      )}
      {step === numQuestions + 1 && (
        <div>
          <Typography>Thank you your response has been submitted</Typography>
          <Button color='primary' variant='contained' onClick={handleRestart}>Restart</Button>
        </div>
      )}
    </div>
  )
}

export default Survey
