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


/*
	build a sidebar with given sections. The sidebar is collapsible
	@navlist: 		the list that contains all sections sorted from top to down
	@*attr: 		the attributes of * tag, such as 'class', but must not include 'id.' * is the name of certain tag.
	@return: 		a HTML formatted navigation list in string
 */
var makeSectionHtml = function(navlist,liattr,ulattr,aattr,divattr) {

	var counter = 0
	var stack = []
	var header = {}
	var content = ""
	var output = ''

	for (var index in navlist.reverse()) {
		sec = navlist[index]
		sec['content'] = '<li '+liattr+' >'+'<a href=#'+sec['_id'].replace(/ /g,'_')+' '+aattr+'>'+sec['_id']+'</a></li>';

		if (!stack.length) {
			stack.push(sec);
			continue;
		}

		//Merge 
		if (stack[stack.length-1]['level'] >= sec['level']) {

			var once = true;

			while(stack[stack.length-1]['level'] >= sec['level']) {

				header = stack.pop();
				content = sec['content'];
				
				if (header['level'] > sec['level'] && once) {
					content = '<li>'+'<div '+divattr+'>'+'<a href=#'+sec['_id'].replace(/ /g,'_')+' '+aattr+'>'+sec['_id']+'</a>'+'<span data-toggle="collapse" href="#'+sec['_id'].replace(' ','_')+counter+'" style="display: inline-block; width: 50%;">&nbsp;</span>'+'<ul id='+sec['_id'].replace(/ /g,'_')+counter+' '+ulattr+'>'+header['content']+'</ul>'+'</div></li>';
					once = false;
					counter++;
				} else 
					content += header['content'];

				sec['content'] = content;
				
			}
		}
		
		stack.push(sec)

	}

	for (var k in stack) {
		output += stack[k]['content']
	}

	return '<ul '+ulattr+'>'+output+'</ul>'
}


module.exports.makeHtml = parser;
module.exports.makeNavList = makeSectionHtml;
