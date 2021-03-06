const uuid = require('uuid')
const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(require('bluebird'))

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const SES = new AWS.SES({region: 'eu-west-2'})

const LFE_EMAIL = "imperial.learningfromexcellence@nhs.net"

const LFE_URL = "http://imperial-lfe.s3-website.eu-west-2.amazonaws.com/"

module.exports.submit = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body)

  console.log(requestBody)

  // Allow retrying at specific points
  let progress = requestBody.progress || 0

  try {
    
    if (!validateEmailAddress(requestBody.email) || !validateEmailAddress(requestBody.excelleeEmail)) {
      console.log(`Refusing to process response, invalid email; ${event.body}`)
      throw new Error('Email address is not valid')
    }

    let templateData = JSON.stringify({
      name: requestBody.name,
      excelleeName: requestBody.excelleeName,
      excelleeEmail: requestBody.excelleeEmail,
      excellence: requestBody.excellence,
      url: LFE_URL,
      date: new Date().toDateString()
    })

    console.log("Template data: ")
    console.log(templateData)
    
    const sesExcelleeParams = {
      Template: "TestTemplate",
      Destination: {
        ToAddresses: [requestBody.excelleeEmail]
      },
      Source: LFE_EMAIL,
      TemplateData: templateData
    }

    const sesReporterParams = {
      Source: LFE_EMAIL,
      Template: "TestTemplateReporter",
      Destination: {
        ToAddresses: [requestBody.email]
      },
      TemplateData: templateData
    }

    console.log(sesExcelleeParams)
    console.log(sesReporterParams)

    if (progress === 0) {
      await submitFormAnswers(bodyToRecord(requestBody))
      progress += 1
    }
    
    if (progress === 1) {
      await SES.sendTemplatedEmail(sesExcelleeParams).promise()
      progress += 1
    }

    if (progress === 2) {
      await SES.sendTemplatedEmail(sesReporterParams).promise() 
      progress += 1
    }

    console.log(`Successfully submitted form answers; ${event.body}`)
    
    callback(null, {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    })

  } catch (err) {

    console.log("ERROR:")
    console.log(err)

    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        err,
        progress
      })
    })

  }
}

const validateEmailAddress = (email) => {
  // Adding gmail for testing purposes
  const validDomains = ['@nhs.net', '@gmail.com']
  for (let domain of validDomains) {
    if (email.endsWith(domain)) {
      return true
    }
  }
  return false;
}

const submitFormAnswers = async formAnswers => {
  console.log("Submitting form answers")
  const dynamoDBPutInfo = {
    TableName: process.env.SUBMISSIONS_TABLE,
    Item: formAnswers,
  }
  
  return await dynamoDb.put(dynamoDBPutInfo).promise()
}

const bodyToRecord = (body) => {
  const isoDate = new Date().toISOString()
  return {
    id: uuid.v4(),
    ...body,
    submittedAt: isoDate
  }
}
