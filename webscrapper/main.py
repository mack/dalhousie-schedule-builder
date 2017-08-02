# class scrapper
from bs4 import BeautifulSoup
import requests
import db

class Course:
    def __init__(self, title, classes):
        self.code = title.split(" ")[1]
        self.category = title.split(" ")[0]
        self.title = ""
        for i, w in enumerate(title.split(" ")[2:]):
            if (i == 0):
                self.title += w
            else:
                self.title += " " + w

        self.classes = classes

def isHeaderRow(row):
    try:
        row['valign']
        return True
    except:
        return False

def parseDate(times):
    days = []
    for time in times:
        if time.p.string == " ":
            days.append(0)
        elif time.p.string == None:
            days.append(parseDoubleDate(time))
        else:
            days.append(1)
    return days

def parseDoubleDate(time):
    prevTime = time.p.br.previous_sibling
    nextTime = time.p.br.next_sibling
    if (prevTime == u"\u00A0" and nextTime != u"\u00A0"):
        return 2;
    elif (nextTime == u"\u00A0" and prevTime != u"\u00A0"):
        return 1;
    elif (nextTime != u"\u00A0" and prevTime != u"\u00A0"):
        return 3;
    else:
        return 0;

def parseCourse(course_data):
    title = course_data[0].find('b').string # parse title into CSCI CODE and Course Name
    courses = []

    for i in range(1, len(course_data)):
        courseInfo = course_data[i].find_all('td')

        try:
            course = {}
            course['crn'] = courseInfo[1].find('b').string
            course['section'] = courseInfo[2].string
            course['type'] = courseInfo[3].string
            course['credithours'] = courseInfo[4].string
            course['days'] = parseDate(courseInfo[6:11])

            course['times'] = courseInfo[11].string
            if (course['times'] == None):
                time_one = courseInfo[11].br.previous_sibling
                time_two = courseInfo[11].br.next_sibling
                course['times'] = "ONE(" + time_one + ") TWO(" + time_two + ")"

            course['location'] = courseInfo[12].string
            if (course['location'] == None):
                loc_one = courseInfo[12].br.previous_sibling
                loc_two = courseInfo[12].br.next_sibling
                course['location'] = "ONE(" + loc_one + ") TWO(" + loc_two + ")"

            course['max'] = courseInfo[13].p.string
            if (course['max'] == None):
                open_ = courseInfo[13].p.br.previous_sibling
                disp = courseInfo[13].p.br.next_sibling
                course['max'] = open_.replace(" ", "") + " " + disp.replace(" ", "")

            course['current'] = courseInfo[14].p.string
            if (course['current'] == None):
                open_curr = courseInfo[14].p.br.previous_sibling
                disp_curr = courseInfo[14].p.br.next_sibling
                course['current'] = "FIRST("+ open_curr.replace(" ", "") + ") SEC("+ disp_curr.replace(" ", "") + ")"

            try:
                course['waitlist'] = courseInfo[16].p.string
                if course['waitlist'] == None:
                    course['waitlist'] = 0
            except:
                course['waitlist'] = 'NA'

            if courseInfo[20].string != None:
                course['prof'] = courseInfo[20].string.strip(' \t\n\r')
            else:
                first_prof = courseInfo[20].br.previous_sibling
                sec_prof = courseInfo[20].br.next_sibling
                course['prof'] = "ONE("+first_prof.strip(' \t\n\r') + ") TWO(" + sec_prof.strip(' \t\n\r') + ")"

            courses.append(course)
        except Exception as e:
            pass

    c = Course(title, courses)
    return c

def parseUrl(url):
    pageCount = 1
    courses = []
    j = 0
    while j < pageCount:
        newUrl = url + "&s_numb=&n=" + setPageHelper(j+1)
        html_doc = requests.get(newUrl).text
        print(newUrl)
        # use bs4
        # MARK: PAGECOUNT
        soup = BeautifulSoup(html_doc, 'lxml')

        try:
            pageCount = len(soup.find_all('table', attrs={'class': 'plaintable'})[3].find('center').find_all('a')) + 1
        except:
            pageCount = 1

        # MARK: ROWS
        # for w in soup.find_all('select')[1].find_all('option')[1:]:
        #     print("\""+w['value'], end='\",')

        rows = soup.find_all('table', attrs={'class': 'dataentrytable'})[1].find_all('tr')

        headerIndexs = []
        for i, row in enumerate(rows):
            if isHeaderRow(rows[i]):
                headerIndexs.append(i)

        courses_raw = []
        for i in range(0, len(headerIndexs) - 1):
            course_raw = rows[headerIndexs[i]:(headerIndexs[i+1])]
            courses_raw.append(course_raw)
        course_raw = rows[headerIndexs[len(headerIndexs) - 1]:]
        courses_raw.append(course_raw)

        for course in courses_raw:
            courses.append(parseCourse(course))
        j += 1
    return courses

