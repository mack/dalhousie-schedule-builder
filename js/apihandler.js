function APIHandler() {
  this.current_category = "";
  this.stored_courses = {};
}

APIHandler.prototype.update_category = function(category) {
  this.current_category = category;
}

APIHandler.prototype.get_course = function(callback, err) {
  var self = this;
  if (self.stored_courses[self.current_category] == null) {
      $.get( "http://localhost:8080/api/courses?s=" + self.current_category + "&t=" + selected_semester_id, function( res ) {
        var courses = res['data'];
        format_classes(courses);
        add_to_handler(self, courses, self.current_category);
        callback(courses, 200);
      }).fail(function(jqXHR, textStatus, errorThrown) {
        callback(null, -1);
      });
  } else {
    callback(self.stored_courses[this.current_category]);
  }
}
APIHandler.prototype.get_title_with_code = function(cat_code) {
  var keys = Object.keys(this.stored_courses);
  for (var i = 0; i < keys.length; i++) {
    if (this.stored_courses[keys[i]] != null) {
      for (var j = 0; j < this.stored_courses[keys[i]].length; j++) {
        var code = this.stored_courses[keys[i]][j]['code']
        var cat = this.stored_courses[keys[i]][j]['category']
        var c_cat_code = cat + " " + code
        if (c_cat_code == cat_code) {
          return this.stored_courses[keys[i]][j]['title'];
        }
      }
    }
  }
}

// get_class_with_id();
// returns: {cat_code: s_class}
APIHandler.prototype.get_class_with_id = function(id) {
  if (this.stored_courses[this.current_category] != undefined) {
    for (i = 0; i < this.stored_courses[this.current_category].length; i++) {
      if (this.stored_courses[this.current_category][i]['classes'] != undefined) {
        var n_classes = this.stored_courses[this.current_category][i]['classes'].length;
        for (j = 0; j < n_classes; j++) {
          if (this.stored_courses[this.current_category][i]['classes'][j] != undefined && this.stored_courses[this.current_category][i]['classes'][j]['id'] == id) {
            var cat_code = this.current_category.toUpperCase() + " " + this.stored_courses[this.current_category][i]['code'];
            var return_obj = {}
            return_obj[cat_code] = this.stored_courses[this.current_category][i]['classes'][j];
            return return_obj;
          }
        }
      }
    }
  }
}

// callback function returns array of courses
APIHandler.prototype.search_stored_courses = function(search_string, callback) {
  var filtered_courses = [];
  for (i = 0; i < this.stored_courses[this.current_category].length; i++) {
    var code = (this.current_category + " " + this.stored_courses[this.current_category][i].code).toLowerCase();
    var title = this.stored_courses[this.current_category][i].title.toLowerCase();
    if (code.search(search_string.toLowerCase()) != -1 || title.search(search_string.toLowerCase()) != -1) {
      filtered_courses.push(this.stored_courses[this.current_category][i]);
    }
  }

  if (search_string == "") {
    callback(this.stored_courses[this.current_category]);
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
