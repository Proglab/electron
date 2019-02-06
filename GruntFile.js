module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        gitaccount: grunt.file.readJSON('git_account.json'),
        version: {
            patch: {
                options: {
                    release: 'patch'
                },
                src: ['app/package.json', 'package.json']
            },
            minor: {
                options: {
                    release: 'minor'
                },
                src: ['app/package.json', 'package.json']
            },
            major: {
                options: {
                    release: 'major'
                },
                src: ['app/package.json', 'package.json']
            }
        },
        jshint: {
            files: ['app/class/*.js', 'app/view/js/page/*.js', 'app/view/js/widgets/*.js', 'app/view/js/menuData.js', 'app/view/js/menuTemplate.js', 'app/view/js/app.js'],
            options: {
                esnext: true
            }
        },
        clean: {
            contents: ['dist/*'],
        },
        rename: {
            main: {
                files: [
                    {src: ['dist/moka2popsy Setup <%= pkg.version %>.exe'], dest: 'dist/moka2popsy-setup-<%= pkg.version %>.exe'},
                ]
            }
        },
        "github-release": {
            options: {
                repository: 'proglab/electron', // Path to repository
                auth: {   // Auth credentials
                    user: '<%= gitaccount.login %>',
                    password: '<%= gitaccount.pass %>'
                },
                release: {
                    "tag_name": "v<%= pkg.version %>",
                    "name": "v<%= pkg.version %>",
                }
            },
            files: {
                src: ['dist/*.*']
            },


        },
        gitadd: {
            task: {
                options: {
                    all: true
                }
            }
        },
        gitcommit: {
            options: {
                message: "v<%= pkg.version %>"
            },
            files: {
                // Specify the files you want to commit
            }
        },
        gittag: {
            addtag: {
                options: {
                    tag: 'v<%= pkg.version %>',
                    message: 'v<%= pkg.version %>'
                }
            }
        },
        gitpull: {
            master: {
                options: {

                }
            }
        },
        gitpush: {
            master: {
                options: {
                    all:true
                }
            }
        },
    });
    grunt.loadNpmTasks('grunt-version');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('before', ['jshint','clean']);
    grunt.loadNpmTasks('grunt-rename-util');
    grunt.loadNpmTasks('grunt-github-releaser');
    grunt.registerTask('after', ['rename', 'github-release']);
    grunt.loadNpmTasks('grunt-git');

};