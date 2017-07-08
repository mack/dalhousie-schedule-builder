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

    $('.course_header').click(function(){
      //$(this).nextUntil('.clicker')
      $('.sub_courses').animate({
        opacity: 0.25,
        height: "toggle"
      }, 500, function() {
    // Animation complete.
      });
    });
});
