




var makeSectionHtml = function(navlist,liattr,ulattr,aattr,divattr) {

	var counter = 0
	var stack = []
	var header = {}
	var content = ""
	var output = ''

	for (var sec in navlist) {

		sec['content'] = '<li '+liattr+' >'+'<a href=#'+sec['id']+' '+aattr+'>'+sec['id']+'</a></li>';
		
		if (stack == []) {
			stack.push(sec);
			continue;
		}

		//merge
		if (stack[stack.length-1]['level'] >= sec['level']) {

			var once = true;
			while(stack[stack.length-1]['level'] >= sec['level']) {

				header = stack.pop();
				content = sec['content'];

				if (header['level'] > sec['level'] && once) {
					content = 	'<li>
									<div '+divattr+'>'+
										'<a href=#'+sec['id']+' '+aattrs+'>'+sec['id']+'</a>
										<span data-toggle="collapse" href="#'+sec['id']+counter+'" style="display: inline-block; width: 50%;"'+
											'<ul id='+sec['id']+counter+' '+ulattr+'>'+header['content']+'</ul>
									</div>
								</li>';
					once = false;
					counter++;
				} else 
					content += header['content'];

				sec['content'] = content;
			}
		}

		stack.push(sec)

	}

	for (var concatSec in stack) {
		output += concatSec['content']
	}

	return '<ul class='+ulattr+'>'+output+'</ul>'
}





var makeSectionList = function(navlist, attrs) {

	var levels = []

	//initialize levels list
	for(var i = 0; i < 6; i++)
		levels[i] = null

	assert(levels.length == 6)

	var currentLevel = navlist[0]['level']

	assert(currentLevel != null)

	//open tag li ul

	for (var sec in navlist) {

		for (var j = currentLevel; j > 0; j--) {
			//open tag li ul
			if (j < sec['level']) {
				//open tag ul
			} else if (j === sec['level']) {
				//close j ul li tag
			}
		}
	}

}

module.exports.makeSectionHtml = makeSectionHtml;