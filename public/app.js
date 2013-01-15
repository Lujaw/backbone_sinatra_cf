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
    var template = me.model.get('template');
    var src = '/'+template+'.html';
    var frame = document.createElement('iframe');
    frame.src = src;
    frame.className = 'render_frame';
    frame.style.display = 'none';
    document.getElementById('container').appendChild(frame);

    frame.onload = function(){
      var data_container = frame.contentDocument.getElementById('data_container');
      var render = Mustache.to_html(data_container.innerHTML, me.model.get('inputs'));
      data_container.innerHTML = render;
      auto_resize_task_iframe(frame);
      if ( typeof hook == "function"){ hook(me); }
      me.enable_skip();
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
        $('#progress_indicator').animate({width: '80%'}, 300);
        $('#tmp_loader').remove();
        $('.render_frame:first').addClass('current_task').show();

      }else{
        $('.render_frame.current_task').transition({
        perspective: '100px',
        rotateY: '360deg',
        opacity: 0 },
        function(){
          $('.render_frame.current_task').remove();
          $('.render_frame').fadeIn(200).addClass('current_task');
          
        });
      }
      this.timer(this.model.attributes.meta.assignment_duration);
    }
    this.disable_skip();
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
      me.model.clear();
      me.model.fetch({ success: function(){
          me.buffer_render();
          if( me.model.get('note') != undefined )
          {
            me.handle_notify(me.model.get('note').message, me.model.get('note').status);
          }
        }
      });
  },
  handle_notify: function(msg, status){
      $().toastmessage('showToast', {
        text     : msg,
        stayTime : 8000,
        sticky   : false,
        position : 'top-right',
        type     : status //success, notice, warning, error
      });
  },
  post_and_render: function(data){
    var me = this;
    me.current.output = data.output;
    var tmp_task = new Main(me.current);
    if(me.current.gold){
      tmp_task.save();
      $.countdown.reset();
      var str = unescape(tmp_task.attributes.spotboy);
      eval(Opal.Opal.Parser.$new().$parse(str));
      var op = JSON.parse( Opal.top.$validate(JSON.stringify( tmp_task.attributes.output )) );

      if (op.length == 0) {
        me.handle_notify('Congratulation! You just nailed down spot check. Keep it up.','success');
        me.flip_frame();
        me.next_task();
      }
      else{
        $.facebox('<h2>You just did a spot check.</h2><br />');
        this.render_spot_check(op);
        $('#facebox .content').append('<br /><a href="#" id="continue" class="btn">Continue to work</a>');
      }
    }else{
      tmp_task.save();
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
  },
  render_spot_check: function(op){
    var temp = _.template("<tr><td><%=field%></td><td><%=expected%></td><td><%=input%></td></tr>");
    var table = $($('#spot_check_table').html());
    var tbody = table.find('tbody');
    _.each(op, function(i){
      tbody.append(temp(i));
    });
    $('#facebox .content').append(table);
  },
  enable_skip: function(){
    $('#skip_link').animate({ opacity: 1},400).removeAttr('disabled');
  },
  disable_skip: function(){
    $('#skip_link').animate({ opacity: 0.4 },400).attr('disabled','disabled');
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

function auto_resize_task_iframe(el){
   var iframe = $(el),
   available_height = window.innerHeight,
   available_width = window.innerWidth - 40;
   try{
     iframe_content_height = iframe.contents().find("html").height(),
     iframe_content_width = iframe.contents().find("html").width();

       // if either of the dimensions of the iframe is 0, enable scrollbars in the iframe
       if(iframe_content_height === 0 || iframe_content_width === 0){
         iframe.attr('scrolling', 'yes');
       }

       // if the iframe content size is greater than the current size of the iframe, resize the iframe so it fits all the content
       iframe.height(Math.max(available_height, iframe_content_height));
       iframe.width(Math.max(available_width, iframe_content_width));
     }catch(e){
       iframe.attr('scrolling', 'yes');
     }
 }

