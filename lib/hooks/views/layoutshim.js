/**
 * Module dependencies
 */

var ejsLayoutEngine = require('ejs-locals');


/**
 * Implement EJS layouts (a la Express 2)
 *
 * TODO:
 * Extrapolate this functionality to a separate hook
 * to make it easier for folks to extend it with support
 * for other view engines (e.g. hbs)
 *
 * @param  {Sails}   sails
 * @param  {Function} cb
 */

module.exports = function layoutshim(sails, cb) {

    // If layout config is set, attempt to use view partials/layout
    if (sails.config.views.layout) {

        // If `http` hook is not enabled, we can't use partials
        // (depends on express atm)
        if (sails.config.hooks.http) {
            sails.log.silly(sails.config.views.engine.ext);
            // Use ejs-locals for all ejs templates
            if (sails.config.views.engine.ext === 'ejs') {


                // Wait until express is ready, then configure the view engine
                return sails.after('hook:http:loaded', function () {
                    sails.log.verbose('Overriding ejs engine config with ejslocals to implement layout support...');
                    sails.config.views.engine.fn = ejsLayoutEngine;
                    cb();
                });
            } else if (sails.config.views.engine.ext === 'handlebars') {
                console.log('Handlebars view engine found...');
                sails.log.verbose('Setting view engine to ' + sails.config.views.engine.ext + '...');

                // Create express3 handlebars engine and pass in layouts and helpers, if defined
                var exphbs = require('express3-handlebars');

                exphbs = exphbs.create({
                    defaultLayout: sails.config.views.layout,
                    helpers: sails.config.views.helpers || {}
                });

                // Load partials if provided by configuration/views
                var partialsDir = sails.config.views.partialsDir;

                if (partialsDir) {
                    exphbs.loadPartials(function (err, partials) {
                        if (err) throw err;

                        sails.express.app.engine('handlebars', exphbs.engine);
                    });
                }
                else {
                    // Set engine
                    sails.express.app.engine('handlebars', exphbs.engine);
                }
            }

        }
    }

    return cb();
};
