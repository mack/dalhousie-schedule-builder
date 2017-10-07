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
      var name = $('.name').val();
      var email = $('.email').val();
      var body = $('.mail-body').val();
      $.get( "http://localhost:8080/api/message?n=" + name + "&e=" + email + "&b=" + body, function( res ) {
        // trigger success popup
        $('.response-message').html("Success! The message sent");
        $('.response-message').css("display", "block");
        $('.response-message').removeClass("error");
      }).fail(function(jqXHR, textStatus, errorThrown) {
        $('.response-message').html("Error! Email me at mack.boudreau2@gmail.com");
        $('.response-message').css("display", "block");
        $('.response-message').addClass("error");
      });
    });
}
