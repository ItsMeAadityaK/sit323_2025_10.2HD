1. Initialized a Node.js Express project with npm init and installed dependencies (express, multer, mongodb, cors, fs)
2. Wrote index.js with:
- File upload logic using multer
- MongoDB logging for filename and insight
- Visual HTML display for history
3. Created Dockerfile to containerize backend
4. Pushed Docker image to Docker Hub: aadityakulk/locallens-backend:latest
5. Wrote Kubernetes manifests:
- mongo-deployment.yaml and mongo-service.yaml
- deployment.yaml and service.yaml for backend
6. Applied Kubernetes manifests via kubectl apply
7. Verified pods and services with kubectl get pods and kubectl get svc
8. Opened the app using the EXTERNAL-IP assigned by the LoadBalancer
9. Tested /analyze upload and /history-view interface
10. Cleared history in MongoDB using kubectl exec + deleteMany({})
11. Rebuilt and re-pushed Docker image after UI changes