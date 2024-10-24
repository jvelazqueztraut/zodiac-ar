provider "bitbucket" {
}

resource "bitbucket_repository_variable" "gcloud_project_id" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "GCLOUD_PROJECT_ID"
  value      = google_project.project.project_id
  secured    = false
}

resource "bitbucket_repository_variable" "gcloud_service_account_key" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "GCLOUD_SERVICE_ACCOUNT_KEY"
  value      = base64decode(google_service_account_key.bitbucket_pipelines.private_key)
  secured    = true
}

resource "bitbucket_repository_variable" "strapi_uploader_service_account_key" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "STRAPI_UPLOADER_SERVICE_ACCOUNT_KEY"
  value      = base64decode(google_service_account_key.strapi_uploader.private_key)
  secured    = true
}

resource "bitbucket_repository_variable" "gcp_region" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "GCP_REGION"
  value      = var.gcp_region
  secured    = false
}

resource "bitbucket_repository_variable" "gcp_gcr_location" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "GCP_GCR_LOCATION"
  value      = var.gcp_gcr_location
  secured    = false
}

resource "bitbucket_repository_variable" "db_instance_name" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "DB_INSTANCE_NAME"
  value      = google_sql_database_instance.cms_database_instance.connection_name
  secured    = false
}

resource "bitbucket_repository_variable" "db_name_development" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${var.environments["development"].name}_DB_NAME"
  value      = google_sql_database.cms_database_development.name
  secured    = false
}

resource "bitbucket_repository_variable" "db_name_test" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${var.environments["test"].name}_DB_NAME"
  value      = google_sql_database.cms_database_test.name
  secured    = false
}

resource "bitbucket_repository_variable" "db_name_staging" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${var.environments["staging"].name}_DB_NAME"
  value      = google_sql_database.cms_database_staging.name
  secured    = false
}

resource "bitbucket_repository_variable" "db_name_production" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${var.environments["production"].name}_DB_NAME"
  value      = google_sql_database.cms_database_production.name
  secured    = false
}

resource "bitbucket_repository_variable" "db_username" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "DB_USERNAME"
  value      = google_sql_user.user.name
  secured    = false
}

resource "bitbucket_repository_variable" "db_password" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "DB_PASSWORD"
  value      = google_sql_user.user.password
  secured    = true
}

resource "bitbucket_repository_variable" "db_socket_path" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "DB_SOCKET_PATH"
  value      = "/cloudsql/${google_sql_database_instance.cms_database_instance.connection_name}"
  secured    = false
}

resource "bitbucket_repository_variable" "db_host" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "DB_HOST"
  value      = google_sql_database_instance.cms_database_instance.ip_address.0.ip_address
  secured    = false
}

resource "bitbucket_repository_variable" "cms_graphql_url_development" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "development_CMS_GRAPHQL_URL"
  value      = "${google_cloud_run_service.cms-development.status[0].url}/graphql"
  secured    = false
}

resource "bitbucket_repository_variable" "cms_graphql_url_test" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "test_CMS_GRAPHQL_URL"
  value      = "${google_cloud_run_service.cms-test.status[0].url}/graphql"
  secured    = false
}

resource "bitbucket_repository_variable" "cms_graphql_url_staging" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "staging_CMS_GRAPHQL_URL"
  value      = "${google_cloud_run_service.cms-staging.status[0].url}/graphql"
  secured    = false
}

resource "bitbucket_repository_variable" "cms_graphql_url_production" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "production_CMS_GRAPHQL_URL"
  value      = "${google_cloud_run_service.cms-production.status[0].url}/graphql"
  secured    = false
}

resource "bitbucket_repository_variable" "cms_admin_password" {
  for_each   = var.environments
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${each.value.name}_CMS_ADMIN_PASSWORD"
  value      = random_password.cms_admin_passwords[each.key].result
  secured    = true
}

resource "bitbucket_repository_variable" "admin_jwt_secret" {
  for_each   = var.environments
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${each.value.name}_ADMIN_JWT_SECRET"
  value      = base64encode(random_password.admin_jwt_secrets[each.key].result)
  secured    = true
}

resource "bitbucket_repository_variable" "basic_auth_username" {
  for_each   = var.environments
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${each.value.name}_BASIC_AUTH_USERNAME"
  value      = each.value.basic_auth_username
  secured    = false
}

resource "bitbucket_repository_variable" "basic_auth_password" {
  for_each   = var.environments
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "${each.value.name}_BASIC_AUTH_PASSWORD"
  value      = random_password.frontend_basic_auth_passwords[each.key].result
  secured    = true
}

resource "bitbucket_repository_variable" "bitbucket_repository_owner" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "BITBUCKET_REPOSITORY_OWNER"
  value      = var.bitbucket_repository_owner
  secured    = false
}

resource "bitbucket_repository_variable" "bitbucket_repository_slug" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "BITBUCKET_REPOSITORY_SLUG"
  value      = var.bitbucket_repository_slug
  secured    = false
}

resource "bitbucket_repository_variable" "bitbucket_username" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "BITBUCKET_USERNAME"
  value      = var.bitbucket_username
  secured    = false
}

resource "bitbucket_repository_variable" "bitbucket_password" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "BITBUCKET_PASSWORD"
  value      = var.bitbucket_password
  secured    = true
}

resource "bitbucket_repository_variable" "sentry_dsn" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "SENTRY_DSN"
  value      = sentry_key.frontend-key.dsn_public
  secured    = false
}

resource "bitbucket_repository_variable" "sentry_dsn_csp" {
  repository = "${var.bitbucket_repository_owner}/${var.bitbucket_repository_slug}"
  key        = "SENTRY_DSN_CSP"
  value      = sentry_key.frontend-key.dsn_csp
  secured    = false
}
