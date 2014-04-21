exports.definition = {
  
  mixinCallback: function(){
    
    var res = this.resource;
    
    this.actions = {
      index:    {method: 'get',     path: '/' + res,          params: {}},
      show:     {method: 'get',     path: '/' + res + '/:id', params: {}},
      create:   {method: 'post',    path: '/' + res,          params: {}},
      update:   {method: 'put',     path: '/' + res + '/:id', params: {}},
      destroy:  {method: 'delete',  path: '/' + res + '/:id', params: {}}
    }
    
  },
  
  
  addBaseParam: function(name, value){
    for(var action in this.actions){
      if(this.actions.hasOwnProperty(action)){
        this.actions[action].params[name] = value;
      }
    }
    return this;
  }
  
}