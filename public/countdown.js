/**
 * @name        jQuery Countdown Plugin
 * @author      Martin Angelov
 * @version     1.0
 * @url         http://tutorialzine.com/2011/12/countdown-jquery/
 * @license     MIT License
 */
 /*
 * @modified_by: RohitRox
   @url        : https://github.com/RohitRox/jQuery-Countdown
   @changelog  : added countdown reset feature, hookable exipre_after feature
 */

(function($){
    
    // Number of seconds in every time division
    var days    = 24*60*60,
        hours   = 60*60,
        minutes = 60,
        _timer_handle,
        this_id,
        time_god = 0;

    $.countdown = function(){
        return{
            reset : function(fn){ 
                clearTimeout(_timer_handle);  
                elapsed = time_god;
                time_god = 0;
                if (typeof fn == 'function'){
                    fn(elapsed);
                }
            }
        }
    }();

    // Creating the plugin
    $.fn.countdown = function(prop, hook){
        
        var options = $.extend({
            callback    : null,
            timestamp   : 0,
            expire_after : null // in seconds
        },prop);
        
        var left, d, h, m, s, positions;
        var self = this;
        this_id = self.attr('id');
        // Initialize the plugin
        _init(self, options);

        if (options.expire_after != null){
            options.timestamp = (new Date()).getTime() + options.expire_after*1000;
        }

        function tick(){
        // Time left
        left = Math.floor((options.timestamp - (new Date())) / 1000);
        var left_total = left;
        time_god += 1;     
        if(left < 0){
            left = 0;
            if (typeof hook == 'function')
            {   
                hook();
                return;
            }
        }
        else{

        // Number of days left
        d = Math.floor(left / days);
        _updateDuo(0, 1, d);
        left -= d*days;

        // Number of hours left
        h = Math.floor(left / hours);
        _updateDuo(2, 3, h);
        left -= h*hours;

        // Number of minutes left
        m = Math.floor(left / minutes);
        _updateDuo(4, 5, m);
        left -= m*minutes;

        // Number of seconds left
        s = left;
        _updateDuo(6, 7, s);

        // Calling an optional user supplied callback
        if ( typeof options.callback == 'function' ){
        options.callback(d, h, m, s, left_total);
        }
        // Scheduling another call of this function in 1s
        _timer_handle = setTimeout(tick, 1000);
        }
        }
        tick();
        return this;
    };

    function _init(elem, options)
    {   
        $.countdown.reset();
        elem.html('');
        elem.addClass('countdownHolder');

        // Creating the markup inside the container
        $.each(['Days','Hours','Minutes','Seconds'],function(i){
            $('<span class="count'+this+'">').html(
                '<span class="position">\
                    <span class="digit static">0</span>\
                </span>\
                <span class="position">\
                    <span class="digit static">0</span>\
                </span>'
            ).appendTo(elem);
            
            if(this!="Seconds"){
                elem.append('<span class="countDiv countDiv'+i+'"></span>');
            }
        });
    }

    _updateDuo = function(minor,major,value)
                {
                    positions = $('#'+this_id).find('.position');
                    _switchDigit(positions.eq(minor),Math.floor(value/10)%10);
                    _switchDigit(positions.eq(major),value%10);
                }
    _switchDigit = function(position,number)
                {
    
                    var digit = position.find('.digit')
                    
                    if(digit.is(':animated')){
                        return false;
                    }
                    
                    if(position.data('digit') == number){
                        // We are already showing this number
                        return false;
                    }
                    
                    position.data('digit', number);
                    
                    var replacement = $('<span>',{
                        'class':'digit',
                        css:{
                            top:'-2.1em',
                            opacity:0
                        },
                        html:number
                    });
                    
                    // The .static class is added when the animation
                    // completes. This makes it run smoother.
                    
                    digit
                        .before(replacement)
                        .removeClass('static')
                        .animate({top:'2.5em',opacity:0},'fast',function(){
                            digit.remove();
                        })

                    replacement
                        .delay(100)
                        .animate({top:0,opacity:1},'fast',function(){
                            replacement.addClass('static');
                        });
                }
})(jQuery);