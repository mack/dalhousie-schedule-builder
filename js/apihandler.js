function APIHandler() {
  this.stored_courses = {};
}

APIHandler.prototype.get_course = function(category, callback, err) {
  var self = this;
  if (self.stored_courses[category] == null) {
      $.get( "http://localhost:8080/api/courses?s=" + category, function( res ) {
        var courses = res['data'];
        format_classes(courses);
        add_to_handler(self, courses, category);
        callback(courses, 200);
      }).fail(function(jqXHR, textStatus, errorThrown) {
        callback(null, -1);
      });
  } else {
    callback(self.stored_courses[category]);
  }
}

APIHandler.prototype.search_stored_courses = function(category, search_string, callback) {
  var filtered_courses = [];
  for (i = 0; i < this.stored_courses[category].length; i++) {
    var code = (category + " " + this.stored_courses[category][i].code).toLowerCase();
    var title = this.stored_courses[category][i].title.toLowerCase();
    if (code.search(search_string.toLowerCase()) != -1 || title.search(search_string.toLowerCase()) != -1) {
      filtered_courses.push(this.stored_courses[category][i]);
    }
  }

  if (search_string == "") {
    callback(this.stored_courses[category]);
  } else {
    callback(filtered_courses);
  }
}

// HELPER FUNCTIONS
function format_classes(courses) {
  if (courses != undefined) {
    for (var i = 0; i < courses.length; i++) {
      if (courses[i]["classes"] != undefined) {
        for (var j = 0; j < courses[i]["classes"].length; j++) {
          var s_class = courses[i]["classes"][j];
          var d_one = s_class["days"].match(/ONE\((.*?)\)/)
          var d_two = s_class["days"].match(/TWO\((.*?)\)/)
          if (d_one != null && d_two != null) {
            var t_one = s_class["times"].match(/ONE\((.*?)\)/)
            var t_two = s_class["times"].match(/TWO\((.*?)\)/)
            s_class["days"] = [d_one[1], d_two[1]];
            s_class["times"] = [format_time(t_one[1]), format_time(t_two[1])];
            console.log(s_class)
          } else {
            s_class["days"] = [s_class["days"]];
            s_class["times"] = [format_time(s_class["times"])];
          }
        }
      }
    }
  }
}

function format_time(time) {
  var time_formatted = time;
  if (time != 'C/D') {
    time_formatted = time.slice(0, 2) + ":" + time.slice(2,7) + ":" + time.slice(7);
  }
  return time_formatted;
}

function add_to_handler(self, courses, category) {
  if (self.stored_courses[category] == null) { // saftey net
    self.stored_courses[category] = courses;
  }
}
