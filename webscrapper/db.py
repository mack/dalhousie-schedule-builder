import pymysql as mysql

class Database:

        host = '127.0.0.1'
        user = 'root'
        password = 'lalaland123' # remember to switch before git commit
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
                    self.cursor.execute("INSERT INTO courses(title) VALUES (\"{0}\");".format(courses[i].title))
                    self.connection.commit()
                    courseId = self.cursor.lastrowid
                    self.saveClass(courses[i].classes, courseId)

            except Exception as e:
                print(e)
                self.connection.rollback()

        def saveClass(self, classes, courseId):
            try:
                for i in range(0, 1):
                    

                    self.cursor.execute("INSERT INTO classes(crn, section, type, credit_hours, days, times, location, max, current, waitlist, prof) VALUES (\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",\"{8}\",\"{9}\",\"{10}\");".format(int(classes[i]['crn']), classes[i]['section'], classes[i]['type'], int(classes[i]['credithours']), self.convertDays(classes[i]['days']), classes[i]['times'], classes[i]['location'], classes[i]['max'], classes[i]['current'], classes[i]['waitlist'], classes[i]['prof']))
                    self.connection.commit()


            except Exception as e:
                print(e)
                self.connection.rollback()
                return -1

        def convertDays(self, days):
            dayString = ""
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

            return dayString[:-2]
