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
    this.add_to_html(cat_code, new_class[cat_code]); // adds to html
    return 0;
  } else {
    return -1;
  }
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
ScheduleHandler.prototype.is_class_selected = function(cat_code, id, type) {
  // 0 = none
  // -1 = type selected
  // -2 = type & ID selected
  if (this.selected_courses[cat_code] != undefined) {
    var selected_code = 0;
    for (k = 0; k < this.selected_courses[cat_code].length; k++) { // must be variable k because i interfers with main.js somehow (variable scope is confusing me in this project)
        if (this.selected_courses[cat_code][k]['id'] == id.toString()) {
          console.log(this.selected_courses[cat_code][k])
        }
    }
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
  if (Object.keys(this.selected_courses).length >= 6) {
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
  var selected_color = tile_colors[this.colors[rand]];
  this.colors.splice(rand, 1);
  return selected_color;
}

function add_class_to_day_html(day, cat_code, s_class, i) {
  var start = s_class['times'][i].split("-")[0];
  var end = s_class['times'][i].split("-")[1];

  $(".courses-full > ul").find("ul").eq(day).append("<li class=\"class-m\" data-start=\"" + start + "\" data-end=\"" + end + "\" course=\"" + cat_code + "\" class_id=\"" + s_class['id'] + "\"><img src=\"img/close.png\" id=\"remove-class\" alt=\"Remove\"><div class=\"class-m-info\"><span class=\"class-name\">" + cat_code + ": " + s_class['type'] + "</span><span class=\"class-time\">" + s_class['times'][i] + "</span></div></li>");
}

function setup_schedule() {
  $(".courses-full > ul").on('click', '.class-m > #remove-class', function() {
    $(this).parent().remove(); // keep this in for now
  });
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
      var duration = (end - start);

      var course_color = this.course_colors[s_class.attr("course")]
      s_class.css(course_color)

      var top = 29 + ((start / 30) * 25);
      var height = 44 + (((duration/30) - 2)* 26);
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
