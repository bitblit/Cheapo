module.exports = function(grunt) {

  grunt.initConfig({
    clean: ["dist"],
    simplemocha: {
      options: {
        globals: ['expect'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'tap'
      },
      all: {src: ['test/*.js']}
    },
    lambda_invoke: {
      default: {
        options: {
          // Task-specific options go here.
        }
      }
    },
    lambda_package: {
      default: {
        options: {
          // Task-specific options go here.
        }
      }
    },
    lambda_deploy: {
      default: {
        arn: 'arn:aws:lambda:us-east-1:YOUR_AWS_ID:function:CHEAPO',
        options: {
          timeout: 10,
          memory: 128
          // Task-specific options go here.
        }
      }
    },
    jshint: {
      files: ['*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-aws-lambda');
  grunt.loadNpmTasks('grunt-simple-mocha');

  // SimpleMocha tests the services, lambda_invoke tests the lambda function
  grunt.registerTask('default', ['jshint','simplemocha','lambda_invoke']);

  grunt.registerTask('ldeploy', ['clean','lambda_package', 'lambda_deploy']);

};
