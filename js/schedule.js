function ScheduleHandler() {
  this.selected_courses = {};
}

ScheduleHandler.prototype.printSched = function() {
  console.log(this.selected_courses);
}

ScheduleHandler.prototype.add_class_to_schedule = function(class_id) {
  // STEPS ----------
  // 1. add to storage object
  // 2. add html
  // 3. reload table
  // 4. reload CRN's
  // ----------------

  var new_class = handler.get_class_with_id(class_id);
  var cat_code = Object.keys(new_class)[0];
  this.add_to_selected(cat_code, new_class[cat_code]); // adds to this.object's variable selected_courses
  this.add_to_html(cat_code, new_class[cat_code]); // adds to html
}

ScheduleHandler.prototype.add_to_html = function(cat_code, s_class) {
  for (i = 0; i < s_class['days'].length; i++) {
    if (s_class['days'][i].includes("MON")) {
        add_class_to_day(0, cat_code, s_class);
    }
    if (s_class['days'][i].includes("TUE")) {
      add_class_to_day(1, cat_code, s_class);
    }
    if (s_class['days'][i].includes("WED")) {
      add_class_to_day(2, cat_code, s_class);
    }
    if (s_class['days'][i].includes("THU")) {
      add_class_to_day(3, cat_code, s_class);
    }
    if (s_class['days'][i].includes("FRI")) {
      add_class_to_day(4, cat_code, s_class);
    }
  }
  place_classes();
}

function add_class_to_day(day, cat_code, s_class) {
  $(".courses-full > ul").find("ul").eq(day).append("<li class=\"class-m\" data-start=\"09:35\" data-end=\"10:25\" data-content=\"event-abs-circuit\" data-event=\"event-1\"><img src=\"img/close.png\" alt=\"Remove\"><div class=\"class-m-info\"><span class=\"class-name\">CSCI 1210: LEC</span><span class=\"class-time\">09:25 - 10:25</span></div></li>");
}
// add's to storage object
ScheduleHandler.prototype.add_to_selected = function(cat_code, s_class) {
  if (this.selected_courses[cat_code] == undefined) {
    this.selected_courses[cat_code] = [s_class];
  } else {
    var type_detected = false;
    for (i = 0; i < this.selected_courses[cat_code].length; i++) {
        if (this.selected_courses[cat_code][i]['type'] == s_class['type']) {
          type_detected = true;
        }
    }
    if (!type_detected)
      this.selected_courses[cat_code].push(s_class);
    else
      console.log('already have one of type: ' + s_class['type'])
  }
}

function setup_schedule() {
  $(".class-m > img").click(function() {
    place_classes();
  });
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
  }
}

function place_classes() {
  var ele = $(".courses-group");

  for (i = 0; i < ele.length; i++) {
    var classes = $(ele[i]).find("li");
    for (j = 0; j<classes.length; j++) {
      var s_class = $(classes[j]);
      var start = timestamp(s_class.attr("data-start"));
      var end = timestamp(s_class.attr("data-end"));
      var schedule_start = timestamp($(".timeline ul li").eq(0).find("span").text());
      // top = 13px is start
      console.log(schedule_start);
      start = start - schedule_start;
      end = end - schedule_start;
      var duration = (end - start);
      // random code -----------------------
      var rand = Math.floor((Math.random() * 3) + 1);
      if (rand == 1) {
        s_class.css(tile_colors["red"]);
      } else if (rand == 2) {
        s_class.css(tile_colors["blue"]);
      } else if (rand == 3) {
        s_class.css(tile_colors["green"]);
      }
      // ----------------------- random code
      var top = 29 + ((start / 30) * 25);
      var height = 44 + (((duration/30) - 2)* 26);
      console.log(tile_colors["blue"]);
      s_class.css({
      "top": top.toString() + "px",
      "height": height.toString() + "px"
      });

    }
  }
}

function timestamp(time) {
  // turns time into minutes
  time = time.replace(/ /g,'');
  var time_arr = time.split(':');
  var time_stamp = parseInt(time_arr[0])*60 + parseInt(time_arr[1]);
  return time_stamp;
}
