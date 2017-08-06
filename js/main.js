var handler = new APIHandler(); // global handler for API access
var scheduleHandler = new ScheduleHandler() // global handler for schedule access
var currentSelectedRow = null;
var search_string = null;
var selected_semester_id = 1;

$(window).bind('beforeunload', function() {
   save_to_storage()
});

function load_storage() {
  // Schedule Handler
  var selected_courses_temp = localStorage.getItem("selected_courses_" + selected_semester_id);
  var course_colors_temp = localStorage.getItem("course_colors_" + selected_semester_id);
  var colors_temp = localStorage.getItem("colors_" + selected_semester_id);

  selected_courses_temp = JSON.parse(selected_courses_temp);
  course_colors_temp = JSON.parse(course_colors_temp);
  colors_temp = JSON.parse(colors_temp);

  if (selected_courses_temp != null && course_colors_temp != null && colors_temp != null) {
    scheduleHandler.selected_courses = selected_courses_temp;
    scheduleHandler.course_colors = course_colors_temp;
    scheduleHandler.colors = colors_temp;
  } else {
    scheduleHandler.selected_courses = {};
    scheduleHandler.course_colors = {};
    scheduleHandler.colors = ["blue", "red", "green", "purple", "yellow", "grey"];
  }

  // API Handler
  var stored_courses_temp = localStorage.getItem("stored_courses_" + selected_semester_id);
  stored_courses_temp = JSON.parse(stored_courses_temp);
  if (stored_courses_temp != null) {
    handler.stored_courses = stored_courses_temp;
  } else {
    handler.stored_courses = {};
    handler.current_category = "";
  }
}

function save_to_storage() {
  // add's to storage object
  var selected_courses_temp = scheduleHandler.selected_courses;
  var course_colors_temp = scheduleHandler.course_colors;
  var colors_temp = scheduleHandler.colors;
  var stored_courses_temp = handler.stored_courses;

  selected_courses_temp = JSON.stringify(selected_courses_temp);
  course_colors_temp = JSON.stringify(course_colors_temp);
  colors_temp = JSON.stringify(colors_temp);
  stored_courses_temp = JSON.stringify(stored_courses_temp)

  localStorage.setItem("selected_courses_" + selected_semester_id, selected_courses_temp);
  localStorage.setItem("course_colors_" + selected_semester_id, course_colors_temp);
  localStorage.setItem("colors_" + selected_semester_id, colors_temp);
  localStorage.setItem("stored_courses_" + selected_semester_id, stored_courses_temp);

  // var stored_courses_temp = handler.stored_courses;
  // stored_courses_temp = JSON.stringify(stored_courses_temp);
  // localStorage.setItem("stored_courses", stored_courses_temp);
}

function clear_storage() {
  localStorage.clear();
  handler.stored_courses = {};
  scheduleHandler.selected_courses = {};
  scheduleHandler.course_colors = {};
  scheduleHandler.colors = ["blue", "red", "green", "purple", "yellow", "grey"];
}

$(document).ready(function(){
  setup_ui();
  // fill_random_crns(); // just for demo purposes
  load_storage();
  setup_schedule();

  var category = decodeURIComponent(window.location.search.substring(1));
  handler.update_category(category);
  if (category == "") {
    $('#course-table').empty();
    $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
  } else {
    handler.get_course(function(courses, err) {
      if (err == -1) {
        $('#course-table').empty();
        $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
      } else {
        $("#course-list").val(category.toUpperCase());
        update_courses(courses);
      }
    });
  }

  $('#search').keyup(function() {
    search_string = $('#search').val();
    var category = $('#course-list').find(":selected").attr('value');
    if (category != "") {
      handler.search_stored_courses(search_string, function(courses) {
        update_courses(courses);
      });
    }
  });

  $( "#course-list" ).change(function() {
    currentSelectedRow = null;
    var category = $('#course-list').find(":selected").attr('value');
    history.pushState(null, null, "?" + category.toLowerCase());
    handler.update_category(category);
    if (category == "") {
      $('#course-table').empty();
      $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
    } else {
      handler.get_course(function(courses, err) {
        if (err == -1) {
          $('#course-table').empty();
          $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
        } else {
          update_courses(courses);
        }
      });
    }
  });
});

