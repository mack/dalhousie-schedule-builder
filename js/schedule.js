function ScheduleHandler() {
  this.selected_courses = {};
  this.course_colors = {};
  this.colors = ["blue", "red", "green", "purple", "yellow", "grey"];
}

ScheduleHandler.prototype.add_class_to_schedule = function(class_id) {
  // STEPS ----------
  // 1. add to storage object
  // 2. add html
  // 3. color
  // 3. reload table
  // 4. reload CRN's
  // ----------------

  var new_class = handler.get_class_with_id(class_id);
  var cat_code = Object.keys(new_class)[0];
  var err = this.add_to_selected(cat_code, new_class[cat_code]); // adds to this.object's variable selected_courses
  if (err != -1) {
    this.add_to_crns(new_class[cat_code]['crn']);
    this.add_to_html(cat_code, new_class[cat_code]); // adds to html
    return 0;
  } else {
    return -1;
  }
}

ScheduleHandler.prototype.remove_crn = function(crn) {
  var crns = localStorage.getItem("crns_" + selected_semester_id);
  crns = JSON.parse(crns);
  var idx = crns.indexOf(crn)
  crns.splice(idx, 1);
  var crns_json = JSON.stringify(crns);
  localStorage.setItem("crns_" + selected_semester_id, crns_json);
  this.reload_crns();
}

ScheduleHandler.prototype.add_to_crns = function(crn) {
  var crns = localStorage.getItem("crns_" + selected_semester_id);
  crns = JSON.parse(crns);
  if (crns == null) {
    crns = [crn];
  } else {
    crns.push(crn);
  }

  var crns_json = JSON.stringify(crns);
  localStorage.setItem("crns_" + selected_semester_id, crns_json);
  this.reload_crns();
}

ScheduleHandler.prototype.reload_crns = function() {
  // fall

  var fall_crns = localStorage.getItem("crns_1");
  fall_crns = JSON.parse(fall_crns);
  fall_crns_txt = ""
  if (fall_crns != null) {
    for (var i = 0; i < fall_crns.length; i++) {
      if (i == 0) {
        fall_crns_txt = fall_crns[i];
      } else {
        fall_crns_txt += ", " + fall_crns[i]
      }
    }
  }
  $('#fall').val(fall_crns_txt);

  // winter
  var winter_crns = localStorage.getItem("crns_2");
  winter_crns = JSON.parse(winter_crns);
  winter_crns_txt = ""
  if (winter_crns != null) {
    for (var i = 0; i < winter_crns.length; i++) {
      if (i == 0) {
        winter_crns_txt = winter_crns[i];
      } else {
        winter_crns_txt += ", " + winter_crns[i]
      }
    }
  }
  $('#winter').val(winter_crns_txt);
}

ScheduleHandler.prototype.add_to_html = function(cat_code, s_class) {
  for (i = 0; i < s_class['days'].length; i++) {
    if (s_class['days'][i].includes("MON")) {
        add_class_to_day_html(0, cat_code, s_class, i);
    }
    if (s_class['days'][i].includes("TUE")) {
      add_class_to_day_html(1, cat_code, s_class, i);
    }
    if (s_class['days'][i].includes("WED")) {
      add_class_to_day_html(2, cat_code, s_class, i);
    }
    if (s_class['days'][i].includes("THU")) {
      add_class_to_day_html(3, cat_code, s_class, i);
    }
    if (s_class['days'][i].includes("FRI")) {
      add_class_to_day_html(4, cat_code, s_class, i);
    }
  }
  this.place_classes();
}

ScheduleHandler.prototype.load_selected_courses_into_html = function() {
  if (this.selected_courses != null) {
    var keys = Object.keys(this.selected_courses)
    for (var i = 0; i < keys.length; i++) {
      var cat_code = keys[i];
      for (var j = 0; j < this.selected_courses[cat_code].length; j++) {
        this.add_to_html(cat_code, this.selected_courses[cat_code][j]);
      }
    }
  }
}

