# DalhousieScheduleBuilder
Dal Schedule Builder is a web app built for Dalhousie students registering for classes. As a student myself, registering for classes was a pain, I'd hand draw a table and fill in classes. When I came upon a conflict, I would need to erase the classes from my table. This, as well as  having to record all current CRN's, left me with a messy page. Hopefully this helps some people.

## How do I keep classes up-to-date?
I'm web scrapping [Dal TimeTable](https://dalonline.dal.ca/PROD/fysktime.P_DisplaySchedule) for the information. I'll have my web scrapper run aprox. once per day to check for changes.

## Preview
![Web](http://i.imgur.com/0yBTvOn.png "Website Preview")

## TODO
* Add CRNs to CRN element
* Add refresh CRN's button
* Figure out how to handle classes with C/D time (maybe make popup saying "We can't add classes with C/D at this time, however here is CLASS_NAME's CRN.")
* Display multiple class capacity counts and add proper color (fill-low, fill-med, fill-high)
* Update DB with winter information
* Make winter/fall selection functional
* Add clear all selected classes button
* Handle conflicting time classes (and offer suggestions)
* Make Email functional
* View all classes page

## Last 5 things completed
* Add notifications
* Make classes persistent storage (incase of page reload)
* Functional remove classes button
* Change add-class-btn when class selected in course-table
* Give same classes same color
