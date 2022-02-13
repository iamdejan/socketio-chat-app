terraform {
  backend "etcdv3" {
    endpoints = ["34.126.99.210:2379"]
    lock = true
    prefix = "/socketio-chat-app"
  }

  required_providers {
    local = {
      source = "hashicorp/local"
    }
  }
}

provider "google" {
  project = var.project_id
  region = var.region
}

module "gcp_network" {
  source = "terraform-google-modules/network/google"
  project_id = var.project_id
  network_name = var.network_name
  subnets = [
    {
      subnet_name = var.subnetwork_name
      subnet_ip = "10.10.0.0/16"
      subnet_region = var.region
    }
  ]
  secondary_ranges = {
    "${var.subnetwork_name}" = [
      {
        range_name = var.ip_range_pods_name
        ip_cidr_range = "10.20.0.0/16"
      },
      {
        range_name = var.ip_range_services_name
        ip_cidr_range = "10.30.0.0/16"
      }
    ]
  }
}

module "gke" {
  source = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  project_id = var.project_id
  name = var.project_id
  region = var.region
  network = module.gcp_network.network_name
  subnetwork = module.gcp_network.subnets_names[0]
  ip_range_pods = var.ip_range_pods_name
  ip_range_services = var.ip_range_services_name
  node_pools = [
    {
      name = "gke-node-pool"
      machine_type = var.machine_type
      node_locations = var.node_locations
      min_count = 1
      max_count = 1
      disk_size_gb = 10
    }
  ]
}