ScheduleHandler.prototype.is_class_selected = function(cat_code, id, type) {
  // 0 = none
  // -1 = type selected
  // -2 = type & ID selected

  if (this.selected_courses != undefined && this.selected_courses[cat_code] != undefined) {
    var selected_code = 0;
    for (k = 0; k < this.selected_courses[cat_code].length; k++) { // must be variable k because i interfers with main.js somehow (variable scope is confusing me in this project)
        if (this.selected_courses[cat_code][k]['id'] == id.toString()) {
          return -2
        } else if (this.selected_courses[cat_code][k]['type'] == type) {
          selected_code = -1
        }
    }
    return selected_code;
  }
}

// add's to storage object
ScheduleHandler.prototype.add_to_selected = function(cat_code, s_class) {
  // Course without a scheduled time
  if (s_class['times'][0] == "C/D") {
    display_notification('We can\'t add C/D courses at this time. The CRN is: ' + s_class['crn'], "neutral");
    return -1;
  }
  // Has 6 courses selected
  if (Object.keys(this.selected_courses).length >= 6 && this.selected_courses[cat_code] == undefined) {
    display_notification('You\'ve reached the limit of courses (6)', "neutral");
    return -1;
  }
  // Already selected type
  if (this.selected_courses[cat_code] != undefined) {
    var type_detected = false;
    for (i = 0; i < this.selected_courses[cat_code].length; i++) {
        if (this.selected_courses[cat_code][i]['type'] == s_class['type']) {
          type_detected = true;
        }
    }
    if (type_detected) {
      display_notification('You already have a class of type: ' + s_class['type'], "neutral");
      return -1;
    }
  }
  // Overlapping times
  var conf = this.check_for_conflicts(s_class);
  if (conf != undefined) {
    var cat_code_conf = Object.keys(conf)[0];
    var times_conf = conf[cat_code_conf]
    display_notification('Course conflicts with ' + cat_code_conf + " " + times_conf, "neutral");
    return -1;
  }
  if (this.selected_courses[cat_code] == undefined) {
    this.course_colors[cat_code] = this.choose_rand_color()
    this.selected_courses[cat_code] = [s_class];
    return 0;
  } else {
    this.selected_courses[cat_code].push(s_class);
    return 0;
  }

}

var tile_colors = {
  "blue" : {
    "background-color": "#6BA3D9",
    "border": "1px solid #92BFEA",
    "box-shadow": "0 3px #3379A2, 0 0 0 1px #6BA3D9"
  },
  "red" : {
    "background-color": "#D96B6B",
    "border": "1px solid #F99696",
    "box-shadow": "0 3px #A23333, 0 0 0 1px #D96B6B"
  },
  "green" : {
    "background-color": "#57C86D",
    "border": "1px solid #6BE583",
    "box-shadow": "0 3px #23A338, 0 0 0 1px #57C86D"
  },
  "purple" : {
    "background-color": "#a56bd9",
    "border": "1px solid #d8adff",
    "box-shadow": "0 3px #8753b5, 0 0 0 1px #a56bd9"
  },
  "yellow" : {
    "background-color": "#ffb150",
    "border": "1px solid #ffcf94",
    "box-shadow": "0 3px #dc9740, 0 0 0 1px #ffb150"
  },
  "grey" : {
    "background-color": "#757575",
    "border": "1px solid #afafaf",
    "box-shadow": "0 3px #4a4a4a, 0 0 0 1px #757575"
  }
}

ScheduleHandler.prototype.choose_rand_color = function() {
  var rand = Math.floor((Math.random() * (this.colors.length - 1)) + 0);
  var selected_color = this.colors[rand];
  this.colors.splice(rand, 1);
  return selected_color;
}

function add_class_to_day_html(day, cat_code, s_class, i) {
  var start = s_class['times'][i].split("-")[0];
  var end = s_class['times'][i].split("-")[1];

  var title = handler.get_title_with_code(cat_code);

  $(".courses-full > ul").find("ul").eq(day).append("<div class=\'class-container\'><span class=\'class-container-text\' alt=\'" + s_class['crn'] + "\'>" + title + "</span><li class=\"class-m\" data-start=\"" + start + "\" data-end=\"" + end + "\" course=\"" + cat_code + "\" class_id=\"" + s_class['id'] + "\"><img src=\"img/close.svg\" id=\"remove-class\" alt=\"Remove\"><div class=\"class-m-info\"><span class=\"class-name\">" + cat_code + ": " + s_class['type'] + "</span><span class=\"class-time\">" + s_class['times'][i] + "</span></div></li></div>");
}

