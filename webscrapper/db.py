import pymysql as mysql

class Database:
        host = '127.0.0.1'
        user = 'root'
        password = 'lalaland123'
        db = 'dal'

        def __init__(self):
            # create database connection
            self.connection = mysql.connect(host=self.host, unix_socket='/tmp/mysql.sock', user=self.user, passwd=self.password, db=self.db)
            self.cursor = self.connection.cursor()

        def __del__(self):
            self.connection.close()

        def saveCourses(self, courses):
            try:
                for i in range(0, len(courses)):
                    self.cursor.execute("INSERT INTO courses(title, category, code, term) VALUES (\"{0}\", \"{1}\", \"{2}\", 2);".format(courses[i].title, courses[i].category, courses[i].code))
                    self.connection.commit()
                    courseId = self.cursor.lastrowid
                    self.saveClass(courses[i].classes, courseId)

            except Exception as e:
                print("Error on save courses")
                print(e)
                self.connection.rollback()

        def addRelation(self, courseId, classId):
            try:
                self.cursor.execute("INSERT INTO course_classes(course, class) VALUES (\"{0}\", \"{1}\");".format(courseId, classId))
                self.connection.commit()

            except Exception as e:
                print("Error on add relation")
                print(e)
                self.connection.rollback()

        def saveClass(self, classes, courseId):
            try:
                for i in range(0, len(classes)):
                    if (len(classes) == 0):
                        print(courseId)
                    if (classes[i]['credithours'] == "-"):
                        classes[i]['credithours'] = 0
                    self.cursor.execute("INSERT INTO classes(crn, section, type, credit_hours, days, times, location, max, current, waitlist, prof) VALUES (\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",\"{8}\",\"{9}\",\"{10}\");".format(int(classes[i]['crn']), classes[i]['section'], classes[i]['type'], float(classes[i]['credithours']), self.convertDays(classes[i]['days']), classes[i]['times'], classes[i]['location'], classes[i]['max'], classes[i]['current'], classes[i]['waitlist'], classes[i]['prof']))
                    self.connection.commit()
                    classId = self.cursor.lastrowid
                    self.addRelation(courseId, classId)

            except Exception as e:
                print("Error on save classes")
                print(e)
                self.connection.rollback()
                return -1

        def convertDoubleDays(self,days):
            dayString = "ONE("
            if days[0] == 1 or days[0] == 3:
                dayString += "MON, "
            if days[1] == 1 or days[1] == 3:
                dayString += "TUE, "
            if days[2] == 1 or days[2] == 3:
                dayString += "WED, "
            if days[3] == 1 or days[3] == 3:
                dayString += "THU, "
            if days[4] == 1 or days[4] == 3:
                dayString += "FRI, "
            dayString = dayString[:-2]

            dayString += ") TWO("
            if days[0] == 2 or days[0] == 3:
                dayString += "MON, "
            if days[1] == 2 or days[1] == 3:
                dayString += "TUE, "
            if days[2] == 2 or days[2] == 3:
                dayString += "WED, "
            if days[3] == 2 or days[3] == 3:
                dayString += "THU, "
            if days[4] == 2 or days[4] == 3:
                dayString += "FRI, "
            dayString = dayString[:-2]
            dayString += ")"
            return dayString

        def convertDays(self, days):
            for i in range(0, len(days)):
                if days[i] == 2 or days[i] == 3:
                    return self.convertDoubleDays(days)
            dayString = ""
            try:
                if days[0] == 1:
                    dayString += "MON, "
                if days[1] == 1:
                    dayString += "TUE, "
                if days[2] == 1:
                    dayString += "WED, "
                if days[3] == 1:
                    dayString += "THU, "
                if days[4] == 1:
                    dayString += "FRI, "
            except Exception as c:
                print("Error on convertDays")

            return dayString[:-2]
