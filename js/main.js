$(document).ready(function(){
  setup_ui();
  fill_random_crns(); // just for demo purposes

  var handler = new APIHandler();

  $('#search').keyup(function() {
    search_string = $('#search').val();
    var category = $('#course-list').find(":selected").attr('value');
    if (category != "") {
      handler.search_stored_courses(category, search_string, function(courses) {
        update_courses(courses);
      });
    }
  });

  $( "#course-list" ).change(function() {
    var category = $('#course-list').find(":selected").attr('value');
    if (category == "") {
      $('#course-table').empty();
      $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
    } else {
      handler.get_course(category, function(courses, err) {
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
  $('#course-table').empty();
  for (i = 0; i < courses.length; i++) {
    $('#course-table').append("<div class=\"course-header\"> <span class=\"course-code\">" + courses[i]['category'] + " " + courses[i]['code'] + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/down.png\"> </div>");
    if (courses[i]['classes'] != null) { // handle case where theres no classes
      for (j = 0; j < courses[i]['classes'].length; j++) {
        $('#course-table').append("<div class=\"course-data\"> <span class=\"course-type\">"+ courses[i]['classes'][j]['type'] +" (<b class=\"fill-low\">" + courses[i]['classes'][j]['current'] + "</b>)</span> <img id=\"course-add-btn\" src=\"img/add_outline.png\"> <div class=\"time-info\"> <span class=\"course-days\">" + courses[i]['classes'][j]['days'] + "</span> <span class=\"course-times\">" + courses[i]['classes'][j]['times'] + "</span> </div> </div>");
      }
    }
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

    // table drop down
    var currentSelectedRow = null;
    $('#course-table').on('click', '.course-header', function() {
      console.log('did click');
      if (!currentSelectedRow) {
        // no row selected
        currentSelectedRow = this;
        $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
        $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.png');
      } else {
        if (currentSelectedRow === this) {
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.png');
          currentSelectedRow = null;
        } else {
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
