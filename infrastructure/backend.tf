terraform {
  backend "gcs" {
    bucket = "jvt-terraform-admin"
    prefix = "terraform/state/${terraform.workspace}/${var.terraform_state_id}"
  }
}
