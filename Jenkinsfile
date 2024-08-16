pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "yassird/expense-manager-backend"
        FRONTEND_IMAGE = "yassird/expense-manager-frontend"
        DB_HOST = 'localhost'
        DB_USER = 'root'
        DB_PASSWORD = 'Payne1@Max2'
        DB_NAME = 'expense_manager'
        NODE_ENV = 'test'
        VENV_PATH = './venv'  // Path for virtual environment
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

        stage('Set Up Semgrep') {
            steps {
                dir('backend') {
                    // Create a virtual environment in the backend directory
                    sh '''
                        python3 -m venv ${VENV_PATH}
                        bash -c "source ${VENV_PATH}/bin/activate && pip install --upgrade pip && pip install semgrep"
                    '''
                }
            }
        }

        stage('Semgrep Security Analysis') {
            steps {
                dir('backend') {
                    sh '''
                        bash -c "source ${VENV_PATH}/bin/activate && semgrep --config auto ."
                    '''
                }
                dir('frontend') {
                    sh '''
                        bash -c "source ${VENV_PATH}/bin/activate && semgrep --config auto ."
                    '''
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
                sh 'docker push ${BACKEND_IMAGE}:latest'
                sh 'docker push ${FRONTEND_IMAGE}:latest'
            }
        }
    }

    post {
        always {
            sh 'docker rmi ${BACKEND_IMAGE}:latest || true'
            sh 'docker rmi ${FRONTEND_IMAGE}:latest || true'
            // Optionally remove the virtual environment
            dir('backend') {
                sh 'rm -rf ${VENV_PATH}'
            }
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
