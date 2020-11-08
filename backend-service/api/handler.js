const uuid = require('uuid')
const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(require('bluebird'))

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const SES = new AWS.SES({region: 'eu-west-2'})

const LFE_EMAIL = "imperial.learningfromexcellence@nhs.net"

module.exports.submit = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body)

  try {
    if (!validateEmailAddress(res.email) || !validateEmailAddress(res.excelleeEmail)) {
      console.log(`Refusing to process response, invalid email; ${event.body}`)
      throw new Error('Email address is not valid')
    }
    
    const sesExcelleeParams = {
      Template: "TestTemplate",
      Destination: {
        ToAddresses: [requestBody.excelleeEmail]
      },
      Source: LFE_EMAIL,
      TemplateData: JSON.stringify(requestBody)
    }

    const sesReporterParams = {
      Template: "TestTemplate",
      Destination: {
        ToAddresses: [requestBody.email]
      },
      Source: LFE_EMAIL,
      TemplateData: JSON.stringify(requestBody)
    }

    console.log(sesExcelleeParams)
    console.log(sesReporterParams)

    await SES.sendTemplatedEmail(sesParams).promise()
    
    const res = await submitFormAnswers(bodyToRecord(requestBody))
    
    console.log(`Successfully submitted form answers; ${event.body}`)

    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: `Successfully submitted form answers from ${requestBody.email}`,
      })
    })

  } catch (err) {

    console.log(err)

    callback(null, {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: `Unable to submit form answers from ${requestBody.email}`
      })
    })

  }
}

const validateEmailAddress = (email) => {
  // \todo - check with Mark about what a reasonable set of domains would be
  // Adding gamil for testing purposes
  validDomains = ['@nhs.net', '@gmail.com']
  for (var domain in validDomains) {
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
