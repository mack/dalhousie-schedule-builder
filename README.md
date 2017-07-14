# DalhousieScheduleBuilder
Dal Schedule Builder is a web app built for Dalhousie students registering for classes. As a student myself, registering for classes was a pain, I'd hand draw a table and fill in classes. When I came upon a conflict, I would need to erase the classes from my table. This, and having to record all 'active' CRN's, left me with a messy page and was a pain.

## How do I keep classes up-to-date?
I'm web scrapping [Dal TimeTable](https://dalonline.dal.ca/PROD/fysktime.P_DisplaySchedule) for the information. I'll have my web scrapper run aprox. once per day to check for changes.

## TODO
* Format incorrectly formated data in DB
* REST-API (php, go, or node)
* Course table to API
* Schedule to API
