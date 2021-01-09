import React, {useEffect, useState} from 'react'
import { 
  Button, 
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  TextField, 
  Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { fetchUrl } from '../utils/fetch-utils'

import NHSLogo from './NHSLogo' 

import background from '../images/background.jpg'

import EditIcon from '@material-ui/icons/Edit'

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    padding: 'max(2vw, 20px)',
    maxWidth: '70vw',
  },
  survey: {
    display: 'flex',
    backgroundColor: 'lightblue',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100vw',
    minHeight: '100vh',
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  introTextContainer: {
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  introText: {
    padding: 'max(0.75vw, 15px)',
    fontSize: "max(1vw, 15px)",
    textAlign: 'center',
  },
  questionContainer: {
    width: '50vw',
    minWidth: '200px',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
  },
  questionField: {
    width: '100%',
  },
  responsiveMarginTop: {
    marginTop: 'max(2vh, 20px)',
  },
  responsiveMarginBottom: {
    marginBottom: 'max(2vh, 20px)',
  },
  questionReview: {
    marginBottom: 'max(1vh, 10px)',
    padding: 'max(1vh, 10px)',
    borderRadius: 'max(1vh, 10px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      background: '#dbefff',

      "& $questionReviewEditIcon": {
        color: "#1976d2"
      }
    },
  },
  questionReviewQuestion: {
    paddingRight: 'max(1vh, 10px)',
  },
  questionReviewEditIcon: {
  },
  questionsReviewContainer: {
    maxHeight: '70vh',
    overflowY: 'auto',
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
    marginBottom: 'max(3vh, 20px)',
    fontSize: "max(1vw, 15px)",
  },
  submittingText: {
    paddingTop: 'max(2vh, 20px)',
  },
  responsiveFontSize: {
    fontSize: "max(1vw, 15px)",
  }
});

