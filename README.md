**Site isn't functional anymore. I was switching over to AWS, then other life priorities came up. 1 year later (and after some requests) I'm redoing this project :)**
~Check out the live website, we have mobile support (well... kinda), at [dalschedulebuilder.com](http://dalschedulebuilder.com)~ 

# DalhousieScheduleBuilder [![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
Dal Schedule Builder is a web app built for Dalhousie students registering for classes. As a student myself, registering for classes was a pain, I'd hand draw a table and fill in classes. When I came upon a conflict, I would need to erase the classes from my table. This, as well as  having to record all current CRN's, left me with a messy page. Hopefully this helps some people.

## How do I keep classes up-to-date?
I'm web scrapping [Dal TimeTable](https://dalonline.dal.ca/PROD/fysktime.P_DisplaySchedule) for the information. I'll have my web scrapper run aprox. once per day to check for changes.

## Preview
<p align="center">
  <img src="http://i.imgur.com/rBXzpbV.png" alt="Web Preview"/>
</p>

## Activity
<p align="center">
  I thought this might be interesting for some to see how many users were using it so far...
  <img src="https://i.imgur.com/7xmlE04.png" alt="Web Preview"/>
</p>


## TODO
* Make Email functional
* View all classes page
* Click on CRN to view course information

## IN PROGRESS

## Last 5 things completed
* Add clear all selected classes button
* Make winter/fall selection functional
* Handle conflicting time classes (and offer suggestions)
* Update DB with winter information
* Figure out how to handle classes with C/D time (maybe make popup saying "We can't add classes with C/D at this time, however here is CLASS_NAME's CRN.")
