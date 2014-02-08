var markdox = require('markdox');
var formatter = require('markdox/lib/formatter').format;
var glob = require('glob');
var path = require('path');
var async = require('async');
var fs = require('fs');


var files;
var classes = {};
var areas = {};
var tmp = [];


files = glob.sync('./lib/*.js');
files = files.concat(glob.sync('./lib/*/*.js'));
files = files.concat(glob.sync('./examples/**/*.js'));


for(var i in files){
  (function(file){
    tmp.push(function(next){
      markdox.parse(file, function(err, results){
        if(!err){
          for(var i in results){
            var result = results[i];
            var callback_params = false;
            var options_params = false;
            
            var method_name;
            var class_name;
            var area_name;
            
            for(var t in result.tags){
              var tag = result.tags[t];
          
              if(tag.type == 'area'){
                area_name = tag.string;
                class_name = area_name.split('/')[0];
              }
              
              if(tag.type == 'method' || tag.type == 'name'){
                method_name = tag.string;
              }
          
              if(method_name && class_name){
                classes[class_name] = classes[class_name] || {};
                classes[class_name][method_name] = classes[class_name][method_name] || [];
                classes[class_name][method_name].push(result);
                
                areas[area_name] = areas[area_name] || {};
                areas[area_name][class_name] = areas[area_name][class_name] || [];
                
                areas[area_name][class_name].push(method_name);
                
                method_name = null;
              }
              
                            
              if(tag.type == 'example'){
                class_name = tag.string.split('.')[0];
                method_name = tag.string.split('.')[1];

                classes[class_name] = classes[class_name] || {};
                classes[class_name][method_name] = classes[class_name][method_name] || [];
                classes[class_name][method_name].push(result);
                                
                result.example = true;
                method_name = null;
              }
              
              if(callback_params && tag.type == 'param'){
                result.callback = result.callback || []
                result.callback.push(tag);

                delete result.tags[t];
              }
              
              if(callback_params && tag.type == 'scope'){
                result.callback = result.callback || []
                result.callback.scope = tag.string;
              }
              
              if(tag.type == 'callback'){
                callback_params = true;
              }
              
              
              if(options_params && tag.type == 'param'){
                result.options = result.options || []
                result.options.push(tag);

                delete result.tags[t];
              }
                            
              if(tag.type == 'options'){
                options_params = true;
              }
                            
            }
          }
          
          next();
        }else{
          throw new Error(err);
        }
      });
    });
  })(files[i]);  
}



async.series(tmp, function(){
  var tmp = [];
        
  for(var name in areas){
    var area = areas[name];
    var docs = []
    
    for(var c in area){
      var methods = area[c];
      var cls = classes[c];
      for(var m in methods){
        docs = docs.concat(cls[methods[m]]);
      }
    }
      
    
    (function(name, docs){
          
      name = name.split('.')[0];
      
      tmp.push(function(next){
        var filename = __dirname + '/docs/' + name + '.md';
        var filepath = path.dirname(filename);
    
        if(!fs.existsSync(filepath)){
          fs.mkdirSync(filepath);
        }
      
        var docfile = formatter({javadoc: docs});
            
        /*
        console.log('------------');
        console.log(require('util').inspect(docfile, {depth:10}));
        console.log('------------');
        */ 
        markdox.generate([docfile], {
          output: filename,
          template: __dirname + '/template.ejs'
        }, function(err, output){          
          fs.writeFileSync(filename, output);
          next();
        });
      });
      
    })(name, docs);
  }
  
  
  async.parallel(tmp, function(){
    var copy = ['Home.md', 'Installation.md'];
    
    for(var i in copy){
      var file_path = __dirname + '/docs/' + copy[i];
      if(!fs.existsSync(file_path)){
        fs.linkSync(__dirname + '/' + copy[i], file_path);
      }
    }
    
    console.log('DONE!');
  })
});