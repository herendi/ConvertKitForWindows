/*global module */
module.exports = function (grunt)
{
    'use strict';

    grunt.initConfig({
        bom: {
            addBom: {
                src: ["src/libraries/**/*.js", "src/libraries/**/*.css"],
                options: {
                    add: true
                }
            }
        }
    });

    // Add all plugins that your project needs here
    grunt.loadNpmTasks('grunt-byte-order-mark');

    //Register named tasks
    grunt.registerTask('addBom', ['bom:addBom']);

    // define the default task that can be run just by typing "grunt" on the command line
    grunt.registerTask('default', []);
};