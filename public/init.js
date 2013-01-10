function log(data){ console.log(data); }
var Main = Backbone.Model.extend({
  defaults:{ template: ""},
  urlRoot: "",
  url: function() {
      var base = '/work';
      return base ;
  }
});

var MainView = Backbone.View.extend({
  el: $("#render_frame"),
  render: function(){
    this.render_in_iframe();
  },
  render_in_iframe: function(){
    var me = this;
    var tmp;
    var template = me.model.get('template');
    $.get('/template/'+template, function(data){
      tmp = $(data);
    }).success( function(){
      var template = tmp.find('#data_container').html();
      var render = Mustache.to_html(template, me.model.get('inputs'));
      data = tmp.find('#data_container').html(render);
      me.$el.contents().find('body').html(tmp);
      var height = document.getElementById('render_frame').contentWindow.document.body.scrollHeight;
      me.adjust_iframe(height);
    });
  },
  adjust_iframe: function(height){
    log(height);
    this.$el.height(height);
  }
});

var mod = new Main();
var vw = new MainView({ model: mod});
mod.fetch({ success: function(){ vw.render(); } });
