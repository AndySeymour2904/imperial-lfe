# imperial-lfe
http://imperial-lfe.s3-website.eu-west-2.amazonaws.com/

## Development
`npm start`

## Deployment

Deployment requires AWS CLI to be configured, IAM user: imperial-lfe-cli

### Frontend
```
npm run build
npm run deploy
```

This uploads the build folder to S3 

### Backend
```
cd backend-service
sls deploy -v
```

This deploys the backend through API Gateway, DynamoDB, Lambdas and CloudFormation
