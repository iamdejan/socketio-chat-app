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
  default = "asia-southeast1"
}

variable "node_locations" {
  default = "asia-southeast1-a,asia-southeast1-b,asia-southeast1-c"
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
