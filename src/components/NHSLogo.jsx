import React from 'react'

import { makeStyles } from '@material-ui/core/styles'

import useWindowSize from '../hooks/windowSize'

import NHS from '../images/NHS.jpg'

const useStyles = makeStyles({
  subtext: {
    fontFamily: "Frutiger, Arial",
    color: 'white',
    fontWeight: 700,
    fontSize: 'max(1.5vw, 20px)',
    textAlign: 'center'
  },
  container: {
    backgroundColor: 'rgb(0, 94, 184)',
    position: "absolute",
    left: 0,
    top: 0,
    padding: 'max(1.5vw, 20px)',
    paddingBottom: 0,
  },
  nhs: {
    width: "max(10vw, 130px)"
  }
})

function NHSLogo() {

    const classes = useStyles()

    const windowSize = useWindowSize()

    // Do not display logo if we are on a small screen, need all the space for the survey
    if (windowSize.width < 500 || windowSize.height < 800) {
      return null
    }

    return (
        <div className={classes.container}>
            <img src={NHS} alt="NHS" className={classes.nhs}/>
            <p className={classes.subtext}>Imperial LFE</p>
        </div>
    )
}

export default NHSLogo