function update_courses(courses) {
  $('#course-table').css("display", "none")
  $('#course-table').empty();
  if (courses != undefined) {
    for (i = 0; i < courses.length; i++) {

      var cat_code = courses[i]['category'] + " " + courses[i]['code'];
      if ($(currentSelectedRow).find('.course-code').text() == cat_code) {
        // a little bit of a 'hack' to replace the currentselectedrow variable
        var s = "<div class=\"course-header\"> <span class=\"course-code\">" + cat_code + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/up.svg\"> </div>"
        var d = document.createElement('div');
        d.innerHTML = s;
        var header = d.firstChild;
        $('#course-table').append(header);
        currentSelectedRow = header;
      } else {
        $('#course-table').append("<div class=\"course-header\"> <span class=\"course-code\">" + cat_code + "</span> <span class=\"course-title\">" + courses[i]['title'] + "</span> <img id=\"course-dropdown-icon\" src=\"img/down.svg\"> </div>");
      }

      if (courses[i]['classes'] != null) { // handle case where theres no classes
        for (j = 0; j < courses[i]['classes'].length; j++) {
          var course_element = "";

          // determine if it's under a selected header (for table reload)
          if ($(currentSelectedRow).find('.course-code').text() == cat_code) {
            course_element = "<div style=\"display:block; "
          } else {
            course_element = "<div style=\""
          }

          // determine if it or its siblings are selected and handle accordingly
          var selected_code = scheduleHandler.is_class_selected(cat_code, courses[i]['classes'][j]['id'], courses[i]['classes'][j]['type']);
          var fill_percentage = Math.round((parseInt(courses[i]['classes'][j]["current"]) / parseInt(courses[i]['classes'][j]["max"])) * 100)
          var fill_color = "fill-low"

          if (fill_percentage > 66) {
            fill_color = "fill-high"
          } else if (fill_percentage > 33 && fill_percentage < 66) {
            fill_color = "fill-med"
          } else {
            fill_color = "fill-low"
          }
          var fill_percentage_str = ""
          if (fill_percentage == 100) {
            fill_percentage_str = "FULL"
          } else {
            fill_percentage_str = fill_percentage.toString() + "%"
          }

          if (selected_code == -2) {
            // course element is already selected
            course_element += " background-color: #E7E7E9;\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\""+ fill_color +"\">" + fill_percentage_str + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_checked.svg\"><div class=\"time-info-container\">"
          } else if (selected_code == -1) {
            // course type is already selected
            course_element += "\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\""+ fill_color +"\">" + fill_percentage_str + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_disabled.svg\"><div class=\"time-info-container disable\">"
          } else {
            // nothing
            course_element += "\" class=\"course-data\" class-id=\"" + courses[i]['classes'][j]['id'] +"\" course=\"" + cat_code + "\"><span class=\"course-type\">" + courses[i]['classes'][j]["type"] + " " + courses[i]['classes'][j]["section"] + " (<b class=\""+ fill_color +"\">" + fill_percentage_str + "</b>)</span><img id=\"course-add-btn\" src=\"img/add_outline.svg\"><div class=\"time-info-container\">"
          }

          // handle multiple dates
          for (k = 0; k < courses[i]['classes'][j]['days'].length; k++) {
            course_element += "<div class=\"time-info\"><span class=\"course-days\">" + courses[i]['classes'][j]['days'][k] + "</span><span class=\"course-times\">" + courses[i]['classes'][j]['times'][k] + "</span></div>"
          }

          course_element += "</div></div>"

          $('#course-table').append(course_element);
        }
      }
    }
  } else {
    $('#course-table').empty();
    $('#course-table').append("<span id=\"no-selected\">No subject selected</span>");
  }
  $('#course-table').css("display", "table")
}

function reload_table() {
  if (search_string != null && search_string != "") {
    search_string = $('#search').val();
    var category = $('#course-list').find(":selected").attr('value');

    if (category != "") {
      handler.search_stored_courses(search_string, function(courses) {
        update_courses(courses);
      });
    } else {
      console.log("")
    }
  } else {
    handler.get_course(function(courses, err) {
      if (err == -1) {
        $('#course-table').empty();
        $('#course-table').append("<span id=\"no-selected\">Oops! The server doesn't seem to be online. Try again in a few minutes.</span>");
      } else {
        update_courses(courses);
      }
    });
  }
}

