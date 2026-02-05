# Cloud-Native Intelligent Document Analysis System/App

## 📌 Project Overview
A microservices-based application for secure, asynchronous document processing and analysis. The system utilizes an Event-Driven Architecture to decouple file upload from AI processing, ensuring scalability and responsiveness.

**Student:** [Thanos Smponias]
**Course:** Cloud Platforms
**Student ID:** [25115]

## 🏗️ Architecture
The system consists of the following microservices orchestrated via Docker Compose:

1.  **Frontend (Next.js):** User interface for file uploads and progress tracking.
2.  **Identity Provider (Keycloak):** Secure authentication (OIDC).
3.  **Object Storage (MinIO):** S3-compatible storage with event notifications.
4.  **Message Broker (RabbitMQ):** Handles asynchronous task queues.
5.  **Orchestrator (Node-RED):** Manages the workflow logic and AI integration.
6.  **IoT Dashboard (ThingsBoard):** Visualizes system throughput and telemetry.
7.  **Reverse Proxy (Nginx):** Handles SSL termination and routing.
8.  **Database (Postgres):** Stores system data.
9.  **pgAdmin:** Database management interface.

## 🌐 Live Demo Access (Cloud Deployment)

The application is currently deployed live and can be tested at the following URLs.

| Service | URL | Username | Password |
| :--- | :--- | :--- | :--- |
| **Main App** | [https://cloudplatforms.space](https://cloudplatforms.space) | `user` | `password` |
| **ThingsBoard** | [https://iot.cloudplatforms.space](https://iot.cloudplatforms.space) | `tenant@thingsboard.org` | `tenant` |
| **Node-RED** | [https://nodered.cloudplatforms.space](https://nodered.cloudplatforms.space) | *(No Auth)* | - |
| **MinIO Console** | [https://minio.cloudplatforms.space](https://minio.cloudplatforms.space) | `minioadmin` | `minioadmin` |
| **RabbitMQ** | [https://rabbitmq.cloudplatforms.space](https://rabbitmq.cloudplatforms.space) | `user` | `password` |
| **Keycloak** | [https://auth.cloudplatforms.space](https://auth.cloudplatforms.space) | `admin` | `admin` |
| **pgAdmin** | [https://pgadmin.cloudplatforms.space](https://pgadmin.cloudplatforms.space) | `admin@admin.com` | `admin` |
> **Note:** These credentials are for the live evaluation environment.

## 🚀 Deployment Instructions

* **Source:** `./frontend` directory
* **Remote Image:** `heisenberg83/invoices-frontend:latest` (Available on Docker Hub)

### Prerequisites
* Docker & Docker Compose
* Git

### 1. Installation
Clone the repository and navigate to the directory:
```bash
git clone <your-repo-url>
cd <repo-name>

