terraform {
  required_providers {
    archive = {
      source = "hashicorp/archive"
    }
    bitbucket = {
      source = "terraform-providers/bitbucket"
    }
    google = {
      source = "hashicorp/google"
    }
    random = {
      source = "hashicorp/random"
    }
    sentry = {
      source = "jianyuan/sentry"
    }
  }
  required_version = ">= 0.13"
}
