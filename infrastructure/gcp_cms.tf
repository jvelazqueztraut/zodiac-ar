resource "random_password" "cms_sql_root_password" {
  length   = 16
  special  = true
  keepers = {
    ami_id = var.gcp_project_name
  }
}

resource "random_password" "cms_admin_passwords" {
  for_each = var.environments
  length   = 16
  special  = true
  keepers = {
    ami_id = var.gcp_project_name
  }
}

resource "random_password" "admin_jwt_secrets" {
  for_each = var.environments
  length = 64
  special = true
  keepers = {
    ami_id = var.gcp_project_name
  }
}

resource "google_sql_database_instance" "cms_database_instance" {
  project          = google_project.project.project_id
  name             = var.gcp_sql_instance_name
  database_version = "MYSQL_5_7"
  region           = var.gcp_region

  settings {
    tier              = var.gcp_sql_instance_tier
    availability_type = var.gcp_sql_instance_availability_type

    backup_configuration {
      enabled            = var.gcp_sql_instance_backup_enabled
      binary_log_enabled = var.gcp_sql_instance_backup_enabled
      start_time         = "00:00"
    }

    ip_configuration {
      dynamic "authorized_networks" {
        for_each = var.pipelines_ip_addresses
        iterator = pipelines_ip_addresses

        content {
          name  = "Bitbucket Pipelines IP ${pipelines_ip_addresses.key}"
          value = pipelines_ip_addresses.value
        }
      }
    }
  }
}

resource "google_sql_user" "user" {
  project  = google_project.project.project_id
  instance = google_sql_database_instance.cms_database_instance.name
  name     = var.gcp_sql_username
  password = random_password.cms_sql_root_password.result
  host     = "%"
}

resource "google_sql_database" "cms_database_development" {
  project  = google_project.project.project_id
  instance = google_sql_database_instance.cms_database_instance.name
  name     = var.environments["development"].name
}

resource "google_sql_database" "cms_database_test" {
  project  = google_project.project.project_id
  instance = google_sql_database_instance.cms_database_instance.name
  name     = var.environments["test"].name
}

resource "google_sql_database" "cms_database_staging" {
  project  = google_project.project.project_id
  instance = google_sql_database_instance.cms_database_instance.name
  name     = var.environments["staging"].name
}

resource "google_sql_database" "cms_database_production" {
  project  = google_project.project.project_id
  instance = google_sql_database_instance.cms_database_instance.name
  name     = var.environments["production"].name
}

resource "google_storage_bucket" "cms_uploads_gcs_bucket" {
  project       = google_project.project.project_id
  name          = "${google_project.project.project_id}-uploads"
  location      = var.gcp_gcs_location
  force_destroy = true
  storage_class = "STANDARD"
}

resource "google_cloud_run_service" "cms-development" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-cms-development"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "5"
        "run.googleapis.com/cloudsql-instances" = "${google_project.project.project_id}:${var.gcp_region}:${google_sql_database_instance.cms_database_instance.name}"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-cms-development" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-cms-development" {
  location    = google_cloud_run_service.cms-development.location
  project     = google_cloud_run_service.cms-development.project
  service     = google_cloud_run_service.cms-development.name
  policy_data = data.google_iam_policy.noauth-cms-development.policy_data
}

resource "google_cloud_run_service" "cms-test" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-cms-test"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "5"
        "run.googleapis.com/cloudsql-instances" = "${google_project.project.project_id}:${var.gcp_region}:${google_sql_database_instance.cms_database_instance.name}"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-cms-test" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-cms-test" {
  location    = google_cloud_run_service.cms-test.location
  project     = google_cloud_run_service.cms-test.project
  service     = google_cloud_run_service.cms-test.name
  policy_data = data.google_iam_policy.noauth-cms-test.policy_data
}

resource "google_cloud_run_service" "cms-staging" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-cms-staging"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "10"
        "run.googleapis.com/cloudsql-instances" = "${google_project.project.project_id}:${var.gcp_region}:${google_sql_database_instance.cms_database_instance.name}"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-cms-staging" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-cms-staging" {
  location    = google_cloud_run_service.cms-staging.location
  project     = google_cloud_run_service.cms-staging.project
  service     = google_cloud_run_service.cms-staging.name
  policy_data = data.google_iam_policy.noauth-cms-staging.policy_data
}

resource "google_cloud_run_service" "cms-production" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-cms-production"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "15"
        "run.googleapis.com/cloudsql-instances" = "${google_project.project.project_id}:${var.gcp_region}:${google_sql_database_instance.cms_database_instance.name}"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-cms-production" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-cms-production" {
  location    = google_cloud_run_service.cms-production.location
  project     = google_cloud_run_service.cms-production.project
  service     = google_cloud_run_service.cms-production.name
  policy_data = data.google_iam_policy.noauth-cms-production.policy_data
}

output "cms_credentials" {
  value = {
    for key, environment in var.environments:
    environment.name => tomap({
      username = "root"
      password = random_password.cms_admin_passwords[key].result
    })
  }
  sensitive = true
}

output "gcp_gcs_location" {
  value = google_storage_bucket.cms_uploads_gcs_bucket.location
}
