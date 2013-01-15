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
      log('-------------------');
      log(me.model.attributes);
      log(me.model.get('inputs'));
      log("#####################");
      var render = Mustache.to_html(data_container.innerHTML, me.model.get('inputs'));
      data_container.innerHTML = render;
      auto_resize_task_iframe(frame);
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
        position : 'bottom-right',
        type     : me.model.get('note').status //success, notice, warning, error
      });
    }
  },
  post_and_render: function(data){
    var me = this;
    me.current.output = data.output;
    var tmp_task = new Main(me.current);
    if(me.current.gold){
      $.facebox('<h2>You just did a spot check.</h2>We are checking your answers...please wait...<br />');
      tmp_task.save();
      $.countdown.reset();
      var str = unescape(tmp_task.attributes.spotboy);
      eval(Opal.Opal.Parser.$new().$parse(str));
      var op = JSON.parse( Opal.top.$validate(JSON.stringify( tmp_task.attributes.output )) );
      this.render_spot_check(op);
      $('#facebox .content').append('<br /><a href="#" id="continue" class="btn">Continue to work</a>');
     
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

