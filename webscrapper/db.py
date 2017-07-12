import MySQLdb as mysql

class Database {

        host = 'localhost'
        user = 'root'
        password = 'temp_pass'
        db = 'dal'

        def __init__(self):
            # create database connection
            self.connection = mysql.connect(self.host, self.user, self.password, self.db)
            self.cursor = self.connection.cursor()

        def __del__(self):
            self.connection.close()'

        def saveCourse():
            # set up tables in db first 
}
