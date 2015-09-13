/*
	this file contains parse method to convert a wiki format input
	 to html format output
 */


/*
	convert basic wiki format to html format
	@input : 		'string' type. it is the text that the user posts to the server. 
					sually it should be in req.body.name
	@hostAddress: 	this is the host daddress to add before internal link address.
 */
var parser = function(input, hostAddress) {

	if(input === undefined || typeof input !== 'string')
		return {'status':'failed','msg':'input should be type of string'}

	if (hostAddress === undefined)
		return {'status':'failed','msg':'hostAddress is undefined'}

	var navlist = []
	var counter = 0
	var output = ""
	var lines = input.split('\n')

	for(var index in lines) {

		var line = lines[index]

		/*
			start to parse the line
		 */
		
		// parse p
		if (line === '') {
			output += '</ br>'
			continue
		}
		
		// parse === head ===
		if (line.match(/(={1,5})([\w+\s]+)={1,5}/g)) {
			output += line.replace(/(={1,5})([\w+\s]+)={1,5}/g, function(match, p1, p2) {
				navlist[counter++] = {'_id' : p2.trim(), 'level':p1.length}
				return '<h'+p1.length+' id=\''+p2.trim().replace(/\s/g,'_')+'\'>'+p2.trim()+'</h'+p1.length+'>'
			});
			continue
		}

		// parse [[a|b]] or [[a]]
		if (line.match(/\[\[([\w+\s]+\|)?([\w+\s]+)\]\]/g)) {
			output += line.replace(/\[\[([\w+\s]+\|)?([\w+\s]+)\]\]/g, function(match, p1, p2, offset, string) {
				if (p1 !== undefined)
					p1 = p1.substr(0, p1.length - 1);
				else
					p1 = p2;
				return '<a href='+hostAddress+'/'+p1.trim().replace(/\s/g,'_')+'>'+ p2.trim() + '</a>';
		 	});
		 	continue
		}

		// parse plain text
		output += '<p>'+line+'</p>'

	}
	return {'output' : output, 'status' : 'succeed', 'navlist':navlist}

}


module.exports.makeHtml = parser;
