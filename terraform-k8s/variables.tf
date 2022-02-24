variable "project_id" {
  description = "GCP Project ID in which infrastructure will be provisioned."
  default = "socket-io-chat-app-340411"
}

variable "network_name" {
  default = "socketio-chat-app-network"
}

variable "subnetwork_name" {
  default = "socketio-chat-app-subnetwork"
}

variable "region" {
  description = "Region in which cluster will be created."
  default = "us-west1"
}

variable "node_locations" {
  description = "Zone in which K8s nodes will be located. Must be within specified region."
  default = "us-west1-a,us-west1-b,us-west1-c"
}

variable "ip_range_pods_name" {
  default = "socketio-chat-app-ip-range-pods"
}

variable "ip_range_services_name" {
  default = "socketio-chat-app-ip-range-services"
}

variable "machine_type" {
  description = "Instance machine type."
  default = "n1-standard-1"
}
