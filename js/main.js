var handler = new APIHandler(); // global handler for API access
var scheduleHandler = new ScheduleHandler() // global handler for schedule access
var currentSelectedRow = null;

$(document).ready(function(){
  setup_ui();
  // fill_random_crns(); // just for demo purposes
  setup_schedule();

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
        var s = "<div class=\"course-header\"> <span class=\"course-code\">" + cat_code + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/up.png\"> </div>"
        var d = document.createElement('div');
        d.innerHTML = s;
        var header = d.firstChild;
        $('#course-table').append(header);
        currentSelectedRow = header;
      } else {
        $('#course-table').append("<div class=\"course-header\"> <span class=\"course-code\">" + cat_code + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/down.png\"> </div>");
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
          if (selected_code == -2) {
            // course element is already selected
            course_element += " background-color: #E7E7E9;\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\"fill-low\">" + courses[i]['classes'][j]["current"] + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_checked.png\"><div class=\"time-info-container\">"
          } else if (selected_code == -1) {
            // course type is already selected

            course_element += "\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\"fill-low\">" + courses[i]['classes'][j]["current"] + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_disabled.png\"><div class=\"time-info-container disable\">"
          } else {
            // nothing
            course_element += "\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\"fill-low\">" + courses[i]['classes'][j]["current"] + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_outline.png\"><div class=\"time-info-container\">"
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
  }
  $('#course-table').css("display", "table")
}

function reload_table() {
  handler.get_course(function(courses, err) {
    if (err == -1) {
      $('#course-table').empty();
      $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
    } else {
      update_courses(courses);
    }
  });
}

function setup_schedule() {
  $(".courses-full > ul").on('click', '.class-m > #remove-class', function() {
    var cat_code = $(this).parent().attr('course');
    var id = $(this).parent().attr('class_id');
    var err = scheduleHandler.remove_class_with_id(cat_code, id);
    if (err != -1) {
      $(".class-m[class_id=\"" + id + "\"]").remove();
      reload_table()
    }
  });
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

    // table image hover
    $("#course-table").on("mouseenter", '.course-data #course-add-btn', function() {
        if ($(this).attr('src') == 'img/add_outline.png') {
          $(this).attr('src', "img/add_fill.png");
        }
    });
    $("#course-table").on("mouseleave", '.course-data #course-add-btn', function() {
        if ($(this).attr('src') == "img/add_fill.png") {
          $(this).attr('src', "img/add_outline.png");
        }
    });
    $("#course-table").on("click", '.course-data #course-add-btn', function() {
      // need to reload table to disable other classes of same type if success
      if ($(this).attr('src') == 'img/add_checked.png') {
        var cat_code = $(this).parent().attr('course');
        var id = $(this).parent().attr('class-id');
        var err = scheduleHandler.remove_class_with_id(cat_code, id);
        if (err != -1) {
          $(".class-m[class_id=\"" + id + "\"]").remove();
          reload_table()
        }
      } else if ($(this).attr('src') == 'img/add_disabled.png') {
        $(this).effect("shake", { times:1, distance: 3 }, 100);
        $(this).css("opacity", "0.85");
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
        console.log('1')
        // no row selected
        currentSelectedRow = this;
        $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
        $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.png');
      } else {
        if ($(currentSelectedRow).find('.course-code').text() === $(this).find('.course-code').text()) {

          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.png');
          currentSelectedRow = null;
        } else {
          console.log('3')
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.png');
          currentSelectedRow = this;
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.png');
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
