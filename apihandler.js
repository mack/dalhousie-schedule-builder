function APIHandler() {
  this.stored_courses = {};
}

APIHandler.prototype.get_course = function(category, callback) {
  var self = this;
  if (self.stored_courses[category] == null) {
    $.get( "http://localhost:8080/api/courses?s=" + category, function( res ) {
      var courses = res['data'];
      add_to_handler(self, courses, category);
      callback(courses);
    });
  } else {
    callback(self.stored_courses[category]);
  }
}


// HELPER FUNCTIONS
function add_to_handler(self, courses, category) {
  if (self.stored_courses[category] == null) { // saftey net
    self.stored_courses[category] = courses;
  }
}
