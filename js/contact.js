$(document).ready(function(){
  // javascript for contact page
  setup_ui()
});

function setup_ui() {

  $(".menu").click(function() {
    $("#nav-container").slideToggle(300);
  });
  
  var selected_navigation = $(".nav-item.selected")
  $(".nav-item").hover(
    function() {
      selected_navigation.removeClass("selected");
    }, function() {
      selected_navigation.addClass("selected");
    })
    $(".send").hover(
      function() {
        $( "#mail-icon" ).css({
          "-webkit-transform": "rotate(-12deg) scale(1.05)",
          "transform": "rotate(-12deg) scale(1.05)" /* For modern browsers(CSS3)  */
        });
    }, function() {
      $( "#mail-icon" ).css({
        "-webkit-transform": "rotate(0deg)",
        "transform": "rotate(0deg)" /* For modern browsers(CSS3)  */
      });
    });
    $(".send").click(function(){
      // send email here
    });
}
