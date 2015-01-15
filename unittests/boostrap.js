//bootstrap.js
//Ned to provide a text file of json data to recieve for tests and sample php api routine to send json table data.
//Set debugging - when?
//Load core scripts.

//Load test scripts.

	//Top initiatisation.
	Framework.init(
	{
		debugging : true,
		background : heartbeat,
		console : [Framework.debugError] //Framework.debugQuery
	});

	//Framework.loadScripts(libraries, domainUrl+themeDir);
	Framework.loadScripts(components, domainUrl+themeDir, false);
