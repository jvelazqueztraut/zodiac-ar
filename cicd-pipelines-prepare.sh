#! /bin/bash

# Activate Google Serice Account responsible for deployments
echo "$GCLOUD_SERVICE_ACCOUNT_KEY" > .service-account-key.json
gcloud auth activate-service-account --key-file .service-account-key.json

gcloud config set project "$GCLOUD_PROJECT_ID"

# Authorize docker in case we build docker images and push them to Container Registry
gcloud auth configure-docker --quiet
