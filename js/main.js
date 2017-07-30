var handler = new APIHandler(); // global handler for API access
var scheduleHandler = new ScheduleHandler() // global handler for schedule access
var currentSelectedRow = null;
var search_string = null;

$(window).bind('beforeunload', function() {
   save_to_storage()
});

function load_storage() {
  // Schedule Handler
  var selected_courses_temp = localStorage.getItem("selected_courses");
  var course_colors_temp = localStorage.getItem("course_colors");
  var colors_temp = localStorage.getItem("colors");

  selected_courses_temp = JSON.parse(selected_courses_temp);
  course_colors_temp = JSON.parse(course_colors_temp);
  colors_temp = JSON.parse(colors_temp);

  if (selected_courses_temp != null && course_colors_temp != null && colors_temp != null) {
    scheduleHandler.selected_courses = selected_courses_temp;
    scheduleHandler.course_colors = course_colors_temp;
    scheduleHandler.colors = colors_temp;
  }

  // API Handler
  var stored_courses_temp = localStorage.getItem("stored_courses");
  stored_courses_temp = JSON.parse(stored_courses_temp);
  if (stored_courses_temp != null) {
    handler.stored_courses = stored_courses_temp;
  }
}

function save_to_storage() {
  // add's to storage object
  var selected_courses_temp = scheduleHandler.selected_courses;
  var course_colors_temp = scheduleHandler.course_colors;
  var colors_temp = scheduleHandler.colors;
  var stored_courses_temp = handler.stored_courses;

  selected_courses_temp = JSON.stringify(selected_courses_temp);
  course_colors_temp = JSON.stringify(course_colors_temp);
  colors_temp = JSON.stringify(colors_temp);
  stored_courses_temp = JSON.stringify(stored_courses_temp)

  localStorage.setItem("selected_courses", selected_courses_temp);
  localStorage.setItem("course_colors", course_colors_temp);
  localStorage.setItem("colors", colors_temp);
  localStorage.setItem("stored_courses", stored_courses_temp);

  // var stored_courses_temp = handler.stored_courses;
  // stored_courses_temp = JSON.stringify(stored_courses_temp);
  // localStorage.setItem("stored_courses", stored_courses_temp);
}

function clear_storage() {
  localStorage.clear();
  handler.stored_courses = {};
  scheduleHandler.selected_courses = {};
  scheduleHandler.course_colors = {};
  scheduleHandler.colors = ["blue", "red", "green", "purple", "yellow", "grey"];
}

$(document).ready(function(){
  setup_ui();
  // fill_random_crns(); // just for demo purposes
  load_storage();
  setup_schedule();


  var category = decodeURIComponent(window.location.search.substring(1));
  handler.update_category(category);
  if (category == "") {
    $('#course-table').empty();
    $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
  } else {
    handler.get_course(function(courses, err) {
      if (err == -1) {
        $('#course-table').empty();
        $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
      } else {
        $("#course-list").val(category.toUpperCase());
        update_courses(courses);
      }
    });
  }

  $('#search').keyup(function() {
    search_string = $('#search').val();
    var category = $('#course-list').find(":selected").attr('value');
    if (category != "") {
      handler.search_stored_courses(search_string, function(courses) {
        update_courses(courses);
      });
    }
  });

  $( "#course-list" ).change(function() {
    currentSelectedRow = null;
    var category = $('#course-list').find(":selected").attr('value');
    history.pushState(null, null, "?" + category.toLowerCase());
    handler.update_category(category);
    if (category == "") {
      $('#course-table').empty();
      $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
    } else {
      handler.get_course(function(courses, err) {
        if (err == -1) {
          $('#course-table').empty();
          $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
        } else {
          update_courses(courses);
        }
      });
    }
  });
});

function update_courses(courses) {
  $('#course-table').css("display", "none")
  $('#course-table').empty();
  if (courses != undefined) {
    for (i = 0; i < courses.length; i++) {

      var cat_code = courses[i]['category'] + " " + courses[i]['code'];
      if ($(currentSelectedRow).find('.course-code').text() == cat_code) {
        // a little bit of a 'hack' to replace the currentselectedrow variable
        var s = "<div class=\"course-header\"> <span class=\"course-code\">" + cat_code + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/up.svg\"> </div>"
        var d = document.createElement('div');
        d.innerHTML = s;
        var header = d.firstChild;
        $('#course-table').append(header);
        currentSelectedRow = header;
      } else {
        $('#course-table').append("<div class=\"course-header\"> <span class=\"course-code\">" + cat_code + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/down.svg\"> </div>");
      }

      if (courses[i]['classes'] != null) { // handle case where theres no classes
        for (j = 0; j < courses[i]['classes'].length; j++) {
          var course_element = "";

          // determine if it's under a selected header (for table reload)
          if ($(currentSelectedRow).find('.course-code').text() == cat_code) {
            course_element = "<div style=\"display:block; "
          } else {
            course_element = "<div style=\""
          }

          // determine if it or its siblings are selected and handle accordingly
          var selected_code = scheduleHandler.is_class_selected(cat_code, courses[i]['classes'][j]['id'], courses[i]['classes'][j]['type']);
          var fill_percentage = Math.round((parseInt(courses[i]['classes'][j]["current"]) / parseInt(courses[i]['classes'][j]["max"])) * 100)
          var fill_color = "fill-low"

          if (fill_percentage > 66) {
            fill_color = "fill-high"
          } else if (fill_percentage > 33 && fill_percentage < 66) {
            fill_color = "fill-med"
          } else {
            fill_color = "fill-low"
          }
          var fill_percentage_str = ""
          if (fill_percentage == 100) {
            fill_percentage_str = "FULL"
          } else {
            fill_percentage_str = fill_percentage.toString() + "%"
          }

          if (selected_code == -2) {
            // course element is already selected
            course_element += " background-color: #E7E7E9;\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\""+ fill_color +"\">" + fill_percentage_str + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_checked.svg\"><div class=\"time-info-container\">"
          } else if (selected_code == -1) {
            // course type is already selected
            course_element += "\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\""+ fill_color +"\">" + fill_percentage_str + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_disabled.svg\"><div class=\"time-info-container disable\">"
          } else {
            // nothing
            course_element += "\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\""+ fill_color +"\">" + fill_percentage_str + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_outline.svg\"><div class=\"time-info-container\">"
          }

          // handle multiple dates
          for (k = 0; k < courses[i]['classes'][j]['days'].length; k++) {
            course_element += "<div class=\"time-info\"><span class=\"course-days\">" + courses[i]['classes'][j]['days'][k] + "</span><span class=\"course-times\">" + courses[i]['classes'][j]['times'][k] + "</span></div>"
          }

          course_element += "</div></div>"

          $('#course-table').append(course_element);
        }
      }
    }
  } else {
    $('#course-table').empty();
    $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
  }
  $('#course-table').css("display", "table")
}

