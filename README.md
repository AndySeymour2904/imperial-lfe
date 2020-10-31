# imperial-lfe
http://imperial-lfe.s3-website.eu-west-2.amazonaws.com/

## Development
`npm start`

## Deployment

Deployment requires AWS CLI to be configured, IAM user: imperial-lfe-cli

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```
https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html

### Frontend
```
npm run build
npm run deploy
```

This uploads the build folder to S3 

### Backend
Get serverless;
```
npm install -g serverless
```

Deploy:
```
cd backend-service
sls deploy -v
```

This deploys the backend through API Gateway, DynamoDB, Lambdas and CloudFormation
