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
    this.reload_crns();
    this.add_to_html(cat_code, new_class[cat_code]); // adds to html
    return 0;
  } else {
    return -1;
  }
}

ScheduleHandler.prototype.reload_crns = function() {
  fall_crn = ""
  var keys = Object.keys(this.selected_courses)
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < this.selected_courses[keys[i]].length; j++) {
      var c_crn = this.selected_courses[keys[i]][j]['crn'];
      if (fall_crn == "") {
        fall_crn = c_crn.toString();
      } else {
        fall_crn += ", " + c_crn.toString();
      }
    }
  }
  $('#fall').val(fall_crn);
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
  if (this.selected_courses != undefined) {
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
  // if (this.selected_courses[cat_code] != undefined) {
  //   var selected_code = 0;
  //   for (i = 0; i < this.selected_courses[cat_code].length; i++) {
  //   //  console.log(this.selected_courses[cat_code][i])
  //     if (this.selected_courses[cat_code][i]['id'] == id.toString()) {
  //       console.log(this.selected_courses[cat_code][i])
  //     }
  //       // if (this.selected_courses[cat_code][i]['type'] == s_class['type']) {
  //       //   type_detected = true;
  //       // }
  //   }
    // console.log(cat_code)
    // console.log(id)
    // console.log(type)

  //}
}
// add's to storage object
ScheduleHandler.prototype.add_to_selected = function(cat_code, s_class) {
  if (Object.keys(this.selected_courses).length >= 6 && this.selected_courses[cat_code] == undefined) {
    display_notification('You\'ve reached the limit of courses (6)', "neutral");
    return -1;
  }
  if (this.selected_courses[cat_code] == undefined) {
    this.course_colors[cat_code] = this.choose_rand_color()
    this.selected_courses[cat_code] = [s_class];
  } else {
    var type_detected = false;
    for (i = 0; i < this.selected_courses[cat_code].length; i++) {
        if (this.selected_courses[cat_code][i]['type'] == s_class['type']) {
          type_detected = true;
        }
    }
    if (!type_detected) {
      this.selected_courses[cat_code].push(s_class);
      return 0;
    } else {
      display_notification('You already have a class of type: ' + s_class['type'], "neutral");
      return -1;
    }
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

  $(".courses-full > ul").find("ul").eq(day).append("<li class=\"class-m\" data-start=\"" + start + "\" data-end=\"" + end + "\" course=\"" + cat_code + "\" class_id=\"" + s_class['id'] + "\"><img src=\"img/close.png\" id=\"remove-class\" alt=\"Remove\"><div class=\"class-m-info\"><span class=\"class-name\">" + cat_code + ": " + s_class['type'] + "</span><span class=\"class-time\">" + s_class['times'][i] + "</span></div></li>");
}

ScheduleHandler.prototype.remove_class_with_id = function(cat_code, id) {
  for (i = 0; i < this.selected_courses[cat_code].length; i++) {
    if (this.selected_courses[cat_code][i]['id'].toString() == id) {
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
      $(".class-m[class_id=\"" + id + "\"]").remove();
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
    var id = $(this).attr("class_id")
    // just need to write a function to retrieve the class title
    display_notification("CLASS TITLE HERE", "", true, bg);
  })

  $(".courses-full > ul").on("mouseenter", '.class-m', function() {
    $(this).find('#remove-class').css('display', "block");
  })
  $(".courses-full > ul").on("mouseleave", '.class-m', function() {
    $(this).find('#remove-class').css('display', "none");
  })
}

function check_for_conflicting_times() {

}

function display_notification(text, type, noImage, bg) {
  if (noImage == true) {
    $('.schedule-notif > img').css("display","none");
  } else {
    $('.schedule-notif > img').css("display","block");
  }
  if (type == 'neg') {
    $('.schedule-notif').removeClass().addClass('schedule-notif negative');
    $('.schedule-notif > img').attr("src","img/delete.png");
  } else if (type == 'pos') {
    $('.schedule-notif').removeClass().addClass('schedule-notif positive');
    $('.schedule-notif > img').attr("src","img/add_notification.png");
  } else if (type == 'neutral') {
    $('.schedule-notif').removeClass().addClass('schedule-notif neutral');
    $('.schedule-notif > img').attr("src","img/block.png");
  } else {
    if (bg != null) {
      $('.schedule-notif').removeClass().addClass('schedule-notif')
      $('.schedule-notif').css("background-color", bg)
    }
  }
  $('.schedule-notif > span').html(text);
  $('.schedule-notif').fadeIn(350);

  var timeOutId = null;
  timeOutId = setTimeout(function() {
    $('.schedule-notif').fadeOut(350);
  }, 2500);

  $('.schedule-notif').on("click", function() {
    clearTimeout(timeOutId);
    $(this).fadeOut(350);
  })
}

function timestamp(time) {
  // turns time into minutes
  time = time.replace(/ /g,'');
  var time_arr = time.split(':');
  var time_stamp = parseInt(time_arr[0])*60 + parseInt(time_arr[1]);
  return time_stamp;
}
