#! /bin/bash

echo ""
echo "Building Front End..."

export NODE_ENV=production

npm run feed-env-vars

# temporary solution - sending GET request to Cloud Run CMS instance in order to force GC to create a new CMS instance
env_url=${ENV}_CMS_GRAPHQL_URL
curl "${!env_url}" > /dev/null

image="$GCP_GCR_LOCATION.gcr.io/$GCLOUD_PROJECT_ID/$ENV:frontend"

if docker pull "$image" > /dev/null; then
  docker build . --tag "$image" --cache-from "$image"
else
  docker build . --tag "$image"
fi

docker push "$image"

gcloud run deploy "$GCLOUD_PROJECT_ID-$ENV" \
  --image "$image" \
  --platform managed \
  --region "$GCP_REGION"
