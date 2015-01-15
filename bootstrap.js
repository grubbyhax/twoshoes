//bootstrap.js

/*

THESE ARE THE CURRENT TASKS ON THIS LIST(Secure Data Handling)

//need to trigger a final backgroud task when the user logs out of the application
//need to update the path of the settings each time the route is alterd
*/


//Configuration
var domainUrl = 'http://127.0.0.37/';
var themeDir = 'themes/default/';

//Include stack.
//Need to come back and look at the libraries later, wil it now work with serial loading?.
var libraries = [
	'scripts/plugins/validator.js',
];

var components = [
	'scripts/routes.js',
	'scripts/requests.js',
	'scripts/plugins.js',
	'scripts/helpers.js',
];

//Background task interval.
var heartbeat = 5000;

jQuery(document).ready(function()
{
	//Twoshoes.test();

	//Twoshoes pathing.
	jQuery(window).on('hashchange', (function()
	{
		Twoshoes.paths();
	}));

	//Top initiatisation.
	Twoshoes.init(
	{
		debugging : true,
		background : heartbeat,
		console : [Twoshoes.debugError] //Twoshoes.debugQuery
	});

	//Twoshoes.loadScripts(libraries, domainUrl+themeDir);
	Twoshoes.loadScripts(components, domainUrl+themeDir, false);

	//Account interface.
// 	if (true || (window.location.href.indexOf(domainUrl+'account/') == 0))
// 	{
//  		Twoshoes.request('bootstrap').init({complete:test});
// 	}


});

var test = function()
{
	//do nothing
	jQuery('#test').show();
}
