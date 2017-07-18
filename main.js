$(document).ready(function(){
  setup_ui()

  var handler = new APIHandler();

  $( "#course-list" ).change(function() {
    var category = $('#course-list').find(":selected").attr('value');
    $('#course-table-container').empty();
    handler.get_course(category, function(courses) {
      for (i = 0; i < courses.length; i++) {
        $('#course-table-container').append("<div class=\"course-header\"> <span class=\"course-code\">" + courses[i]['category'] + " " + courses[i]['code'] + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/down.png\"> </div>");
        if (courses[i]['classes'] != null) { // handle case where theres no classes
          for (j = 0; j < courses[i]['classes'].length; j++) {
            $('#course-table-container').append("<div class=\"course-data\"> <span class=\"course-type\">"+ courses[i]['classes'][j]['type'] +" (<b class=\"fill-low\">" + courses[i]['classes'][j]['current'] + "</b>)</span> <img id=\"course-add-btn\" src=\"img/add_outline.png\"> <div class=\"time-info\"> <span class=\"course-days\">" + courses[i]['classes'][j]['days'] + "</span> <span class=\"course-times\">" + courses[i]['classes'][j]['times'] + "</span> </div> </div>");
          }
        }
      }
    });
  });

});

function setup_ui() {
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
    $('#course-table-container').on('click', '.course-header', function() {
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
