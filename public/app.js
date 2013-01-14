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
    this.update_meta();

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
    this.timer(this.model.attributes.meta.assignment_duration);
     
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
    var self = this;
    flag_task.set('assignment_id', self.model.attributes.meta.assignment_id);
    this.model.fetch({ success: function(){  
        self.buffer_render();
        if( self.model.get('note') != 'undefined' )
        {
          $().toastmessage('showToast', {
            text     : self.model.get('note').gold_message,
            stayTime : 8000,
            sticky   : false,
            position : 'top-right',
            type     : self.model.get('note').status, //success, notice, warning, error
          });
        }
      } 
    });
  },
  post_and_render: function(data){
    this.model.attributes.output = data.output;
    this.model.save();
    this.flip_frame();
    this.next_task();
  },
  update_meta: function(){
    $("#current_money").html("Rs. " + this.model.attributes.meta.reward);
  },
  skip: function(){
    this.flip_frame();
    this.next_task();
  },
  timer: function(timecop){
     $('#countdown').countdown({
      expire_after : timecop
    },
      function(){ $.facebox("<h2>Task Expired</h2><p>You could not complete this task on time. Try <a href='#' id='time_over_next'>next</a> task.</p>"); }
    );
  }
});


var Flag = Backbone.Model.extend({
  url: '/flag'
});

var FlagView = Backbone.View.extend({
  render: function(){
    $.facebox($('#flag_form_tmpl').html());
    $('#flag_reason').focus();
  }
});
