# DalhousieScheduleBuilder
Dal Schedule Builder is a web app built for Dalhousie students registering for classes. As a student myself, registering for classes was a pain, I'd hand draw a table and fill in classes. When I came upon a conflict, I would need to erase the classes from my table. This, as well as  having to record all current CRN's, left me with a messy page. Hopefully this helps some people.

## How do I keep classes up-to-date?
I'm web scrapping [Dal TimeTable](https://dalonline.dal.ca/PROD/fysktime.P_DisplaySchedule) for the information. I'll have my web scrapper run aprox. once per day to check for changes.

## Preview
![Web](https://s11.postimg.org/uhxi0n47l/Screen_Shot_2017-07-28_at_2.33.52_PM.png "Website Preview")

## TODO
* Add clear all selected classes button
* Make Email functional
* View all classes page
* Click on CRN to view course information

# IN PROGRESS
* Make winter/fall selection functional

## Last 5 things completed
* Handle conflicting time classes (and offer suggestions)
* Update DB with winter information
* Figure out how to handle classes with C/D time (maybe make popup saying "We can't add classes with C/D at this time, however here is CLASS_NAME's CRN.")
* Display multiple class capacity counts and add proper color (fill-low, fill-med, fill-high)
* Added CRNs into element
