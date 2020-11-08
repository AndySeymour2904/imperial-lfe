import React, {useEffect, useState} from 'react'
import { 
  Button, 
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField, 
  Typography } from '@material-ui/core'
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


  const questions = [{
      key: "email",
      question: "What is your email address?",
      type: "email"
    }, {
      key: "name",
      question: "What is your name?",
      type: "string"
    }, {
      key: "excelleeEmail",
      question: "Email address of the person who has excelled",
      type: "email"
    }, {
      key: "excelleeName",
      question:  "Name of the person who has excelled",
      type: "string"
    }, {
      key: "excelleePosition",
      question: "What is their role / job title and where do they work?",
      type: "string"
    }, {
      key: "excellence",
      question: "Describe what was done that shows excellence",
      type: "string",
      multiline: true
    }, {
      key: "whatCanWeLearn",
      question: "What can the organisation learn from this example?",
      type: "string",
      multiline: true
    }, {
      key: "valuesDemonstrated",
      question: "Which of the trust's values does this demonstrate?",
      type: "checkbox",
      options: [{
        key: "kind",
        displayName: "Kind"
      }, {
        key: "collaborative",
        displayName: "Collaborative"
      }, {
        key: "expert",
        displayName: "Expert"
      }, {
        key: "aspirational",
        displayName: "Aspirational"
      }]
    }
  ]

  // Load default state for questions
  const [formValues, setFormValues] = useState(questions.reduce((acc, cur) => {acc[cur.key] = cur.options ? [] : ''; return acc}, {}))

  const [step, setStep] = useState(-1)

  useEffect(
    () => {
      document.addEventListener('keyup', handleKeyUp);
      
      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      }
    }
  )


  const numQuestions = Object.keys(questions).length

  const handleInputChange = e => {
    setFormValues({...formValues, [e.target.name]: e.target.value})
  }

  const handleCheckboxChange = key => e => {

    const checkboxGroupValues = [...formValues[key]]

    if (checkboxGroupValues.includes(e.target.name) !== e.target.checked) {

      if (e.target.checked) {
        checkboxGroupValues.push(e.target.name)
      } else {
        const removeIndex = checkboxGroupValues.indexOf(e.target.name)
        checkboxGroupValues.splice(removeIndex, 1)
      }

      setFormValues({...formValues, [key]: checkboxGroupValues})
    }

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
    const {key, question, type, multiline, options} = questions[step]

    return (
      <div className={classes.section}>
        <div className={classes.questionContainer}>
          <div className={classes.backBtnContainer}>
            <Typography variant='body2' classes={{root: classes.backBtn}} onClick={handleStepChange(-1)}>{'< Back'}</Typography>
          </div>
          {(type === 'email' || type === 'string') && (
            <TextField classes={{root: classes.questionField}} multiline={multiline} autoComplete='off' autoFocus key={key} onChange={handleInputChange} 
              name={key} label={question} value={formValues[key]} rows={8} rowsMax={15} />
          )}
          {type === 'checkbox' && (
            <FormControl>
              <FormLabel component="legend">{question}</FormLabel>
              <FormGroup>
                {options.map(option => (
                  <FormControlLabel
                    key={option.key}
                    control={<Checkbox checked={formValues[key] && formValues[key].includes(option.key)} onChange={handleCheckboxChange(key)} name={option.key} />}
                    label={option.displayName}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}
          <Button classes={{root: classes.nextBtn}} color='primary' variant='contained' disabled={!formValues[key]} onClick={handleStepChange(1)}>Next {`\u2B95`}</Button>
          {multiline && formValues[key] && <Typography variant="body2">or press Shift + Enter {`\u21E7+\u21B5`}</Typography>}
          {!multiline && formValues[key] && <Typography>or press Enter {`\u21B5`}</Typography>}
        </div>
      </div>
    )
  }

  const handleKeyUp = (event) => {
    if (event.keyCode === 13 && (step === - 1 || !questions[step].multiline || event.shiftKey) && step < numQuestions) {
      if (step === -1 || formValues[questions[step].key]) {
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