ScheduleHandler.prototype.remove_class_with_id = function(cat_code, id) {
  for (i = 0; i < this.selected_courses[cat_code].length; i++) {
    if (this.selected_courses[cat_code][i]['id'].toString() == id) {
      var crn = this.selected_courses[cat_code][i]['crn'];
      this.remove_crn(crn)
      this.selected_courses[cat_code].splice(i, 1);
      if (this.selected_courses[cat_code].length == 0) {
        this.colors.push(this.course_colors[cat_code]);
        delete this.course_colors[cat_code];
        delete this.selected_courses[cat_code];
      }

      return 0;
    }
  }
  return -1;
}

ScheduleHandler.prototype.place_classes = function() {
  var ele = $(".courses-group");

  for (i = 0; i < ele.length; i++) {
    var classes = $(ele[i]).find(".class-m");
    for (j = 0; j<classes.length; j++) {
      var s_class = $(classes[j]);
      var start = timestamp(s_class.attr("data-start"));
      var end = timestamp(s_class.attr("data-end"));
      var schedule_start = timestamp($(".timeline ul li").eq(0).find("span").text());
      // top = 13px is start
      start = start - schedule_start;
      end = end - schedule_start;
      var duration = ((end - start) + 10) / 60;

      var course_color = this.course_colors[s_class.attr("course")]
      s_class.css(tile_colors[course_color])

      var top = 29 + ((start / 30) * 25);

      var height = (50 * duration) - 10;

      var class_tip = s_class.parent().find('.class-container-text')

      class_tip.css({"top": (top - class_tip.height() - 20).toString() + "px"})

      s_class.css({
      "top": top.toString() + "px",
      "height": height.toString() + "px"
      });
    }
  }
}

function setup_schedule() {
  scheduleHandler.load_selected_courses_into_html();
  scheduleHandler.reload_crns();
  $(".courses-full > ul").on('click', '.class-m > #remove-class', function() {
    var cat_code = $(this).parent().attr('course');
    var id = $(this).parent().attr('class_id');
    var err = scheduleHandler.remove_class_with_id(cat_code, id);
    if (err != -1) {
      $(".class-m[class_id=\"" + id + "\"]").parent().remove();
      reload_table()
      scheduleHandler.reload_crns();

    }
  });

  $(".courses-full > ul").on("click", '.class-m', function(e) {
    if($(e.target).is('img')){
         e.preventDefault();
         return;
     }
    var bg = $(this).css('background-color')
    var cat_code = $(this).attr("course")
    // just need to write a function to retrieve the class title
    var title = handler.get_title_with_code(cat_code);
    var container_text = $(this).parent().find('.class-container-text')
    if (container_text.is(":visible")) {
      if (container_text.attr('alt') != "") {
        if (container_text.html().includes(container_text.attr('alt'))) {
          container_text.css("line-height", "normal")
          container_text.html(title)
        } else {
          container_text.css("line-height", container_text.height() + "px")
          container_text.html("CRN: " + container_text.attr('alt'))
        }
      }
    }

    $(this).parent().find('.class-container-text').fadeIn(10);
    $(this).parent().stop(true,true).effect( "bounce", {times:2, distance: 5}, 300 );
  })

  $(".courses-full > ul").on("mouseenter", '.class-m', function() {
    var current_rgb = $(this).css("background-color").replace("rgb(", "").replace(")","").split(",");
    var new_rgb = "rgb("
    for (var j = 0; j < 3; j++) {
      var int_rgb = Math.round(parseInt(current_rgb[j]) * 0.85);
      if (j == 2) {
        new_rgb += int_rgb.toString() + ")";
      } else {
        new_rgb += int_rgb.toString() + ",";
      }
    }
    var id = $(this).attr("class_id");
    $(".class-m[class_id=\"" + id + "\"]").css("background-color", new_rgb);
    $(this).find('#remove-class').css('display', "block");
  })
  $(".courses-full > ul").on("mouseleave", '.class-m', function() {
    var current_rgb = $(this).css("background-color").replace("rgb(", "").replace(")","").split(",");
    var new_rgb = "rgb("
    for (var j = 0; j < 3; j++) {
      var int_rgb = Math.round(parseInt(current_rgb[j]) / 0.85);
      if (j == 2) {
        new_rgb += int_rgb.toString() + ")";
      } else {
        new_rgb += int_rgb.toString() + ",";
      }
    }
    var id = $(this).attr("class_id");
    $(".class-m[class_id=\"" + id + "\"]").css("background-color", new_rgb);
    $(this).parent().find('.class-container-text').fadeOut(50);
    $(this).find('#remove-class').css('display', "none");
  })
}

