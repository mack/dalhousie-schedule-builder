$(document).ready(function(){
  // Navigation item hover animation
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

    // writting table course here just as a convience, will put in new file after
    $( "#course-list" ).change(function() {
      var conceptName = $('#course-list').find(":selected").attr('value');
      $('#course-table-container').empty();

      $.get( "http://localhost:8080/api/courses?s=" + conceptName, function( res ) {
        for (i = 0; i < res['data'].length; i++) {
          var courses = res['data'];

          $('#course-table-container').append("<div class=\"course-header\"> <span class=\"course-code\">" + courses[i]['category'] + " " + courses[i]['code'] + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/down.png\"> </div>");
          for (j = 0; j < courses[i]['classes'].length; j++) {

            $('#course-table-container').append("<div class=\"course-data\"> <span class=\"course-type\">"+ courses[i]['classes'][j]['type'] +" (<b class=\"fill-low\">" + courses[i]['classes'][j]['current'] + "</b>)</span> <img id=\"course-add-btn\" src=\"img/add_outline.png\"> <div class=\"time-info\"> <span class=\"course-days\">" + courses[i]['classes'][j]['days'] + "</span> <span class=\"course-times\">" + courses[i]['classes'][j]['times'] + "</span> </div> </div>");
          }

        }
      });
    });



});