def setPageHelper(page):
    if page < 1:
        return '1'
    elif page == 1:
        return '1'
    else:
        return str((20 * (page - 1)) + 1)

def main():
    # fall subjects
    # subjects = ["ACSC", "ANAT", "ARTC", "ARBC", "ARCH", "ASSC", "BIOC", "BIOE", "BIOL", "BMNG", "BUSI", "CANA", "CHEE", "CHEM", "CHIN", "CIVL", "CLAS", "COMM", "CH_E", "CPST", "CSCI", "CTMP", "CRWR", "DEHY", "DENT", "DMUT", "EMSP", "ERTH", "ECON", "ECED", "ECMM", "ENGI", "INWK", "ENGM", "ENGL", "ENSL", "ENVE", "ENVS", "ENVI", "EURO", "FILM", "FIGA", "FIGS", "FOSC", "FREN", "GWST", "GEOG", "GERM", "HESA", "HINF", "HLTH", "HPRO", "HSCE", "HAHP", "HSTC", "HIST", "HUCD", "INDG", "IENG", "INFX", "INFO", "INTE", "INTD", "IPHE", "ITAL", "JOUR", "KINE", "KING", "LAWS", "LEIS", "MRIT", "MGMT", "MARA", "MARI", "MATL", "MATH", "MTHA", "MECH", "MEDP", "MEDR", "MICI", "MINE", "MUSC", "NESC", "NUMT", "NURS", "OCCU", "OCEA", "ORAL", "PHDP", "PATH", "PERF", "PERI", "PHAC", "PHAR", "PHIL", "PHYC", "PHYL", "PHYT", "PLAN", "POLI", "PGPH", "PEAS", "PROS", "PSYR", "PSYO", "PUAD", "RADT", "REGN", "RELS", "RSPT", "RUSN", "SCIE", "SLWK", "SOSA", "SPAN", "STAT", "SUST", "THEA", "TYPR", "VISC"]
    # winter subjects
    subjects = ["ACSC","ANAT","ARTC","ARBC","ARCH","ASSC","BIOC","BIOE","BIOL","BMNG","BUSI","CANA","CNLT","CHEE","CHEM","CHIN","CIVL","CLAS","COMM","CH_E","CPST","CSCI","CTMP","CRWR","DEHY","DENT","DMUT","EMSP","ERTH","ECON","ECED","ECMM","ENGI","INWK","ENGM","ENGL","ENSL","ENVA","ENVE","ENVS","ENVI","EURO","FILM","FOSC","FREN","GWST","GEOG","GERM","HESA","HINF","HLTH","HPRO","HSCE","HAHP","HSTC","HIST","HUCD","INDG","IENG","INFX","INFO","INTE","INTD","IPHE","ITAL","JOUR","KINE","KING","LAWS","LEIS","MRIT","MGMT","MGTA","MARA","MARI","MATL","MATH","MECH","MDLT","MEDP","MEDR","MICI","MINE","MUSC","NESC","NUMT","NURS","OCCU","OCEA","ORAL","PHDP","PATH","PERF","PERI","PHAC","PHAR","PHIL","PHYC","PHYL","PHYT","PLAN","POLI","PGPH","PEAS","PROS","PSYR","PSYO","PUAD","RADT","REGN","RELS","RSPT","RUSN","SCIE","SLWK","SOSA","SPAN","STAT","SUST","THEA","TYPR","VISC"]
    terms = {
    "winter":"201820",
    "fall":"201810",
    "fall/winter":"201810%\2C201820"
    }
    district = "100"
    
    database = db.Database()

    for subject in subjects:
        url = "https://dalonline.dal.ca/PROD/fysktime.P_DisplaySchedule?s_term="+ terms["winter"] + "&s_subj="+ subject + "&s_district=" + district

                # THIS IS THE FINAL ARRAY WITH ALL INFORMATION IN IT
                # use as data[courseindex] .title or .classes[classindex] for full info
        data = parseUrl(url)
        database.saveCourses(data)

if __name__ == "__main__":
  main()