function switch_semester(sem) {
  save_to_storage();
  if (sem == "WINTER") {
    selected_semester_id = 2;
    $("#course-list").empty();
    $('#course-list').append("<OPTION VALUE=\"\" SELECTED>-Choose a Subject-</OPTION> <OPTION VALUE=\"ACSC\">Actuarial Science</OPTION> <OPTION VALUE=\"AGRI\">Agriculture-Agricultural Camp</OPTION> <OPTION VALUE=\"AGRN\">Agronomy-Agricultural Campus</OPTION> <OPTION VALUE=\"ANAT\">Anatomy</OPTION> <OPTION VALUE=\"ANSC\">Animal Sci-Agricultural Campus</OPTION> <OPTION VALUE=\"ARTC\">Applied Hlth Services Research</OPTION> <OPTION VALUE=\"APSC\">Applied Science-Agri Campus</OPTION> <OPTION VALUE=\"AQUA\">Aquaculture-Agricultural Camp</OPTION> <OPTION VALUE=\"ARBC\">Arabic</OPTION> <OPTION VALUE=\"ARCH\">Architecture</OPTION> <OPTION VALUE=\"ASSC\">Arts & Social Sciences</OPTION> <OPTION VALUE=\"BIOC\">Biochem & Molecular Biology</OPTION> <OPTION VALUE=\"BIOE\">Biological Engineering</OPTION> <OPTION VALUE=\"BIOL\">Biology</OPTION> <OPTION VALUE=\"BIOA\">Biology-Agricultural Campus</OPTION> <OPTION VALUE=\"BMNG\">Biomedical Engineering</OPTION> <OPTION VALUE=\"BUSI\">Business Admin</OPTION> <OPTION VALUE=\"CANA\">Canadian Studies</OPTION> <OPTION VALUE=\"CNLT\">Centre for Learning & Teaching</OPTION> <OPTION VALUE=\"CHEE\">Chemical Engineering</OPTION> <OPTION VALUE=\"CHEM\">Chemistry</OPTION> <OPTION VALUE=\"CHMA\">Chemistry-Agricultural Campus</OPTION> <OPTION VALUE=\"CHIN\">Chinese</OPTION> <OPTION VALUE=\"CIVL\">Civil Engineering</OPTION> <OPTION VALUE=\"CLAS\">Classics</OPTION> <OPTION VALUE=\"COMM\">Commerce</OPTION> <OPTION VALUE=\"CMMT\">Communications-Agri Campus</OPTION> <OPTION VALUE=\"CH_E\">Community Health&Epidemiology</OPTION> <OPTION VALUE=\"CPST\">Complementary Studies</OPTION> <OPTION VALUE=\"CSCA\">Computer Sci-Agricultural Camp</OPTION> <OPTION VALUE=\"CSCI\">Computer Science</OPTION> <OPTION VALUE=\"CTMP\">Contemporary Studies</OPTION> <OPTION VALUE=\"CRWR\">Creative Writing</OPTION> <OPTION VALUE=\"DEHY\">Dental Hygiene</OPTION> <OPTION VALUE=\"DENT\">Dentistry</OPTION> <OPTION VALUE=\"DMUT\">Diag Med Ultrasound Tech</OPTION> <OPTION VALUE=\"DISM\">Disability Management</OPTION> <OPTION VALUE=\"EMSP\">Early Modern Studies</OPTION> <OPTION VALUE=\"ERTH\">Earth Sciences</OPTION> <OPTION VALUE=\"ECON\">Economics</OPTION> <OPTION VALUE=\"ECOA\">Economics-Agricultural Campus</OPTION> <OPTION VALUE=\"ECED\">Electrical & Computer Engineer</OPTION> <OPTION VALUE=\"ECMM\">Electronic Commerce</OPTION> <OPTION VALUE=\"ENGI\">Engineering</OPTION> <OPTION VALUE=\"INWK\">Engineering Internetworking</OPTION> <OPTION VALUE=\"ENGM\">Engineering Mathematics</OPTION> <OPTION VALUE=\"ENGN\">Engineering-Agri Campus</OPTION> <OPTION VALUE=\"ENGL\">English</OPTION> <OPTION VALUE=\"ENSL\">English Language (CE)</OPTION> <OPTION VALUE=\"EGLA\">English-Agricultural Campus</OPTION> <OPTION VALUE=\"ENVA\">Environ Sciences-Agri Campus</OPTION> <OPTION VALUE=\"ENVE\">Environmental Engineering</OPTION> <OPTION VALUE=\"ENVS\">Environmental Science</OPTION> <OPTION VALUE=\"ENVI\">Environmental Studies</OPTION> <OPTION VALUE=\"EURO\">European Studies</OPTION> <OPTION VALUE=\"FILM\">Film Studies</OPTION> <OPTION VALUE=\"FOSC\">Food Science</OPTION> <OPTION VALUE=\"FOOD\">Food Science-Agricultural Camp</OPTION> <OPTION VALUE=\"FREN\">French</OPTION> <OPTION VALUE=\"FRNA\">French-Agricultural Campus</OPTION> <OPTION VALUE=\"GWST\">Gender & Women's Studies</OPTION> <OPTION VALUE=\"GENE\">Genetics-Agricultural Campus</OPTION> <OPTION VALUE=\"GEOG\">Geography</OPTION> <OPTION VALUE=\"GEOA\">Geography-Agricultural Campus</OPTION> <OPTION VALUE=\"GELA\">Geology-Agricultural Campus</OPTION> <OPTION VALUE=\"GERM\">German</OPTION> <OPTION VALUE=\"HESA\">Health Administration</OPTION> <OPTION VALUE=\"HINF\">Health Informatics</OPTION> <OPTION VALUE=\"HLTH\">Health Professions</OPTION> <OPTION VALUE=\"HPRO\">Health Promotion</OPTION> <OPTION VALUE=\"HSCE\">Health Sciences Education</OPTION> <OPTION VALUE=\"HAHP\">Health and Human Performance</OPTION> <OPTION VALUE=\"HSTC\">Hist of Science & Technology</OPTION> <OPTION VALUE=\"HIST\">History</OPTION> <OPTION VALUE=\"HISA\">History-Agricultural Campus</OPTION> <OPTION VALUE=\"HORT\">Horticulture-Agricultural Camp</OPTION> <OPTION VALUE=\"HUCD\">Human Communication Disorders</OPTION> <OPTION VALUE=\"INDG\">Indigenous Studies</OPTION> <OPTION VALUE=\"IENG\">Industrial Engineering</OPTION> <OPTION VALUE=\"INFX\">Informatics</OPTION> <OPTION VALUE=\"INFO\">Information Management</OPTION> <OPTION VALUE=\"INFB\">Int'l Food Business-Agri Camp</OPTION> <OPTION VALUE=\"INTE\">Interdisc Studies (Graduate)</OPTION> <OPTION VALUE=\"IDHS\">Interdisciplinary Hlth Studies</OPTION> <OPTION VALUE=\"INTD\">International Develop Studies</OPTION> <OPTION VALUE=\"IPHE\">Interprofessional Health Educ</OPTION> <OPTION VALUE=\"ITAL\">Italian</OPTION> <OPTION VALUE=\"JOUR\">Journalism</OPTION> <OPTION VALUE=\"KINE\">Kinesiology</OPTION> <OPTION VALUE=\"KING\">King's Foundation Year Program</OPTION> <OPTION VALUE=\"LARC\">Landscape Architecture</OPTION> <OPTION VALUE=\"LAWS\">Law</OPTION> <OPTION VALUE=\"LEIS\">Leisure Studies</OPTION> <OPTION VALUE=\"MRIT\">Magnetic Resonance Imag Tech</OPTION> <OPTION VALUE=\"MGMT\">Management</OPTION> <OPTION VALUE=\"MGTA\">Management-Agricultural Campus</OPTION> <OPTION VALUE=\"MARA\">Marine Affairs</OPTION> <OPTION VALUE=\"MARI\">Marine Biology</OPTION> <OPTION VALUE=\"MATL\">Materials Engineering</OPTION> <OPTION VALUE=\"MATH\">Mathematics</OPTION> <OPTION VALUE=\"MTHA\">Mathematics-Agricultural Camp</OPTION> <OPTION VALUE=\"MECH\">Mechanical Engineering</OPTION> <OPTION VALUE=\"MDLT\">Medical Lab Technology</OPTION> <OPTION VALUE=\"MEDP\">Medical Physics</OPTION> <OPTION VALUE=\"MEDR\">Medical Research</OPTION> <OPTION VALUE=\"MICI\">Microbiology & Immunology</OPTION> <OPTION VALUE=\"MCRA\">Microbiology-Agricultural Camp</OPTION> <OPTION VALUE=\"MINE\">Mineral Resource Engineering</OPTION> <OPTION VALUE=\"MUSC\">Music</OPTION> <OPTION VALUE=\"NESC\">Neuroscience</OPTION> <OPTION VALUE=\"NUMT\">Nuclear Medicine Technology</OPTION> <OPTION VALUE=\"NURS\">Nursing</OPTION> <OPTION VALUE=\"NUTR\">Nutrition-Agricultural Campus</OPTION> <OPTION VALUE=\"OCCU\">Occupational Therapy</OPTION> <OPTION VALUE=\"OCEA\">Oceanography</OPTION> <OPTION VALUE=\"ORAL\">Oral Surgery</OPTION> <OPTION VALUE=\"PHDP\">PHD Program</OPTION> <OPTION VALUE=\"PATH\">Pathology</OPTION> <OPTION VALUE=\"PERF\">Performance Studies</OPTION> <OPTION VALUE=\"PERI\">Periodontics</OPTION> <OPTION VALUE=\"PHAC\">Pharmacology</OPTION> <OPTION VALUE=\"PHAR\">Pharmacy</OPTION> <OPTION VALUE=\"PHIL\">Philosophy</OPTION> <OPTION VALUE=\"PHYC\">Physics & Atmospheric Science</OPTION> <OPTION VALUE=\"PHYS\">Physics-Agricultural Campus</OPTION> <OPTION VALUE=\"PHYL\">Physiology</OPTION> <OPTION VALUE=\"PHYT\">Physiotherapy</OPTION> <OPTION VALUE=\"PLAN\">Planning</OPTION> <OPTION VALUE=\"PLSC\">Plant Science-Agri Campus</OPTION> <OPTION VALUE=\"POLI\">Political Science</OPTION> <OPTION VALUE=\"POLS\">Political Science-Agri Campus</OPTION> <OPTION VALUE=\"PGPH\">Post-Graduate Pharmacy</OPTION> <OPTION VALUE=\"PEAS\">Process Engineering & App Scie</OPTION> <OPTION VALUE=\"PROS\">Prosthodontics</OPTION> <OPTION VALUE=\"PSYR\">Psychiatry</OPTION> <OPTION VALUE=\"PSYO\">Psychology</OPTION> <OPTION VALUE=\"PSYC\">Psychology-Agricultural Campus</OPTION> <OPTION VALUE=\"PUAD\">Public Administration</OPTION> <OPTION VALUE=\"RADT\">Radiological Technology</OPTION> <OPTION VALUE=\"REGN\">Registration Course-Graduate</OPTION> <OPTION VALUE=\"RELS\">Religious Studies</OPTION> <OPTION VALUE=\"RESM\">Res Methods/Proj Sem-Agri Camp</OPTION> <OPTION VALUE=\"RSPT\">Respiratory Therapy</OPTION> <OPTION VALUE=\"RURS\">Rural Studies-Agri Campus</OPTION> <OPTION VALUE=\"RUSN\">Russian Studies</OPTION> <OPTION VALUE=\"SCIE\">Science</OPTION> <OPTION VALUE=\"SLWK\">Social Work</OPTION> <OPTION VALUE=\"SOSA\">Sociol & Social Anthropology</OPTION> <OPTION VALUE=\"SOCI\">Sociology-Agricultural Campus</OPTION> <OPTION VALUE=\"SOIL\">Soils-Agricultural Campus</OPTION> <OPTION VALUE=\"SPAN\">Spanish & Latin American Stud</OPTION> <OPTION VALUE=\"SPNA\">Spanish-Agricultural Campus</OPTION> <OPTION VALUE=\"SPEC\">Special Topics-Agri Campus</OPTION> <OPTION VALUE=\"STAT\">Statistics</OPTION> <OPTION VALUE=\"STAA\">Statistics-Agricultural Campus</OPTION> <OPTION VALUE=\"SUST\">Sustainability</OPTION> <OPTION VALUE=\"THEA\">Theatre</OPTION> <OPTION VALUE=\"TYPR\">Transition Year Program</OPTION> <OPTION VALUE=\"VTEC\">Veterinary Tech-Agri Campus</OPTION> <OPTION VALUE=\"VISC\">Vision Science</OPTION>");
  } else if (sem == "FALL") {
    selected_semester_id = 1;
    $("#course-list").empty();
    $('#course-list').append("<OPTION VALUE=\"\" SELECTED>-Choose a Subject-</OPTION> <OPTION VALUE=\"ACAD\">Academic-Agricultural Campus</OPTION> <OPTION VALUE=\"ACSC\">Actuarial Science</OPTION> <OPTION VALUE=\"AGRI\">Agriculture-Agricultural Camp</OPTION> <OPTION VALUE=\"AGRN\">Agronomy-Agricultural Campus</OPTION> <OPTION VALUE=\"ANAT\">Anatomy</OPTION> <OPTION VALUE=\"ANSC\">Animal Sci-Agricultural Campus</OPTION> <OPTION VALUE=\"ARTC\">Applied Hlth Services Research</OPTION> <OPTION VALUE=\"APSC\">Applied Science-Agri Campus</OPTION> <OPTION VALUE=\"AQUA\">Aquaculture-Agricultural Camp</OPTION> <OPTION VALUE=\"ARBC\">Arabic</OPTION> <OPTION VALUE=\"ARCH\">Architecture</OPTION> <OPTION VALUE=\"ARTS\">Art-Agricultural Campus</OPTION> <OPTION VALUE=\"ASSC\">Arts & Social Sciences</OPTION> <OPTION VALUE=\"BIOC\">Biochem & Molecular Biology</OPTION> <OPTION VALUE=\"BIOE\">Biological Engineering</OPTION> <OPTION VALUE=\"BIOL\">Biology</OPTION> <OPTION VALUE=\"BIOA\">Biology-Agricultural Campus</OPTION> <OPTION VALUE=\"BMNG\">Biomedical Engineering</OPTION> <OPTION VALUE=\"BVSC\">Bioveterinary Science</OPTION> <OPTION VALUE=\"BUSI\">Business Admin</OPTION> <OPTION VALUE=\"CANA\">Canadian Studies</OPTION> <OPTION VALUE=\"CHEE\">Chemical Engineering</OPTION> <OPTION VALUE=\"CHEM\">Chemistry</OPTION> <OPTION VALUE=\"CHMA\">Chemistry-Agricultural Campus</OPTION> <OPTION VALUE=\"CHIN\">Chinese</OPTION> <OPTION VALUE=\"CIVL\">Civil Engineering</OPTION> <OPTION VALUE=\"CLAS\">Classics</OPTION> <OPTION VALUE=\"COMM\">Commerce</OPTION> <OPTION VALUE=\"CMMT\">Communications-Agri Campus</OPTION> <OPTION VALUE=\"CH_E\">Community Health&Epidemiology</OPTION> <OPTION VALUE=\"CPST\">Complementary Studies</OPTION> <OPTION VALUE=\"CSCI\">Computer Science</OPTION> <OPTION VALUE=\"CTMP\">Contemporary Studies</OPTION> <OPTION VALUE=\"CRWR\">Creative Writing</OPTION> <OPTION VALUE=\"DEHY\">Dental Hygiene</OPTION> <OPTION VALUE=\"DENT\">Dentistry</OPTION> <OPTION VALUE=\"DMUT\">Diag Med Ultrasound Tech</OPTION> <OPTION VALUE=\"DISM\">Disability Management</OPTION> <OPTION VALUE=\"EMSP\">Early Modern Studies</OPTION> <OPTION VALUE=\"ERTH\">Earth Sciences</OPTION> <OPTION VALUE=\"ECON\">Economics</OPTION> <OPTION VALUE=\"ECOA\">Economics-Agricultural Campus</OPTION> <OPTION VALUE=\"ECED\">Electrical & Computer Engineer</OPTION> <OPTION VALUE=\"ECMM\">Electronic Commerce</OPTION> <OPTION VALUE=\"ENGI\">Engineering</OPTION> <OPTION VALUE=\"INWK\">Engineering Internetworking</OPTION> <OPTION VALUE=\"ENGM\">Engineering Mathematics</OPTION> <OPTION VALUE=\"ENGN\">Engineering-Agri Campus</OPTION> <OPTION VALUE=\"ENGL\">English</OPTION> <OPTION VALUE=\"ENSL\">English Language (CE)</OPTION> <OPTION VALUE=\"EGLA\">English-Agricultural Campus</OPTION> <OPTION VALUE=\"ENVA\">Environ Sciences-Agri Campus</OPTION> <OPTION VALUE=\"ENVE\">Environmental Engineering</OPTION> <OPTION VALUE=\"ENVS\">Environmental Science</OPTION> <OPTION VALUE=\"ENVI\">Environmental Studies</OPTION> <OPTION VALUE=\"EURO\">European Studies</OPTION> <OPTION VALUE=\"EXTE\">Extension Educ-Agri Campus</OPTION> <OPTION VALUE=\"FILM\">Film Studies</OPTION> <OPTION VALUE=\"FIGA\">First Year Interest Groups-Art</OPTION> <OPTION VALUE=\"FIGS\">First Year Interest Groups-Sci</OPTION> <OPTION VALUE=\"FOSC\">Food Science</OPTION> <OPTION VALUE=\"FOOD\">Food Science-Agricultural Camp</OPTION> <OPTION VALUE=\"FREN\">French</OPTION> <OPTION VALUE=\"FRNA\">French-Agricultural Campus</OPTION> <OPTION VALUE=\"GWST\">Gender & Women's Studies</OPTION> <OPTION VALUE=\"GENE\">Genetics-Agricultural Campus</OPTION> <OPTION VALUE=\"GEOG\">Geography</OPTION> <OPTION VALUE=\"GERM\">German</OPTION> <OPTION VALUE=\"HESA\">Health Administration</OPTION> <OPTION VALUE=\"HINF\">Health Informatics</OPTION> <OPTION VALUE=\"HLTH\">Health Professions</OPTION> <OPTION VALUE=\"HPRO\">Health Promotion</OPTION> <OPTION VALUE=\"HSCE\">Health Sciences Education</OPTION> <OPTION VALUE=\"HAHP\">Health and Human Performance</OPTION> <OPTION VALUE=\"HSTC\">Hist of Science & Technology</OPTION> <OPTION VALUE=\"HIST\">History</OPTION> <OPTION VALUE=\"HISA\">History-Agricultural Campus</OPTION> <OPTION VALUE=\"HORT\">Horticulture-Agricultural Camp</OPTION> <OPTION VALUE=\"HUCD\">Human Communication Disorders</OPTION> <OPTION VALUE=\"INDG\">Indigenous Studies</OPTION> <OPTION VALUE=\"IENG\">Industrial Engineering</OPTION> <OPTION VALUE=\"INFX\">Informatics</OPTION> <OPTION VALUE=\"INFO\">Information Management</OPTION> <OPTION VALUE=\"INFB\">Int'l Food Business-Agri Camp</OPTION> <OPTION VALUE=\"INTE\">Interdisc Studies (Graduate)</OPTION> <OPTION VALUE=\"IDHS\">Interdisciplinary Hlth Studies</OPTION> <OPTION VALUE=\"INTD\">International Develop Studies</OPTION> <OPTION VALUE=\"IPHE\">Interprofessional Health Educ</OPTION> <OPTION VALUE=\"IAGR\">Intl Development-Agri Camp</OPTION> <OPTION VALUE=\"ITAL\">Italian</OPTION> <OPTION VALUE=\"JOUR\">Journalism</OPTION> <OPTION VALUE=\"KINE\">Kinesiology</OPTION> <OPTION VALUE=\"KING\">King's Foundation Year Program</OPTION> <OPTION VALUE=\"LARC\">Landscape Architecture</OPTION> <OPTION VALUE=\"LAWS\">Law</OPTION> <OPTION VALUE=\"LEIS\">Leisure Studies</OPTION> <OPTION VALUE=\"MRIT\">Magnetic Resonance Imag Tech</OPTION> <OPTION VALUE=\"MGMT\">Management</OPTION> <OPTION VALUE=\"MGTA\">Management-Agricultural Campus</OPTION> <OPTION VALUE=\"MARA\">Marine Affairs</OPTION> <OPTION VALUE=\"MARI\">Marine Biology</OPTION> <OPTION VALUE=\"MATL\">Materials Engineering</OPTION> <OPTION VALUE=\"MATH\">Mathematics</OPTION> <OPTION VALUE=\"MTHA\">Mathematics-Agricultural Camp</OPTION> <OPTION VALUE=\"MECH\">Mechanical Engineering</OPTION> <OPTION VALUE=\"MEDP\">Medical Physics</OPTION> <OPTION VALUE=\"MEDR\">Medical Research</OPTION> <OPTION VALUE=\"MICI\">Microbiology & Immunology</OPTION> <OPTION VALUE=\"MCRA\">Microbiology-Agricultural Camp</OPTION> <OPTION VALUE=\"MINE\">Mineral Resource Engineering</OPTION> <OPTION VALUE=\"MUSC\">Music</OPTION> <OPTION VALUE=\"NESC\">Neuroscience</OPTION> <OPTION VALUE=\"NUMT\">Nuclear Medicine Technology</OPTION> <OPTION VALUE=\"NURS\">Nursing</OPTION> <OPTION VALUE=\"NUTR\">Nutrition-Agricultural Campus</OPTION> <OPTION VALUE=\"OCCU\">Occupational Therapy</OPTION> <OPTION VALUE=\"OCEA\">Oceanography</OPTION> <OPTION VALUE=\"ORAL\">Oral Surgery</OPTION> <OPTION VALUE=\"PHDP\">PHD Program</OPTION> <OPTION VALUE=\"PATH\">Pathology</OPTION> <OPTION VALUE=\"PERF\">Performance Studies</OPTION> <OPTION VALUE=\"PERI\">Periodontics</OPTION> <OPTION VALUE=\"PHAC\">Pharmacology</OPTION> <OPTION VALUE=\"PHAR\">Pharmacy</OPTION> <OPTION VALUE=\"PHIL\">Philosophy</OPTION> <OPTION VALUE=\"PHLA\">Philosophy-Agricultural Campus</OPTION> <OPTION VALUE=\"PHYC\">Physics & Atmospheric Science</OPTION> <OPTION VALUE=\"PHYS\">Physics-Agricultural Campus</OPTION> <OPTION VALUE=\"PHYL\">Physiology</OPTION> <OPTION VALUE=\"PHYT\">Physiotherapy</OPTION> <OPTION VALUE=\"PLAN\">Planning</OPTION> <OPTION VALUE=\"PLSC\">Plant Science-Agri Campus</OPTION> <OPTION VALUE=\"POLI\">Political Science</OPTION> <OPTION VALUE=\"POLS\">Political Science-Agri Campus</OPTION> <OPTION VALUE=\"PGPH\">Post-Graduate Pharmacy</OPTION> <OPTION VALUE=\"PEAS\">Process Engineering & App Scie</OPTION> <OPTION VALUE=\"PROS\">Prosthodontics</OPTION> <OPTION VALUE=\"PSYR\">Psychiatry</OPTION> <OPTION VALUE=\"PSYO\">Psychology</OPTION> <OPTION VALUE=\"PSYC\">Psychology-Agricultural Campus</OPTION> <OPTION VALUE=\"PUAD\">Public Administration</OPTION> <OPTION VALUE=\"RADT\">Radiological Technology</OPTION> <OPTION VALUE=\"REGN\">Registration Course-Graduate</OPTION> <OPTION VALUE=\"RELS\">Religious Studies</OPTION> <OPTION VALUE=\"RESM\">Res Methods/Proj Sem-Agri Camp</OPTION> <OPTION VALUE=\"RSPT\">Respiratory Therapy</OPTION> <OPTION VALUE=\"RUSN\">Russian Studies</OPTION> <OPTION VALUE=\"SCIE\">Science</OPTION> <OPTION VALUE=\"SLWK\">Social Work</OPTION> <OPTION VALUE=\"SOSA\">Sociol & Social Anthropology</OPTION> <OPTION VALUE=\"SOCI\">Sociology-Agricultural Campus</OPTION> <OPTION VALUE=\"SOIL\">Soils-Agricultural Campus</OPTION> <OPTION VALUE=\"SPAN\">Spanish & Latin American Stud</OPTION> <OPTION VALUE=\"SPNA\">Spanish-Agricultural Campus</OPTION> <OPTION VALUE=\"SPEC\">Special Topics-Agri Campus</OPTION> <OPTION VALUE=\"STAT\">Statistics</OPTION> <OPTION VALUE=\"STAA\">Statistics-Agricultural Campus</OPTION> <OPTION VALUE=\"SUST\">Sustainability</OPTION> <OPTION VALUE=\"THEA\">Theatre</OPTION> <OPTION VALUE=\"TYPR\">Transition Year Program</OPTION> <OPTION VALUE=\"VTEC\">Veterinary Tech-Agri Campus</OPTION> <OPTION VALUE=\"VISC\">Vision Science</OPTION>")
  }
  load_storage();
  handler.current_category = "";
  $(".class-container").remove();
  scheduleHandler.load_selected_courses_into_html();
  reload_table();

}

