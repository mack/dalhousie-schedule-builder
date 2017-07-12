import pymysql as mysql

class Database:

        host = '127.0.0.1'
        user = 'root'
        password = 'temp_pass'
        db = 'dal'

        def __init__(self):
            # create database connection

            self.connection = mysql.connect(host=self.host, unix_socket='/tmp/mysql.sock', user=self.user, passwd=self.password, db=self.db)
            self.cursor = self.connection.cursor()

        def __del__(self):
            self.connection.close()

        def saveCourse(self):
            try:
                self.cursor.execute("INSERT INTO courses(title) VALUES ('{0}')".format("testingmacktesting"))
                self.connection.commit()
            except Exception as e:
                print(e)
                self.connection.rollback()
