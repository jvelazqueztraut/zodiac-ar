resource "random_password" "frontend_basic_auth_passwords" {
  for_each = var.environments
  length   = 8
  special  = false
  keepers = {
    ami_id = var.gcp_project_name
  }
}

resource "google_cloud_run_service" "development" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-development"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-development" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-development" {
  location    = google_cloud_run_service.development.location
  project     = google_cloud_run_service.development.project
  service     = google_cloud_run_service.development.name
  policy_data = data.google_iam_policy.noauth-development.policy_data
}

resource "google_cloud_run_service" "test" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-test"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "20"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-test" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-test" {
  location    = google_cloud_run_service.test.location
  project     = google_cloud_run_service.test.project
  service     = google_cloud_run_service.test.name
  policy_data = data.google_iam_policy.noauth-test.policy_data
}

resource "google_cloud_run_service" "staging" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-staging"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
        resources {
          limits = {
            cpu    = "1"
            memory = "1Gi"
          }
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "50"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-staging" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-staging" {
  location    = google_cloud_run_service.staging.location
  project     = google_cloud_run_service.staging.project
  service     = google_cloud_run_service.staging.name
  policy_data = data.google_iam_policy.noauth-staging.policy_data
}

resource "google_cloud_run_service" "production" {
  project  = google_project.project.project_id
  name     = "${google_project.project.project_id}-production"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "100"
      }
    }
  }

  autogenerate_revision_name = true
  depends_on                 = [google_project_service.services]
}

# Create public access
data "google_iam_policy" "noauth-production" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth-production" {
  location    = google_cloud_run_service.production.location
  project     = google_cloud_run_service.production.project
  service     = google_cloud_run_service.production.name
  policy_data = data.google_iam_policy.noauth-production.policy_data
}

output "basic_auth_credentials" {
  value = {
    for key, environment in var.environments :
    environment.name => tomap({
      username = environment.basic_auth_username,
      password = random_password.frontend_basic_auth_passwords[key].result
    })
  }
  sensitive = true
}
