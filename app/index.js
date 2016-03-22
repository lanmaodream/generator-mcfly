'use strict';
//var util = require('util');
var path = require('path');
var yosay = require('yosay');
var Class = require('../class');
var chalk = require('chalk');

var AppGenerator = Class.extend({
    constructor: function() {
        Class.apply(this, arguments);
        this.createOptions();

        this.option('check-travis', {
            desc: 'Check if travis cli is installed',
            type: 'Boolean',
            defaults: true
        });

        this.argument('appname', {
            type: String,
            required: false
        });

        this.option('mobile', {
            desc: 'Indicates that the app is a mobile app',
            type: 'Boolean',
            defaults: false
        });

        this.option('testmode', {
            desc: 'Only use when testing',
            type: 'Boolean',
            defaults: false
        });

        this.appname = this.appname || path.basename(process.cwd());
        this.appname = this.camelize(this.appname);

    },

    initializing: function() {

        this.pkg = require('../package.json');
        this.notifyUpdate(this.pkg);

        var done = this.async();

        this.checkPython().then(function() {
            done();
        });

        //this.checkTravis().then(function() {
        //    done();
        //});

    },

    prompting: {
        welcome: function() {
            // Have Yeoman greet the user.
            if (!this.options['skip-welcome-message']) {
                this.log(yosay('Welcome to the amazing mcfly generator!'));
            }

            this.composeWith('sublime:app', {
                options: {
                    'skip-welcome-message': true
                }
            }, this.options.testmode ? null : {
                local: require.resolve('generator-sublime/app')
            });

        },
        askFor: function() {
            var done = this.async();

            var prompts = [{
                name: 'filenameCase',
                type: 'list',
                message: 'Do you want your filenames in camelCase or snake-case?',
                choices: [{
                    name: 'camelCase',
                    value: 'camel'
                }, {
                    name: 'snake-case',
                    value: 'snake'
                }],
                default: 'camel'
            }, {
                name: 'filenameSuffix',
                type: 'confirm',
                message: 'Would you like to use Johnpappa style filename suffixes? ("homeCtrl.controller.js" vs "homeCtrl.js")',
                default: false
            }, {
                name: 'clientFolder',
                message: 'How would you like to name the client folder?',
                default: 'client'
            }, {
                name: 'ionic',
                type: 'confirm',
                message: 'Would you like to include ionic framework?',
                default: true
            }, {
                name: 'famous',
                type: 'confirm',
                message: 'Would you like to include famous-angular?',
                when: false,
                default: false
            }, {
                name: 'ngCordova',
                type: 'confirm',
                message: 'Would you like to include ng-cordova?',
                default: true
            }, {
                name: 'material',
                type: 'confirm',
                message: 'Would you like to include angular-material?',
                default: false
            }, {
                name: 'fontawesome',
                type: 'confirm',
                message: 'Would you like to include font-awesome?',
                default: true
            }, {
                name: 'bootstrap',
                type: 'confirm',
                message: 'Would you like to include angular-ui-bootstrap?',
                default: false
            }];

            this.prompt(prompts, function(answers) {
                this.filenameCase = answers.filenameCase;
                this.clientFolder = answers.clientFolder;
                this.bootstrap = answers.bootstrap;
                this.ionic = answers.ionic;
                this.famous = answers.famous;
                this.ngCordova = answers.ngCordova;
                this.fontawesome = answers.fontawesome;
                this.material = answers.material;
                this.bootstrap = answers.bootstrap;
                this.mobile = this.options.mobile;
                this.filenameSuffix = answers.filenameSuffix;

                this.composeWith('sublime:gulps', {
                    options: {
                        clientFolder: answers.clientFolder,
                        ionic: answers.ionic,
                        famous: answers.famous,
                        fontawesome: answers.fontawesome,
                        bootstrap: answers.bootstrap,
                        material: answers.material,
                        lint: true,
                        serve: true,
                        browserify: true,
                        webpack: true,
                        release: true,
                        changelog: true,
                        test: true,
                        style: true,
                        dist: true,
                        graph: true
                    }
                }, this.options.testmode ? null : {
                    local: require.resolve('generator-sublime/gulps')
                });
                done();
            }.bind(this));

        }

        //         _askForModules: function() {
        //             var done = this.async();

        //             var choicesModules = [{
        //                 value: 'animateModule',
        //                 name: 'angular-animate.js',
        //                 checked: true
        //             }, {
        //                 value: 'cookiesModule',
        //                 name: 'angular-cookies.js',
        //                 checked: false
        //             }, {
        //                 value: 'resourceModule',
        //                 name: 'angular-resource.js',
        //                 checked: false
        //             }, {
        //                 value: 'sanitizeModule',
        //                 name: 'angular-sanitize.js',
        //                 checked: true
        //             }];
        //             var prompts = [{
        //                 type: 'checkbox',
        //                 name: 'modules',
        //                 message: 'Which modules would you like to include?',
        //                 choices: choicesModules
        //             }];

        //             this.prompt(prompts, function(answers) {
        //                 // transform the choices into boolean properties on 'this' : this.sanitizeModule
        //                 this.choicesToProperties(answers, choicesModules, 'modules');

        //                 done();
        //             }.bind(this));
        //         }
    },

    configuring: function() {
        this.config.set('filenameCase', this.filenameCase);
        this.config.set('filenameSuffix', this.filenameSuffix);
        this.config.set('appname', this.appname);
        this.config.set('clientFolder', this.clientFolder);
        this.config.set('ionic', this.ionic);
        this.config.set('famous', this.famous);
        this.config.set('ngCordova', this.ngCordova);
        this.config.set('fontawesome', this.fontawesome);
        this.config.set('bootstrap', this.bootstrap);
        this.config.set('material', this.material);
        this.config.forceSave();
        // build require for ionic bundle if target is mobile
        if (this.mobile) {
            this.ionicBundle = './ionic.io.bundle.min';
        }
    },

    writing: {

        setRoot: function() {
            this.suffix = '';
            this.sourceRoot(path.join(__dirname, '../templates/app'));
        },

        projectfiles: function() {
            this.template('_package.json', 'package.json');
            this.template('_bower.json', 'bower.json');
            this.template('_bowerrc', '.bowerrc');
            this.template('karma.conf.js');
            this.template('protractor.conf.js');
            this.template('protractor/browserExtension.js');
            this.template('protractor/byExtension.js');
            this.template('protractor/coverage.js');
            this.template('webpack.config.js');
            this.template('bin/prepublish.sh');
            this.template('bin/protractor-fix-version.js');
            this.template('bin/cordova-generate-icons');
            this.template('bin/cordova-generate-splashes');
        },

        clientfiles: function() {
            this.targetDir = path.join(process.cwd(), this.clientFolder);
            this.utils.mkdir(this.clientFolder);
            this.utils.mkdir(this.clientFolder + '/styles');
            this.utils.mkdir(this.clientFolder + '/scripts');
            this.utils.mkdir('srcmaps');
            this.utils.mkdir(this.clientFolder + '/images/app');
            this.utils.mkdir(this.clientFolder + '/icons/app');
            this.utils.mkdir(this.clientFolder + '/fonts/app');
            this.template('client/_eslintrc.json', this.clientFolder + '/.eslintrc.json');
            this.template('../target/index.html', this.clientFolder + '/index.html');
            this.template('client/404.html', this.clientFolder + '/404.html');
            this.template('client/robots.txt', this.clientFolder + '/robots.txt');
            this.template('client/favicon.ico', this.clientFolder + '/favicon.ico');
            this.template('../target/styles/main.scss', this.clientFolder + '/styles/main.scss');
            this.template('../target/styles/main.less', this.clientFolder + '/styles/main.less');
            this.template('../target/scripts/main.js', this.clientFolder + '/scripts/main.js');
            this.template('../target/scripts/main.test.js', this.clientFolder + '/scripts/main.test.js');
            this.template('client/scripts/tests.webpack.js', this.clientFolder + '/scripts/tests.webpack.js');
            if (this.mobile) {
                this.template('../target/config.xml', path.join(this.targetDir, 'config' + '.xml'));
                this.directory('../target/hooks', path.join(this.targetDir, 'cordova', 'app', 'hooks'));
            }
        },

        testFiles: function() {
            this.utils.mkdir('test');
            this.utils.mkdir('test/unit');
            this.utils.mkdir('test/mocha');
            this.utils.mkdir('test/mocha/helpers');
            this.utils.mkdir('test/e2e/app');
            this.template('test/e2e/app/main.e2e.test.js', 'test/e2e/app/main.e2e.test.js');
            this.template('test/e2e/app/tests.protractor.js', 'test/e2e/app/tests.protractor.js');
            this.template('test/e2e/views/Base.view.js', 'test/e2e/views/Base.view.js');
            this.template('test/e2e/views/Main.view.js', 'test/e2e/views/Main.view.js');
            this.template('test/_jshintrc', 'test/.jshintrc');
            this.template('test/e2e/_eslintrc.json', 'test/e2e/.eslintrc.json');
            this.template('test/mocha/helpers/globals.js', 'test/mocha/helpers/globals.js');
            this.template('test/unit/polyfill.js', 'test/unit/polyfill.js');
            this.template('test/unit/unitHelper.js', 'test/unit/unitHelper.js');

        },

        serverfiles: function() {
            this.utils.mkdir('server');
        }
    },

    install: function() {
        this.npmInstall(null, {
            skipInstall: this.options['skip-install']
                //     skipMessage: this.options['skip-message']
        });
    },

    end: function() {

        if (this.mobile) {
            this.log('');
            this.log('To use any of the ionic.io services (ionicPush, ionicDeploy, etc...)');
            this.log('  1) Create your project on ' + chalk.cyan('https://apps.ionic.io'));
            this.log('  2) ' + chalk.blue('gulp_tasks/common/constants.js') + ':');
            this.log('     - fill in ' + chalk.yellow('constants.ionic.app.app_id') + ' and ' + chalk.yellow('constants.ionic.app.api_key'));
            this.log('  3) Run ' + chalk.magenta('gulp ionic:platformcopy --target=app'));
            this.log('  4) ' + chalk.blue('client/index.html') + ':');
            this.log('     - comment out line ' + chalk.green('22') + ' to disable the default loading of ' + chalk.blue('cordova.js'));
            this.log('  5) ' + chalk.blue('client/scripts/main.js') + ':');
            this.log('     - uncomment line ' + chalk.green('14') + ' to require ' + chalk.blue('client/scripts/ionic.io.bundle.min.js'));
            this.log('     - uncomment the module dependency for ' + chalk.blue('\'ionic.service.core\''));
        }
    }
});

module.exports = AppGenerator;