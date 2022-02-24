# Socket.io Chat App with Next.js

A simple chat app built with Next.js (for client) and Socket.io (for server).

## Prerequisites
- Application
    - Node.js
    - NPM
    - Yarn
    - Install dependencies (for `client` and `server`) by using `yarn install`
- Infrastructure
    - Terraform CLI
    - `kubectl` (Kubernetes control CLI)

## How to

### Run application locally

#### Client
1) Run `yarn start`

#### Server
1) Run `yarn dev`

### Build Docker images
Go to `client` and/or `server` folder, then run `docker build -t [image tag] .`

### Use Terraform
1) Go to `terraform-k8s` folder.
2) Run `terraform init`.
3) Run `terraform plan` to show Terraform plans.

### Use Kubernetes
1) Install `kubectl`.
2) Go to `terraform-k8s` folder.
3) Run `kubectl apply $(ls *.yaml | awk ' { print " -f " $1 } ')`.

## Resources

- [Kubernetes Cluster for Node API with Socket.io and automatic SSL](https://asserted.io/posts/kubernetes-cluster-nodejs-api-with-socket-io-and-ssl)
- [Advanced Scheduling and Pod Affinity and Anti-affinity](https://docs.openshift.com/container-platform/3.11/admin_guide/scheduling/pod_affinity.html#admin-guide-sched-affinity-config-pod-pref)
