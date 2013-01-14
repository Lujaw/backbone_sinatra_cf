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
  current : {},
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
      data_container.innerHTML = render;
      next_frame.style.height = next_frame.contentDocument.body.scrollHeight+100+'px';
      if ( typeof hook == "function"){ hook(me); }
    };
  },

  flip_frame: function(){
    if(this.model.get('no_more_task') ) {
      window.location="/no_more_task.html";
    }
    else
    {
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
    }
  },

  render: function(){
    var after_render = this.after_render_do;
    this.buffer_render(after_render);
  },
  after_render_do: function(me){
    me.flip_frame();
    me.next_task();
  },
  next_task: function(){
      var me = this;
      flag_task.set('assignment_id', me.model.attributes.meta.assignment_id);
      this.current = this.model.toJSON();
      me.model.fetch({ success: function(){
          me.buffer_render();
          me.handle_notify();
        }
      });
  },
  handle_notify: function(){
    var me = this;
    if( me.model.get('note') != undefined )
    {
      $().toastmessage('showToast', {
        text     : me.model.get('note').message,
        stayTime : 8000,
        sticky   : false,
        position : 'top-right',
        type     : me.model.get('note').status //success, notice, warning, error
      });
    }
  },
  post_and_render: function(data){
    var me = this;
    me.current.output = data.output;
    if(me.current.gold){
      $.facebox('<h2>You just did a spot check.</h2>We are checking your answers...please wait...<br />');
      var tmp_task = new Main(me.current);
      tmp_task.save({},{success: function(model,data){
          $.countdown.reset();
          $('#facebox .content').append(data.text);
          $('#facebox .content').append('<br /><a href="#" id="continue" class="btn">Continue to work</a>');
       }
      });
     
    }else{
      me.current.save();
      me.flip_frame();
      me.next_task();
    }
  },
  update_meta: function(){
    $('#current_money').transition({
      opacity: 0,
      scale: 1.6
    }).html("Rs. " + this.model.attributes.meta.reward).transition({
      opacity: 1,
      scale: 1
    });
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
