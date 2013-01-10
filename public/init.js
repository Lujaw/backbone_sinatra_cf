function log(data){ console.log(data); }
var Main = Backbone.Model.extend({
  defaults:{ template: "", first_run: true },
  urlRoot: "",
  url: function() {
      var base = '/work?'+Date.now();
      return base ;
  }
});

var MainView = Backbone.View.extend({
  el: $("#render_frame"),
  render: function(){

    var me = this;
    var template = me.model.get('template');

    if( this.model.get('first_run') )
    {
      this.$el.attr('src', '/'+template+'.html');
      this.model.set('first_run', false);
      LocalDS.set('current', this.model.get('template')); 
      this.$el.on('load', function(){ me.render_data(); 
      });
    }
    else
    {
      if ( !(LocalDS.get('current') == template) )
        {
          LocalDS.set("current", template);
          this.$el.attr('src', '/'+template+'.html');
          this.$el.on('load', function(){ me.render_data(); });
        }
      else
        {
          me.render_data();
        }
      
    }
   
  },
  render_data: function(){
    var frame = this.$el;
    var template = frame.contents().find('#data_container').html();
    var render = Mustache.to_html(template, this.model.get('inputs'));
    frame.contents().find('#data_container').html(render);
    this.adjust_iframe();
    this.next_task();
  },
  adjust_iframe: function(height){
    this.$el.height(800);
  },
  next_task: function(){
    this.model.fetch();
  },
  post_and_render: function(data){
    this.render();
  }
});

var LocalDS = {
                set: function(key, value){
                  return localStorage.setItem(key, value);
                },
                get: function(key){ 
                  return localStorage.getItem(key);
                },
                find: function(key){
                  return localStorage.hasOwnProperty(key);
                }
              }

var mod = new Main();
var vw = new MainView({ model: mod});
mod.fetch({ success: function(){ vw.render(); } });


var CF = { submit: function(){ vw.post_and_render(); }}