function reload_table() {
  if (search_string != null && search_string != "") {
    search_string = $('#search').val();
    var category = $('#course-list').find(":selected").attr('value');
    if (category != "") {
      handler.search_stored_courses(search_string, function(courses) {
        update_courses(courses);
      });
    }
  } else {
    handler.get_course(function(courses, err) {
      if (err == -1) {
        $('#course-table').empty();
        $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
      } else {
        update_courses(courses);
      }
    });
  }
}

function setup_ui() {
  $(".timeline ul li").hover(function() {
    $(this).addClass('focus');
  }, function() {
    $(this).removeClass('focus');
  })

  var selected_navigation = $(".nav-item.selected")
  $(".nav-item").hover(
    function() {
      selected_navigation.removeClass("selected");
    }, function() {
      selected_navigation.addClass("selected");
    })

  // Selected semester hover animation
  var selected_semester = $(".sem-item.selected")
  $( ".sem-item" ).hover(
    function() {
      selected_semester.removeClass("selected");
    }, function() {
      selected_semester.addClass("selected");
    })

    $( ".sem-item" ).click(function() {
      selected_semester.removeClass("selected");
      selected_semester = $(this);
      selected_semester.addClass("selected");
    });

    // mobile menu item
    $(".menu").click(function() {
      $("#nav-container").slideToggle(300);
    });

    // course crn reload
    $(".course-crns .course-table-header .tool-tip-container > img").click(function() {
      scheduleHandler.reload_crns();
    })

    // table image hover
    $("#course-table").on("mouseenter", '.course-data #course-add-btn', function() {
        if ($(this).attr('src') == 'img/add_outline.svg') {
          $(this).attr('src', "img/add_fill.svg");
        }
    });
    $("#course-table").on("mouseleave", '.course-data #course-add-btn', function() {
        if ($(this).attr('src') == "img/add_fill.svg") {
          $(this).attr('src', "img/add_outline.svg");
        }
    });

    $("#course-table").on("click", '.course-data #course-add-btn', function() {
      // need to reload table to disable other classes of same type if success
      if ($(this).attr('src') == 'img/add_checked.svg') {
        var cat_code = $(this).parent().attr('course');
        var id = $(this).parent().attr('class-id');
        var err = scheduleHandler.remove_class_with_id(cat_code, id);
        if (err != -1) {
          $(".class-m[class_id=\"" + id + "\"]").remove();
          reload_table()
        }
      } else if ($(this).attr('src') == 'img/add_disabled.svg') {
        $(this).effect("shake", { times:1, distance: 3 }, 100);
        $(this).css("opacity", "0.85");
        var selected_class = $(this).parent().attr('class-id');
        scheduleHandler.add_class_to_schedule(selected_class); // just to trigger notification
      } else {
        var selected_class = $(this).parent().attr('class-id');
        var err = scheduleHandler.add_class_to_schedule(selected_class);
        if (err != -1) {
          reload_table();
        }
      }
    });

    // table drop down
    $('#course-table').on('click', '.course-header', function() {
      if (!currentSelectedRow) {
        // no row selected
        currentSelectedRow = this;
        $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
        $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.svg');
      } else {
        if ($(currentSelectedRow).find('.course-code').text() === $(this).find('.course-code').text()) {
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.svg');
          currentSelectedRow = null;
        } else {
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.svg');
          currentSelectedRow = this;
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.svg');
        }
      }
    });
}

function fill_random_crns() {
  var wcrns = [];
  var fcrns = [];
  // fill fake CRN's
  for (i = 0; i < 6; i++) {
    var new_crn_w = Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000;
    wcrns.push(new_crn_w);
    var new_crn_f = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
    fcrns.push(new_crn_f);
  }

  // populate fall crns
  for (i=0; i < fcrns.length; i++) {
    if (i == fcrns.length - 1) {
      $("#fall").val($('#fall').val() + fcrns[i]);
    } else {
      $("#fall").val($('#fall').val() + fcrns[i] + ", ");
    }
  }

  // populate winter crns
  for (i=0; i < wcrns.length; i++) {
    if (i == wcrns.length - 1) {
      $("#winter").val($('#winter').val() + wcrns[i]);
    } else {
      $("#winter").val($('#winter').val() + wcrns[i] + ", ");
    }
  }
}
