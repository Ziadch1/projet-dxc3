pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    // Clean up any previous virtual environment
                    sh 'rm -rf venv'
                    
                    // Set up a new virtual environment
                    sh 'python3 -m venv venv'
                    
                    // Upgrade pip
                    sh './venv/bin/pip install --upgrade pip'
                    
                    // Install semgrep
                    sh './venv/bin/pip install semgrep'
                }
            }
        }

        stage('Troubleshoot Semgrep') {
            steps {
                script {
                    echo 'Checking for semgrep:'
                    sh 'ls -la ./venv/bin/semgrep'
                    
                    echo 'Running ldd on semgrep binary:'
                    sh 'ldd ./venv/bin/semgrep || true'
                    
                    echo 'Checking semgrep shebang:'
                    sh 'head -n 1 ./venv/bin/semgrep'
                    
                    echo 'Running semgrep via python:'
                    sh './venv/bin/python ./venv/bin/semgrep --config auto .'
                }
            }
        }

        stage('Build Backend Docker Image') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                echo 'Building Backend Docker Image'
                // Add your backend Docker build commands here
            }
        }

        stage('Build Frontend Docker Image') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                echo 'Building Frontend Docker Image'
                // Add your frontend Docker build commands here
            }
        }

        stage('Push Docker Images') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                echo 'Pushing Docker Images'
                // Add your Docker push commands here
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            // Clean up Docker images if they exist
            sh 'docker rmi yassird/expense-manager-backend:latest || true'
            sh 'docker rmi yassird/expense-manager-frontend:latest || true'
        }
    }
}