function Survey() {
  const classes = useStyles()


  const questions = [{
      key: "email",
      question: "What is your email address?",
      type: "email",
      validation: "email",
      localStorage: 'email'
    }, {
      key: "name",
      question: "What is your name?",
      type: "string",
      localStorage: 'name'
    }, {
      key: "excelleeEmail",
      question: "Email address of the person who has excelled",
      type: "email",
      validation: "email"
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
  const [formError, setFormError] = useState(false)
  const [formFieldSubmitted, setFormFieldSubmitted] = useState(false)
  const [step, setStep] = useState(-1)
  const [inReview, setInReview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [submissionError, setSubmissionError] = useState(null)

  const validateEmailAddress = (email) => {
    // Adding gmail for testing purposes
    const validDomains = ['@nhs.net', '@gmail.com']
    for (let domain of validDomains) {
      if (email.endsWith(domain)) {
        return true
      }
    }
    return false
  }

  useEffect(
    () => {
      document.addEventListener('keyup', handleKeyUp);
      
      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      }
    }
  )

  useEffect(
    () => {
       // Load previous saved responses unless the field has already been populated
      if(step >= 0 && questions[step] && questions[step].localStorage && !formValues[questions[step].key]) {
        const prevSavedVal = localStorage.getItem(questions[step].localStorage) || ''
        setFormValues({...formValues, [questions[step].key]: prevSavedVal})
      }
    }, [step]
  )

  // Validation when we change values or step
  useEffect(
    () => {
      if (questions[step] && questions[step].validation === 'email') {
        if (validateEmailAddress(formValues[questions[step].key])) {
          setFormError(false)
        } else {
          setFormError('Email address must end in @nhs.net')
        }
      }
    }, [formValues, step]
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

    setIsSubmitting(true)

    try {

      const ERROR_CODES = [
        "Failed to report and save your feedback. Please retry",
        `We saved your feedback, but failed to send a congratulations to ${formValues.excelleeName} or send you a confirmation email`,
        `We saved your feedback and sent an email to ${formValues.excelleeName}, but didn't send you a confirmation email`
      ]
      const res = await fetchUrl('https://iench1ourg.execute-api.eu-west-2.amazonaws.com/prod/form', {
        method: 'POST',
        body: JSON.stringify({...formValues, progress}),
        headers: {
            'Content-Type': 'application/json'
        }
      })

      // Lambda can only return error if we respond with 200
      if (res.err) {
        setProgress(res.progress)

        const submissionError = ERROR_CODES[res.progress]
        setSubmissionError(submissionError)
        throw new Error(submissionError)
      }
      
      setSubmissionError(null)
      handleStepChange(1)()
    } catch (err) {
      setSubmissionError(err.message || "Something went wrong!")
    } finally {
      setIsSubmitting(false)
    }

  }

  const handleStepChange = (increment) => () => {
    // Only display errors after the user has had a crack at submitting

    if ((increment > 0 || inReview) && formError) {
      setFormFieldSubmitted(true)
      return
    }

    // Save tbe users response i.e email and name when they submit those answers
    if(step >= 0 && questions[step] && questions[step].localStorage) {
      localStorage.setItem(questions[step].localStorage, formValues[questions[step].key])
    }

    setFormError(false)
    setFormFieldSubmitted(false)

    if (inReview) {
      setStep(questions.length)
    } else {
      setStep(step + increment)
    }
  }

  const handleRestart = () => {
    setStep(-1)
    setFormValues({})
  }

  const editQuestion = (index) => {
    setInReview(true)
    setStep(index)
  }

  const renderQuestion = () => {
    const {key, question, type, multiline, options} = questions[step]

    const isValid = (type !== 'checkbox' && formValues[key]) || (type === 'checkbox' && formValues[key] && formValues[key].length > 0)

    return (
      <Paper classes={{root: classes.section}}>
        <div className={classes.questionContainer}>
          {!inReview && (
            <div className={classes.backBtnContainer}>
              <Typography variant='body2' classes={{root: classes.backBtn}} onClick={handleStepChange(-1)}>{'< Back'}</Typography>
            </div>
          )}
          {(type === 'email' || type === 'string') && (
            <FormControl>
              <Typography classes={{root: classes.responsiveFontSize}}>{question}</Typography>
              <TextField classes={{root: classes.questionField}} multiline={multiline} autoComplete='off' autoFocus key={key} onChange={handleInputChange} 
                name={key} value={formValues[key]} rows={8} rowsMax={15} InputProps={{className: classes.responsiveFontSize}}
                helperText={formFieldSubmitted && formError} error={formFieldSubmitted && formError} />
            </FormControl>
          )}
          {type === 'checkbox' && (
            <FormControl>
              <FormLabel classes={{root: classes.responsiveFontSize}} component="legend">{question}</FormLabel>
              <FormGroup>
                {options.map(option => (
                  <FormControlLabel
                    key={option.key}
                    control={<Checkbox checked={formValues[key] && formValues[key].includes(option.key)} onChange={handleCheckboxChange(key)} name={option.key} color='primary'/>}
                    label={option.displayName}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}
          <Button classes={{root: classes.responsiveMarginTop, label: classes.responsiveFontSize}} color='primary' variant='contained' disabled={!isValid} onClick={handleStepChange(1)}>{inReview ? 'Finish' : 'Next'} {inReview ? `\u2713` : `\u2B95`}</Button>
          {multiline && isValid && <Typography variant="body2">or press Shift + Enter {`\u21E7+\u21B5`}</Typography>}
          {!multiline && isValid && <Typography>or press Enter {`\u21B5`}</Typography>}
        </div>
      </Paper>
    )
  }

  const handleKeyUp = (event) => {
    if (event.which === 13 && questions[step] && (step === - 1 || !questions[step].multiline || event.shiftKey) ) {
      if (step === -1 || formValues[questions[step].key]) {
        handleStepChange(1)()
      }
    }
  }

  // const testVals = { "email": "andy@nhs.net", "name": "Andy", "excelleeEmail": "Jack@nhs.net", "excelleeName": "Jack", "excelleePosition": "Developer", "excellence": "Developing", "whatCanWeLearn": "Loads\n", "valuesDemonstrated": [ "kind", "expert" ] }

  return (
    <div className={classes.survey}>
      <NHSLogo />
      {step === -1 && (
        <Paper classes={{root: classes.section}}>
          <div className={classes.introTextContainer}>
            <Typography classes={{root: classes.introText}}>Hello from the Imperial Learning from Excellence Team, and thank you for appreciating the work of a colleague today.</Typography>
            <Typography classes={{root: classes.introText}}>We will write to the person you are reporting to let them know. Evidence shows that both being appreciated, and also appreciating someone else makes people feel happy - and that makes this time well spent.</Typography>
            <Typography classes={{root: classes.introText}}>We also want to investigate good work. We want to understand the causes, learn and build on these good practices. You can tell us about anybody, from any team and any organisation.</Typography>
          </div>
          <Button classes={{root: classes.responsiveMarginTop, label: classes.responsiveFontSize}} color='primary' variant='contained' onClick={handleStepChange(1)}>Start</Button>
        </Paper>
      )}
      {step >= 0 && step < numQuestions && renderQuestion()}
      {step === numQuestions && (
        <Paper classes={{root: classes.section}}>
          {!isSubmitting && !submissionError && (
            <React.Fragment>
              <Typography variant='h3' className={classes.responsiveMarginBottom}>Review and submit</Typography>
              <div className={classes.questionsReviewContainer}>
                {questions.map((question, index) => (
                  <div className={classes.questionReview} onClick={() => editQuestion(index)}>
                    <div className={classes.questionReviewQuestion}>
                      <Typography variant='h6'>{question.question}</Typography>
                      <Typography variant='body1'>{Array.isArray(formValues[question.key]) ? formValues[question.key].join(', ') : formValues[question.key]}</Typography>
                    </div>
                    <EditIcon className={classes.questionReviewEditIcon} />
                  </div>
                ))}
              </div>
              <Button classes={{root: classes.responsiveMarginTop, label: classes.responsiveFontSize}} color='primary' variant='contained' onClick={handleSubmit}>Submit</Button>
            </React.Fragment>
          )}
          {!isSubmitting && submissionError && (
            <React.Fragment>
              <Typography variant='h3'>Error</Typography>
              <Typography variant='body1'>{submissionError}</Typography>
              <Button classes={{root: classes.responsiveMarginTop, label: classes.responsiveFontSize}} color='primary' variant='contained' onClick={handleSubmit}>Retry failed steps</Button>
            </React.Fragment>
          )}
          {isSubmitting && (
            <React.Fragment>
              <CircularProgress size={120} />
              <Typography variant='h3' className={classes.submittingText}>Submitting your responses, please wait</Typography>
            </React.Fragment>
          )}
        </Paper>
      )}
      {step === numQuestions + 1 && (
        <Paper classes={{root: classes.section}}>
          <Typography variant='h3'>Thank you your response has been submitted</Typography>
          <Button classes={{root: classes.responsiveMarginTop, label: classes.responsiveFontSize}} color='primary' variant='contained' onClick={handleRestart}>Restart</Button>
        </Paper>
      )}
    </div>
  )
}

export default Survey
