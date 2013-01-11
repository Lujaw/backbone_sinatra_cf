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
  buffer_render: function(hook){
    var me = this;
    var template = this.model.get('template');
    var src = '/'+template+'.html';
    var next_frame = document.createElement('iframe');
    next_frame.src = src;
    next_frame.className = 'render_frame';
    next_frame.style.display = 'none';
    document.getElementById('container').appendChild(next_frame);

    next_frame.onload = function(){
      var data_container = next_frame.contentDocument.getElementById('data_container');
      var render = Mustache.to_html(data_container.innerHTML, me.model.get('inputs'));
      log(me.model.get('inputs'));
      data_container.innerHTML = render;
      next_frame.style.height = next_frame.contentDocument.body.scrollHeight+100+'px'; 
      if ( typeof hook == "function"){ hook(me); }
    };
  },

  flip_frame: function(){
    if( this.model.get('first_run') )
    {
      this.model.set('first_run', false);
      $('.render_frame:first').show();
    }else{
      $('.render_frame:first').transition({
      perspective: '100px',
      rotateY: '360deg',
      opacity: 0 },
      function(){
        $(this).addClass('gone');
        $('.render_frame:nth-child(2)').fadeIn(200);
        $('.gone').remove();
      });     
    }
  },

  render: function(){
    var after_render = this.after_render_do;
    this.buffer_render(after_render);
  },
  after_render_do: function(self){
    self.flip_frame();
    self.next_task();
  },
  next_task: function(){
    var me = this;
    this.model.fetch({ success: function(){  me.buffer_render(); } });
  },
  post_and_render: function(data){
    this.flip_frame();
    this.next_task();
  }
});

var LocalDS = { set: function(key, value){
                return localStorage.setItem(key, value);
                },
              get: function(key){
              return localStorage.getItem(key);
              },
              find: function(key){
              return localStorage.hasOwnProperty(key);
              }
              };

var mod = new Main();
var vw = new MainView({ model: mod});
mod.fetch({ success: function(){ vw.render(); } });


var CF = { submit: function(){ vw.post_and_render(); }};