ScheduleHandler.prototype.check_for_conflicts = function(s_class) {
  for (var i = 0; i < s_class['times'].length; i++) {
    var days = s_class['days'][i];
    var start = s_class['times'][i].split("-")[0];
    var end = s_class['times'][i].split("-")[1];
    days = days.split(", ")

    var keys = Object.keys(this.selected_courses)
    for (var j = 0; j < keys.length; j++) {
      for (var k = 0; k < this.selected_courses[keys[j]].length; k++) {
        var c_class = this.selected_courses[keys[j]][k];
        for (var l = 0; l < c_class['times'].length; l++) {

          var c_start = c_class['times'][l].split("-")[0];
          var c_end = c_class['times'][l].split("-")[1];
          var c_days = c_class['days'][l]
          if (c_start != undefined && c_end != undefined) {
            var conf_str = is_overlap(start, end, days, c_start, c_end, c_days);
            if (conf_str != undefined) {
              var obj = {};
              obj[keys[j]] = conf_str;
              return obj;
            }
          }
        }
      }
    }
  }
  return undefined;
}

function is_overlap(s_start, s_end, s_days, c_start, c_end, c_days) {
    for (var m = 0; m < s_days.length; m++) {
      if (c_days.includes(s_days[m])) {
        var s_start_time = timestamp(s_start),
            s_end_time = timestamp(s_end),
            c_start_time = timestamp(c_start),
            c_end_time = timestamp(c_end)

        if ( (s_start_time == c_start_time && s_end_time == c_end_time)  // equal
        || (c_start_time >= s_start_time && c_start_time <= s_end_time) // c_class starts during
        || (c_end_time >= s_start_time && c_end_time <= s_end_time) )  {// c_class ends during
            return "on " + s_days[m] + " at " + c_start + " to " + c_end + ".";
        }

      }
    }
    return undefined;
}

var last_timeout = null;
function display_notification(text, type, bg) {
  if (last_timeout != null) {
    clearTimeout(last_timeout);
    $('.schedule-notif').fadeOut(100, function() {
      display_notification_in_html(text, type, bg)
    });
  } else {
    display_notification_in_html(text, type, bg)
  }

  $('.schedule-notif').on("click", function() {
    clearTimeout(last_timeout);
    last_timeout = null;
    $(this).fadeOut(200);
  })
}

function display_notification_in_html(text, type, bg) {
  if (type == 'neg') {
    $('.schedule-notif').css("background-color", "#c13c3c")
    $('.schedule-notif > img').attr("src","img/delete.png");
  } else if (type == 'pos') {
    $('.schedule-notif').css("background-color", "#3cb33c")
    $('.schedule-notif > img').attr("src","img/add_notification.png");
  } else if (type == 'neutral') {
    $('.schedule-notif').css("background-color", "#989898")
    $('.schedule-notif > img').attr("src","img/block.svg");
  } else if (type == 'info') {
    $('.schedule-notif > img').attr("src","img/info.svg");
    if (bg != null) {
      $('.schedule-notif').css("background-color", bg)
    }
  }
  $('.schedule-notif > span').html(text);
  $('.schedule-notif').fadeIn(350);

  last_timeout = setTimeout(function() {
    $('.schedule-notif').fadeOut(350);
    last_timeout = null;
  }, 3000);
}

function timestamp(time) {
  // turns time into minutes
  if (time != null) {
    time = time.replace(/ /g,'');
    var time_arr = time.split(':');
    var time_stamp = parseInt(time_arr[0])*60 + parseInt(time_arr[1]);
    return time_stamp;
  }
}
