/**
  * agent label based on branch
  */
def agentLabel
if ("$env.gitlabBranch" == "master") {
    agentLabel = 'Production'
} else if("$env.gitlabBranch" == "staging") {
    agentLabel = 'Demo'
} else {
    agentLabel = 'DevBackend'
}

pipeline {
    /**
     * agent section specifies where the entire Pipeline will execute in the Jenkins environment
     */
    agent {
        node {
            label agentLabel
            customWorkspace '/tmp/pull-request-check/'
        }
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
        gitLabConnection('Gitlab')
        gitlabBuilds(builds: ['Dependency', 'Lint', 'Test', 'Build', 'Deploy'])
    }

    /**
     * stages contain one or more stage directives
     */
    stages {
        stage('Dependency') {
            steps {
                // sh 'printenv'
                script {
                    sh(script:
                        """
                        . /home/ubuntu/.bashrc
                        NODE_ENV=development npm install
                        """
                    )
                }
            }
            options {
                gitlabCommitStatus('Dependency')
            }
        }
        stage('Lint') {
            steps {
                script {
                    sh(script:
                        """
                        . /home/ubuntu/.bashrc
                        npm run lint
                        """
                    )
                }
            }
            options {
                gitlabCommitStatus('Lint')
            }
        }
        stage('Test') {
            steps {
                script {
                    sh(script:
                        """
                        . /home/ubuntu/.bashrc
                        NODE_ENV=test npm run test --if-exist
                        """
                    )
                }
            }
            options {
                gitlabCommitStatus('Test')
            }
        }
        stage('Build') {
            steps {
                script {
                    sh(script:
                        """
                        . /home/ubuntu/.bashrc
                        npm run build
                        """
                    )
                }
            }
            options {
                gitlabCommitStatus('Build')
            }
        }
        stage('Deploy') {
            when {
                environment name: 'gitlabActionType', value: 'PUSH'
                anyOf {
                    environment name: 'gitlabBranch', value: 'master'
                    environment name: 'gitlabBranch', value: 'staging'
                    environment name: 'gitlabBranch', value: 'development'
                }
            }
            steps {
                script {
                    sh(script:
                        """
                        . /home/ubuntu/.bashrc
                        cp -r dist /smartex/production/
                        cp -r worker /smartex/production/
                        cp -r views /smartex/production/
                        cp peerbits-ams-backend.json /ams/production/peerbits-ams-backend.json
                        cp package.json /smartex/production/package.json
                        cp package-lock.json /smartex/production/package-lock.json
                        cd /smartex/production
                        NODE_ENV=production npm install
                        npm run reload
                        """
                    )
                }
            }
            options {
                gitlabCommitStatus('Deploy')
            }
        }
    }
}
