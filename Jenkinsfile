pipeline {
    agent any
    
    environment {
        BACKEND_IMAGE = "yassird/expense-manager-backend"  // Name of the backend image
        FRONTEND_IMAGE = "yassird/expense-manager-frontend"  // Name of the frontend image
        DB_HOST = 'localhost'
        DB_USER = 'root'
        DB_PASSWORD = 'Payne1@Max2'
        DB_NAME = 'expense_manager'
        NODE_ENV = 'test'
    }
    
    stages {
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        
        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE}:latest .'
                }
            }
        }
        
        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE}:latest .'
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                // Push backend image
                sh 'docker push ${BACKEND_IMAGE}:latest'

                // Push frontend image
                sh 'docker push ${FRONTEND_IMAGE}:latest'
            }
        }
    }
    
    post {
        always {
            // Clean up Docker environment to avoid disk space issues
            sh 'docker rmi ${BACKEND_IMAGE}:latest || true'
            sh 'docker rmi ${FRONTEND_IMAGE}:latest || true'
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
