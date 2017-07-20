function setup_schedule() {
  $(".class-m > img").click(function() {
    // delete all those classes
    // then reload datatable
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