function setup_ui() {
  $(".timeline ul li").hover(function() {
    $(this).addClass('focus');
  }, function() {
    $(this).removeClass('focus');
  })

  $('.sched_menu .tool-tip-container > img').click(function() {
    clear_storage();
    reload_table();
    $('.class-container').remove();
    scheduleHandler.reload_crns();
  })

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
      var txt = $(this).text();
      history.pushState(null, null, "");
      switch_semester(txt);
      selected_semester.removeClass("selected");
      selected_semester = $(this);
      selected_semester.addClass("selected");
    });

    // mobile menu item
    $(".menu").click(function() {
      $("#nav-container").slideToggle(300);
    });

    // course crn reload
    $(".course-crns .course-table-header .tool-tip-container > img").click(function() {
      scheduleHandler.reload_crns();
    })

    // table image hover
    $("#course-table").on("mouseenter", '.course-data #course-add-btn', function() {
        if ($(this).attr('src') == 'img/add_outline.svg') {
          $(this).attr('src', "img/add_fill.svg");
        }
    });
    $("#course-table").on("mouseleave", '.course-data #course-add-btn', function() {
        if ($(this).attr('src') == "img/add_fill.svg") {
          $(this).attr('src', "img/add_outline.svg");
        }
    });

    $("#course-table").on("click", '.course-data #course-add-btn', function() {
      // need to reload table to disable other classes of same type if success
      if ($(this).attr('src') == 'img/add_checked.svg') {
        var cat_code = $(this).parent().attr('course');
        var id = $(this).parent().attr('class-id');
        var err = scheduleHandler.remove_class_with_id(cat_code, id);
        if (err != -1) {
          $(".class-m[class_id=\"" + id + "\"]").remove();
          reload_table()
        }
      } else if ($(this).attr('src') == 'img/add_disabled.svg') {
        $(this).effect("shake", { times:1, distance: 3 }, 100);
        $(this).css("opacity", "0.85");
        var selected_class = $(this).parent().attr('class-id');
        scheduleHandler.add_class_to_schedule(selected_class); // just to trigger notification
      } else {
        var selected_class = $(this).parent().attr('class-id');
        var err = scheduleHandler.add_class_to_schedule(selected_class);
        if (err != -1) {
          reload_table();
        }
      }
    });

    // table drop down
    $('#course-table').on('click', '.course-header', function() {
      if (!currentSelectedRow) {
        // no row selected
        currentSelectedRow = this;
        $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
        $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.svg');
      } else {
        if ($(currentSelectedRow).find('.course-code').text() === $(this).find('.course-code').text()) {
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.svg');
          currentSelectedRow = null;
        } else {
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/down.svg');
          currentSelectedRow = this;
          $(currentSelectedRow).nextUntil('.course-header').slideToggle(300);
          $(currentSelectedRow).find('#course-dropdown-icon').attr('src', 'img/up.svg');
        }
      }
    });
}

function fill_random_crns() {
  var wcrns = [];
  var fcrns = [];
  // fill fake CRN's
  for (i = 0; i < 6; i++) {
    var new_crn_w = Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000;
    wcrns.push(new_crn_w);
    var new_crn_f = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
    fcrns.push(new_crn_f);
  }

  // populate fall crns
  for (i=0; i < fcrns.length; i++) {
    if (i == fcrns.length - 1) {
      $("#fall").val($('#fall').val() + fcrns[i]);
    } else {
      $("#fall").val($('#fall').val() + fcrns[i] + ", ");
    }
  }

  // populate winter crns
  for (i=0; i < wcrns.length; i++) {
    if (i == wcrns.length - 1) {
      $("#winter").val($('#winter').val() + wcrns[i]);
    } else {
      $("#winter").val($('#winter').val() + wcrns[i] + ", ");
    }
  }
}
