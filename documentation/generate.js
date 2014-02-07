var markdox = require('markdox');
var glob = require('glob');


markdox.parse(__dirname + '/../lib/stores/sql/limit.js', function(err, result){
  var limit = result[0];
  markdox.generate([limit], {
    output: __dirname + '/limit.md',
    template: __dirname + '/template.ejs'
  });
});

function documentation(class_name){
  
  class_name = class_name.toLowerCase();
  
  var options = {
    output: __dirname + '/' + class_name + '.md',
  
    formatter: function(docfile){
      var tmp = [];
      
      for(var i in docfile.javadoc){
        var incl = false;
        var area = docfile.javadoc[i];
        
        for(var t in area.raw.tags){
          var tag = area.raw.tags[t];
          
          if(tag.type == 'class' && tag.string.toLowerCase() == class_name){
            incl = true;
          }
        }
        
        if(incl){
          tmp.push(area);
        }
      }
      
      //console.log(docfile);
      
      docfile.javadoc = tmp;
      docfile.model = class_name.replace(/^(.)/, function(a){return a.toUpperCase();})
      return docfile;
    },
  
    template: __dirname + '/template.ejs'
  };

  markdox.process(glob.sync('./lib/**/*.js'), options, function(){
    console.log('Documentation generated');
  });
  
}


documentation('model');