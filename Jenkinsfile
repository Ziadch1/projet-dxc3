pipeline {
    agent any
    
    environment {
        BACKEND_IMAGE = "yassird/expense-manager-backend"
        FRONTEND_IMAGE = "yassird/expense-manager-frontend"
        BUILD_TAG = "${BUILD_ID}" // Use the Jenkins build ID as the tag
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

        stage('Run Semgrep Analysis') {
            steps {
                sh '''
                    docker run --rm -v "${WORKSPACE}:/src" returntocorp/semgrep semgrep scan --config auto /src/backend
                    docker run --rm -v "${WORKSPACE}:/src" returntocorp/semgrep semgrep scan --config auto /src/frontend
                '''
            }
        }
        
        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} .'
                }
            }
        }
        
        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} .'
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                sh 'docker push ${BACKEND_IMAGE}:${BUILD_TAG}'
                sh 'docker push ${FRONTEND_IMAGE}:${BUILD_TAG}'
            }
        }
    }
    
    post {
        always {
            sh 'docker rmi ${BACKEND_IMAGE}:${BUILD_TAG} || true'
            sh 'docker rmi ${FRONTEND_IMAGE}:${BUILD_TAG} || true'
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
