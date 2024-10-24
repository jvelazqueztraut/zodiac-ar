provider "sentry" {
  token = var.sentry_token
}

resource "sentry_team" "team" {
  organization = var.sentry_organization
  name = var.bitbucket_repository_slug
}

resource "sentry_project" "frontend-project" {
  organization = var.sentry_organization
  teams        = [sentry_team.team.id]
  name         = "${var.bitbucket_repository_slug}-frontend"
  platform     = "javascript"
}

resource "sentry_key" "frontend-key" {
  organization = var.sentry_organization
  project      = sentry_project.frontend-project.id
  name         = "${var.bitbucket_repository_slug}-frontend-key"
}

output "sentry_frontend_dsn" {
  value = sentry_key.frontend-key.dsn_public
}

output "sentry_frontend_dsn_csp" {
  value = sentry_key.frontend-key.dsn_csp
}
