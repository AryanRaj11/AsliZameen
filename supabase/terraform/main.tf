terraform {
  required_version = ">= 1.5.0"

  required_providers {
    # Replace the source/version if you are using a specific provider from the registry.
    # If you already know the exact provider (e.g., registry.terraform.io/supabase/supabase),
    # please replace "supabase/supabase" and version accordingly.
    supabase = {
      source  = "supabase/supabase"
      version = ">= 0.1.0"
    }
  }
}

provider "supabase" {
  # This variable will be populated from the GH Actions env TF_VAR_service_role_key
  access_token = var.service_role_key
}

variable "service_role_key" {
  type      = string
  sensitive = true
}

variable "project_ref" {
  type    = string
  default = "udypjslvtmthdeodzpev"
}

resource "supabase_storage_bucket" "properties_images" {
  project_ref        = var.project_ref
  name               = "properties_images"
  public             = true
  file_size_limit    = 5242880
  allowed_mime_types = ["image/jpeg", "image/png", "image/jpg"]
}