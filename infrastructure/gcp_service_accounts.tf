# Bitbucket Pipelines Service Account
resource "google_service_account" "bitbucket_pipelines" {
  project      = google_project.project.project_id
  account_id   = "bitbucket-pipelines"
  display_name = "Bitbucket Pipelines Service Account"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "bitbucket_pipelines_compute_storageadmin" {
  project = google_project.project.project_id
  role    = "roles/compute.storageAdmin"
  member  = "serviceAccount:${google_service_account.bitbucket_pipelines.email}"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "bitbucket_pipelines_cloudbuilds_builds_editor" {
  project = google_project.project.project_id
  role    = "roles/cloudbuild.builds.editor"
  member  = "serviceAccount:${google_service_account.bitbucket_pipelines.email}"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "bitbucket_pipelines_cloudrun_admin" {
  project = google_project.project.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.bitbucket_pipelines.email}"
  depends_on   = [google_project_service.services]
}

# Needed to be able to push images to Container Registry, which internally use Cloud Storage.
resource "google_project_iam_member" "bitbucket_pipelines_storage_admin" {
  project = google_project.project.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.bitbucket_pipelines.email}"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "bitbucket_pipelines_service_account_user" {
  project = google_project.project.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.bitbucket_pipelines.email}"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "bitbucket_pipelines_viewer" {
  project = google_project.project.project_id
  role    = "roles/viewer"
  member  = "serviceAccount:${google_service_account.bitbucket_pipelines.email}"
  depends_on   = [google_project_service.services]
}

resource "google_service_account_key" "bitbucket_pipelines" {
  service_account_id = google_service_account.bitbucket_pipelines.name
}

# Strapi Uploader
resource "google_service_account" "strapi_uploader" {
  project      = google_project.project.project_id
  account_id   = "strapi-uploader"
  display_name = "Strapi Uploader"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "strapi_uploader_storage_admin" {
  project = google_project.project.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.strapi_uploader.email}"
  depends_on   = [google_project_service.services]
}

resource "google_project_iam_member" "strapi_uploader_storage_objectadmin" {
  project = google_project.project.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.strapi_uploader.email}"
  depends_on   = [google_project_service.services]
}

resource "google_service_account_key" "strapi_uploader" {
  service_account_id = google_service_account.strapi_uploader.name
}

output "strapi_uploader_service_account_key_json" {
  value = base64decode(google_service_account_key.strapi_uploader.private_key)
  sensitive = true
}
