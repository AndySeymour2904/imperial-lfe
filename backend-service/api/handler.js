const uuid = require('uuid')
const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(require('bluebird'))

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const SES = new AWS.SES({region: 'eu-west-2'});

module.exports.submit = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body)

  try {
    const res = await submitFormAnswers(bodyToRecord(requestBody))
    if (!validateEmailAddress(res.email)) {
      console.log(`Refusing to process response; ${event.body}`)
      return
    } else {
      console.log(`Successfully submitted form answers; ${event.body}`)
    }

    const sesParams = {
      Template: "TestTemplate",
      Destination: {
          ToAddresses: [requestBody.excelleeEmail]
      },
      Source: requestBody.email,
      TemplateData: JSON.stringify(requestBody)
    }

    console.log(sesParams)

    await SES.sendTemplatedEmail(sesParams).promise()

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
  valideDomains = ['@nhs.net']
  for (var domain in valideDomains) {
    if (email.includes(domain)) {
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
