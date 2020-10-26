const uuid = require('uuid')
const AWS = require('aws-sdk')

AWS.config.setPromisesDependency(require('bluebird'))

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body)

  try {
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
