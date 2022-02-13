output "cluster_name" {
  description = "Cluster name"
  value = module.gke.name
}

resource "null_resource" "kubeconfig" {
  provisioner "local-exec" {
    command = "KUBECONFIG=./kube-config gcloud container clusters get-credentials ${module.gke.name} --region ${var.region}"
  }
}
