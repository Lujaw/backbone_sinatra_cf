// "use strict";

$(document).ready(function()
{
    var input_manager = function()
        {
            var self = this;
            self.debug = false;
            self.fuzzy_req = null;
            self.previous_selected_field = null;
            self.initialize_form();
            self.click_count = 1;
            self.click_limit = 6;
            self.isAutoCompleteSelected = false ;
            self.check_cookie();
        };

    input_manager.prototype.initialize_form = function()
    {
        var self = this;
        self.bind_events();
        self.bind_kbd_shortcuts();
        self.collapsable_instructions();

        // initialize facebox
        $('a[rel*=facebox]').facebox();


        /*hide the image until the button is pressed*/
        $("#previous_image").hide();
    };
    input_manager.prototype.bind_events = function()
    {
        var self = this;
        var autocomplete_first_name = {
            source: function(request, response)
            {
                $.ajax(
                {
                    url: "http://sprout-technology.com/clients/first_name.php",
                    dataType: "json",
                    data: {
                        term: request.term
                    },
                    success: function(data)
                    {
                        $('.ui-autocomplete').hide();
                        response($.map(data, function(item)
                        {
                            return {
                                label: item.label
                            };
                        }));
                    }
                });
            },

            minLength: 1,
            delay: 300,
            focus: function(event, ui)
            {
                $(event.target).val(ui.item.label);
                // HACK HACK: used this flag to prevent users from hitting "enter" while in auto complete.
                // Need to find a better solution
                self.isAutoCompleteSelected = true;
                return false;
            },
            select: function(event, ui)
            {
                $(event.target).val(ui.item.label);
                self.isAutoCompleteSelected = true;
                return false;
            }
        }; // End of autocomplete_first_name
        var autocomplete_last_name = {
            source: function(request, response)
            {
                $.ajax(
                {
                    url: "http://sprout-technology.com/clients/surname.php",
                    dataType: "json",
                    data: {
                        term: request.term
                    },
                    success: function(data)
                    {
                        $('.ui-autocomplete').hide();
                        response($.map(data, function(item)
                        {
                            return {
                                label: item.label,
                                value: item.value
                            };
                        }));
                    }
                });
            },
            minLength: 1,
            delay: 300,
            focus: function(event, ui)
            {
                $(event.target).val(ui.item.label);
                self.isAutoCompleteSelected = true;
                return false;
            },
            select: function(event, ui)
            {
                $(event.target).val(ui.item.label);
                self.isAutoCompleteSelected = true;
                return false;
            }
        }; // End of autocomplete_last_name
        // AUTO-COMPLETION
        $("#first_name").focus(function()
        {
            $('.ui-autocomplete').hide();
            $(this).autocomplete(autocomplete_first_name);
            self.isAutoCompleteSelected = false;
        });

        $("#last_name").focus(function()
        {
            $('.ui-autocomplete').hide();
            $(this).autocomplete(autocomplete_last_name);
                self.isAutoCompleteSelected = false;

        });

        $("#middle_name").focusout(function()
        {
            $(this).val($(this).val().toUpperCase());
        });

        $("#submit_btn").click(function()
        { /*To close the instruction before submission*/
            if ($("h3.btn-showhide").hasClass("open"))
            {
                $(".btn-showhide>a").click();
            }
            self.submit_values();

        });

        $("#fuzzy_search input").on("click", function()
        {
            $(self.previous_selected_field).val($(this).val());
            $(self.previous_selected_field).focus();
        });


        /*TO hide the fuzzy input when other fields are focused*/
        $("input:not(#first_name):not(#last_name):not(.fuzzy_opts)").focus(function()
        {
            // $("#fuzzy_search").hide();
        });


        //shortcuts for the  unreadable and same as previous
        $(".name").focusout(function()
        {
            switch ($(this).val().trim())
            {
            case "-":
                if ($(this).is("#last_name")) $(this).val("<SAMEASPREVIOUS>");
                break;
            }
            if ($(this).val() != "" && $(this).val() != "<UNREADABLE>" && $(this).val() != "<SAMEASPREVIOUS>")
            {
                self.fuzzy_search($(this), $(this).attr('id'));
            }
            $(this).val($(this).val().trim());
        });

        // only allow alphabets
        $('#last_name ').keyup(function()
        {
            var raw_text = $(this).val();
            var return_text = raw_text.replace(/[^a-zA-Z\-]/g, '');
            $(this).val(return_text);
        });

        $('#middle_name,  #first_name').keyup(function()
        {
            var raw_text = $(this).val();
            var return_text = raw_text.replace(/[^a-zA-Z]/g, '');
            $(this).val(return_text);
        });

        $('#age').keyup(function()
        {
            var raw_text = $(this).val();
            var return_text = raw_text.replace(/[^0-9 .m M  \- ]/g, '');
            $(this).val(return_text);
        });


        $("#age").focus();

        // $("#age").one("focusout", function(){
        //     $("#age").unbind("focus");
        // });




        // To display the tooltip on age tip hover
        $("#age_tip").tipTip(
        {
            activation: "hover",
            maxWidth: 700,
            defaultPosition: "bottom",
            fadeIn: 100,
            content: "<ul class='age_tooltip'><li>Age may be written as a whole number (e.g.: 5) or as a fraction (e.g.: 6 1/12).</li><li>The fraction denotes the months (e.g.: 6 1/12 means 6 years 5 months)</li><li> Capture the months only if the age is less than 1.</li><li>Examples:  2 1/12 => 2   And  5/12 => 5m</li></ul>"
        });

        /*buttons for skipping the task */
        $("#btn_unreadable").click(function()
        {
            self.skip_task();
        });

        $("#btn_noname").click(function()
        {
            self.flag_task();
        });


        /*to show previous images*/
        $("#show_pvs_image").click(function()
        {
            if (self.click_count < self.click_limit)
            {
                self.show_previous_image();
            }
            //increment the click counter
            self.click_count++;

        });

        $("#last_name, #first_name").focusout(function()
        {
            if ($("#age").val())
            {
                self.validate_name_by_age($(this).val());
            }
        });

        //To change the symbol in the instruction button
        $(".btn-showhide>a").on("click", function()
        {
            var string = ($(this).html() == "â†‘ INSTRUCTIONS") ? "â†“ INSTRUCTIONS" : "â†‘ INSTRUCTIONS";
            $(this).html(string)
        });
    };


    input_manager.prototype.submit_values = function()
    {
        var self = this;

        if (self.validate())
        {
            top.CF.submit();
        }
        else
        {
            self.focus_empty_input();
            // alert("Please enter the name and the age.");
            return false;
        }
    };

    input_manager.prototype.validate = function()
    {
        var self = this;
        var validated = true;

        if (($("#last_name").val() == "" || $("#first_name").val() == ""))
        {
            validated = false;
        }
        if ($("#age").val() == "" || $("#age").val() < 0 || $("#age").val() >= 150)
        {
            validated = false;
        }
        return validated;

    };

    input_manager.prototype.fuzzy_search = function(el, cat)
    {
        var self = this;
        var target = (cat == "first_name") ? "http://clientsp.sproutify.com/first_names.js" : "http://clientsp.sproutify.com/last_names.js";

        if (self.fuzzy_req != null)
        {
            self.fuzzy_req.abort();
        }
        self.fuzzy_req = $.ajax(
        {
            url: target,
            dataType: "jsonp",
            data: {
                search: el.val()
            },
            success: function(data)
            {
                var best_guess = $.map(data, function(term)
                {
                    return (
                    {
                        label: term.name
                    });
                }).slice(0, 3);
                $("#fuzzy_search").html("<span>Dont think your answer for " + $(el).attr('data-name') + " was correct? Click one of these to replace yours.</span>");
                best_guess.forEach(function(bgs)
                {
                    $("#fuzzy_search").append('<div class="fuzzy-box"><label><input type="radio" class ="fuzzy_opt" name="fuzz" value="' + bgs.label + '"/>' + bgs.label + '</label></div>');
                });
                if (best_guess.length > 0)
                {
                    y_fuzzy = $(el).offset().top - 30;
                    x_fuzzy = $(el).offset().left + 250;
                    $("#fuzzy_search input").each(function()
                    {
                        if ($(this).val().toUpperCase() == $(el).val().toUpperCase())
                        {
                            $(this).addClass("fuzzy_match");
                        }
                    });

                    $("#fuzzy_search").show();
                    self.previous_selected_field = $(el);
                }
                else
                {
                    $("#fuzzy_search").hide();
                }
            }
        });

    };

    //assign keyboard shortcuts
    input_manager.prototype.bind_kbd_shortcuts = function()
    {
        var self = this;
        var isCtrl = false,
            isShift = false,
            numeric_key_codes = [49, 50, 51];

        $(document).keyup(function(e)
        {
            if (e.which === 16) isShift = false;
            if (e.which === 17) isCtrl = false;
        }).keydown(function(e)
        {
            if (e.which === 16) isShift = true;
            if (e.which === 17) isCtrl = true;

            if (e.which === 13 && isCtrl && !isShift)
            { // Ctrl + Enter for skipping the task
                self.skip_task();
            }

            else if (e.which === 13 && !isCtrl && isShift)
            { // Shift + Enter for flagging the task
                self.flag_task();
            }

            else if (e.which === 13 && !isCtrl && !isShift && self.isAutoCompleteSelected == false)
            { // Enter to submit the task
                self.submit_values();
            }

            else if ((e.which === 112 || e.which === 80) && isCtrl && isShift )
            { // shortcut to view previous image Ctrl + Shift + P
                $("#show_pvs_image").click();
            }
        });
    };

    //Skip the task
    input_manager.prototype.skip_task = function()
    {
        //Commented right now coz the 2.0 doesn't suport cross domain scripting
        // $(window.top.document).find("#wi_skip_btn").click();
        // parent.$('#wi_skip_btn').click();
        if (self.debug) console.log("Task skipped");
    };


    //Flag the task
    input_manager.prototype.flag_task = function()
    {
        //Commented right now coz the 2.0 doesn't suport cross domain scripting
        // $(window.top.document).find("#flag_task").click();
        // parent.$('#flag_task').click();
        if (self.debug) console.log("Task flagged");
    };


    //Show the previous name image
    input_manager.prototype.show_previous_image = function()
    {
        var self = this;

        previous_image = self.preloader();

        /*Preloads the image until the first image is reached then hide the link*/
        if (previous_image != "First Image")
        {
            var append_image = '<img class ="prv_img" id="previous_image' +self.click_count +'" src ="'+previous_image +'">';
            $(".prv_img_div").append(append_image);
            $(".prv_img_div").scrollTop($(".prv_img_div")[0].scrollHeight);
        }
        else
        {
            $("#show_pvs_image").hide();
        }

        //show the hidden image
        if ($("#previous_image").is(":hidden"))
        {
            $("#previous_image").show();
        }
    };

    //Preload the image for previous names
    input_manager.prototype.preloader = function()
    {
        var self = this;

        var current_image = $("#name_image").attr("src");

        var search_string = /Name[0-9]*/g;
        var matches = current_image.match(search_string);

        // nullify number if no match is found
        var numbers = (matches != null) ? matches[0].match(/\d+/) : 0;



        if ((numbers[0] - self.click_count) != 0)
        {
            var replace_string = "Name" + (parseInt(numbers, 10) - self.click_count);

            //match the search string
            var previous_img_string = "Name" + (parseInt(numbers, 10) - self.click_count);
            var prv_previous_img_string = "Name" + (parseInt(numbers, 10) - (self.click_count + 1));

            //Replace the numbers in the URL
            var previous_image = current_image.replace(search_string, previous_img_string);
            var prv_previous_image = current_image.replace(search_string, prv_previous_img_string);

            //Preload the previous image
            var imageObj = new Image();
            imageObj.src = prv_previous_image;


            return previous_image;
        }
        else
        {
            return "First Image";
        }
    };


    //Make the instructions collapsible
    input_manager.prototype.collapsable_instructions = function()
    {
        self = this;
        $("#hint-instruction").collapse(
        {
            open: function()
            {
                this.addClass("open");
                this.css(
                {
                    height: "151px"
                });
            },
            close: function()
            {
                this.css(
                {
                    height: "0px"
                });
                this.removeClass("open");
            },
            persist: true
        });

    };

    //Place holder function for the validation to be provided for the Data Science team
    input_manager.prototype.validate_name_by_age = function(name)
    {
        if (self.debug) console.log("name validated->" + name);
        var decade = self.year;
        var age = $("#age").val();
    };

    input_manager.prototype.focus_empty_input = function()
    {
        self = this;
        current_active_element = document.activeElement;
        var priority_order = ["age", "last_name", "first_name", "middle_name"];
        priority_order.every(function(item)
        {
            if ( $("#" + item).val() == "")
            {
                $("#" + item).focus();
                return false;
            }
            else{
                return true;
            }
        });
    };


    input_manager.prototype.create_cookie = function(NameOfCookie, value, expiredays)
{

var ExpireDate = new Date ();
ExpireDate.setTime(ExpireDate.getTime() + (expiredays * 24 * 3600 * 1000));

document.cookie = NameOfCookie + "=" + escape(value) +
((expiredays == null) ? "" : "; expires=" + ExpireDate.toGMTString());
};


  input_manager.prototype.get_cookie = function(c_name)
  {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++)
    {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name)
        {
            return unescape(y);
        }
    }
  };

  input_manager.prototype.check_cookie = function()
  {
    var self = this;
    var isAgeHintShown = self.get_cookie("ageHint");
    console.log(isAgeHintShown);

    if (isAgeHintShown != null && isAgeHintShown != false)
    {
        console.log("age hint not shown this time. ");
    }
    else
    {
        self.create_cookie("ageHint", true, 365);
        console.log("age hint shown for first time ");
        //  display the tooltip on age field focus if it hasn't been shown before
        $("#age").tipTip(
        {
            activation: "focus",
            maxWidth: 700,
            defaultPosition: "bottom",
            fadeIn: 100,
            content: "<ul class='age_tooltip'><li>Age may be written as a whole number (e.g.: 5) or as a fraction (e.g.: 6 1/12).</li><li>The fraction denotes the months (e.g.: 6 1/12 means 6 years 5 months)</li><li> Capture the months only if the age is less than 1.</li><li>Examples: </li><li> 2 1/12 => 2  && 5/12 => 5m</li></ul>"
        });

    }
  };

    input_manager.prototype.delete_cookie = function(NameOfCookie)
    {
        var self = this;
// The function simply checks to see if the cookie is set.
// If so, the expiration date is set to Jan. 1st 1970.

if (self.get_cookie(NameOfCookie)) {
document.cookie = NameOfCookie + "=" +
"; expires=Thu, 01-Jan-70 00:00:01 GMT";
}
console.log("Cookie %d deleted", NameOfCookie);
}


window.input_man = new input_manager();
});