# ticketing
An E-Commerce app using Microservices built with Node, React, Docker and Kubernetes.

## Features

* Utilizes a Microservices Architecture
* Server-Side Rendering with Next.js
* Authentication using JWT
* Payment Integration with Stripe
* Email Communication through SendGrid
* Secure with Let's Encrypt Certificate
* CI/CD workflow

## Getting Started

1. Ensure that all the secrets have been created.
2. Install [ingress-nginx](https://github.com/kubernetes/ingress-nginx)
3. Run the application
```
skaffold dev
```

## Secrets

JWT_KEY
```
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<YOUR_JWT_KEY>
```
STRIPE_KEY
```
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<YOUR_STRIPE_KEY>
```
SENDGRID_KEY
```
kubectl create secret generic sendgrid-secret --from-literal=SENDGRID_KEY=<YOUR_SENDGRID_KEY>
```
