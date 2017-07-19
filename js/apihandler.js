function APIHandler() {
  this.stored_courses = {};
}

APIHandler.prototype.get_course = function(category, callback, err) {
  var self = this;
  if (self.stored_courses[category] == null) {
      $.get( "http://localhost:8080/api/courses?s=" + category, function( res ) {
        var courses = res['data'];
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
function add_to_handler(self, courses, category) {
  if (self.stored_courses[category] == null) { // saftey net
    self.stored_courses[category] = courses;
  }
}
