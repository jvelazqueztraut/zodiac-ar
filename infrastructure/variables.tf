variable "terraform_state_id" {
  type = string
  description = "Globally unique identifier of Terraform State"
  default = "1"
}

variable "gcp_org_id" {
  type = string
  description = "Google Cloud Organization ID for the project to be created within"
  default = "463966896870"
}

variable "gcp_billing_account" {
  type = string
  description = "Google Cloud Billing Account ID to be associated with the created project"
  default = "01A22A-CE875D-1FCB1E"
}

variable "gcp_project_name" {
  type = string
  description = "Name of the Google Cloud Platform Project to be created."
  validation {
    condition     = length(var.gcp_project_name) > 0 && length(var.gcp_project_name) < 26
    error_message = "Project name needs to be max. 25 characters long. There is a 5-character suffix being added automatically and GCP project names need to be at max. 30 chars long."
  }
}

variable "gcp_region" {
  type = string
  description = "Google Cloud Region that the project should be created within"
  default = "europe-west1"
}

variable "gcp_gcs_location" {
  type = string
  description = "Google Cloud Storage location that should be used (e.g. for Strapi uploads)"
  default = "eu"
}

variable "gcp_gcr_location" {
  type = string
  description = "Google Container Registry location that should be used for Docker images"
  default = "eu"
}

variable "bitbucket_repository_owner" {
  type = string
  description = "Account ID of the Bitbucket repository owner (the organization.)"
  default = "jvt"
}

variable "bitbucket_repository_slug" {
  type = string
  description = "Slug of the repository within the organization"
}

variable "bitbucket_username" {
  type = string
  description = "Username of the Bitbucket app"
}

variable "bitbucket_password" {
  type = string
  description = "Password of the Bitbucket app"
}

variable "sentry_organization" {
  type = string
  description = "Sentry organisation"
  default = "jvt"
}

variable "sentry_token" {
  type = string
  description = "Auth token for the sentry organisation"
}

variable "environments" {
  description = "Environments configuration"
  default = {
    "development" = {
      "name" = "development",
      "basic_auth_username" = "jvt",
    },
    "test" = {
      "name" = "test",
      "basic_auth_username" = "jvt",
    },
    "staging" = {
      "name" = "staging",
      "basic_auth_username" = "jvt",
    },
    "production" = {
      "name" = "production",
      "basic_auth_username" = "jvt",
    }
  }
}

variable "pipelines_ip_addresses" {
  type = list(string)
  description = "Bitbucket Pipelines IP addresses for remote connections to SQL instances upon deployment"
  default = [
    "34.199.54.113/32",
    "34.232.25.90/32",
    "34.232.119.183/32",
    "34.236.25.177/32",
    "35.171.175.212/32",
    "52.54.90.98/32",
    "52.202.195.162/32",
    "52.203.14.55/32",
    "52.204.96.37/32",
    "34.218.156.209/32",
    "34.218.168.212/32",
    "52.41.219.63/32",
    "35.155.178.254/32",
    "35.160.177.10/32",
    "34.216.18.129/32"
  ]
}

variable "gcp_sql_username" {
  type = string
  description = "Google Cloud SQL username"
  default = "root"
}

variable "gcp_sql_instance_name" {
  type = string
  description = "Google Cloud SQL instance name"
  default = "cms"
}

variable "gcp_sql_instance_tier" {
  type = string
  description = "Google Cloud SQL instance tier"
  default = "db-f1-micro"
}

variable "gcp_sql_instance_backup_enabled" {
  type = bool
  description = "Google Cloud SQL instance backup enabled"
  default = true
}

variable "gcp_sql_instance_availability_type" {
  type = string
  description = "Google Cloud SQL instance availability type"
  default = "ZONAL"
}

variable "google_project_services" {
  type = list(string)
  description = "Google Project Services to be enabled"
  default = [
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "stackdriver.googleapis.com",
    "clouderrorreporting.googleapis.com"
  ]
}
