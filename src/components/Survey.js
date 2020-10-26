import React, {useEffect, useState} from 'react'
import { Button, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { fetchUrl } from '../utils/fetch-utils'

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  survey: {
    display: 'flex',
    minHeight: '100vh',
  },
  introText: {
    padding: '10px',
  },
  questionContainer: {
    width: '80vw',
    minWidth: '200px',
    maxWidth: '400px',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
  },
  questionField: {
    width: '100%',
  },
  nextBtn: {
    marginTop: '15px',
  },
  backBtnContainer: {
    width: '100%',
  },
  backBtn: {
    cursor: 'pointer',
    color: 'darkgrey',
    "&:hover": {
      color: 'grey',
    },
    marginBottom: '50px',
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
    "whatCanWeLearn": "What can the organisation learn from this example?",
    "valuesDemonstrated": "Which of the trust's values does this demonstrate?"
  }

  const numQuestions = Object.keys(questions).length
  const handleInputChange = e => {
    setFormValues({...formValues, [e.target.name]: e.target.value})
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      await fetchUrl('https://lj09fb8vbg.execute-api.eu-west-2.amazonaws.com/prod/form', {
        method: 'POST',
        body: JSON.stringify(formValues),
        headers: {
            'Content-Type': 'application/json'
        }
      })
      
      handleStepChange(1)()
    } catch (err) {
      alert(err)
    }

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
        <div className={classes.questionContainer}>
          <div className={classes.backBtnContainer}>
            <Typography variant='body2' classes={{root: classes.backBtn}} onClick={handleStepChange(-1)}>{'< Back'}</Typography>
          </div>
          <TextField classes={{root: classes.questionField}} utoComplete='off' autoFocus key={key} onChange={handleInputChange} name={key} label={question} value={formValues[key]} />
          <Button classes={{root: classes.nextBtn}} color='primary' variant='contained' disabled={!formValues[key]} onClick={handleStepChange(1)}>Next {`\u2B95`}</Button>
          {formValues[key] && <Typography>or press Enter {`\u21B5`}</Typography>}
        </div>
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
    <div className={classes.survey}>
      {step === -1 && (
        <div className={classes.section}>
          <Typography classes={{root: classes.introText}}>Hello from the Imperial Learning from Excellence Team, and thank you for appreciating the work of a colleague today.</Typography>
          <Typography classes={{root: classes.introText}}>We will write to the person you are reporting to let them know. Evidence shows that both being appreciated, and also appreciating someone else makes people feel happy - and that makes this time well spent.</Typography>
          <Typography classes={{root: classes.introText}}>We also want to investigate good work. We want to understand the causes, learn and build on these good practices. You can tell us about anybody, from any team and any organisation.</Typography>
          <Button color='primary' variant='contained' onClick={handleStepChange(1)}>Start</Button>
        </div>
      )}
      {step >= 0 && step < numQuestions && renderQuestion()}
      {step === numQuestions && (
        <div className={classes.section}>
          <Typography>Review and submit</Typography>
          <Typography variant='body1'>{JSON.stringify(formValues, 2, "\n")}</Typography>
          <Button color='primary' variant='contained' onClick={handleSubmit}>Submit</Button>
        </div>
      )}
      {step === numQuestions + 1 && (
        <div className={classes.section}>
          <Typography>Thank you your response has been submitted</Typography>
          <Button color='primary' variant='contained' onClick={handleRestart}>Restart</Button>
        </div>
      )}
    </div>
  )
}

export default Survey
