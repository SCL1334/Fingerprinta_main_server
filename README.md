# Fingerprinta
Fingerprinta is a convenient and user-friendly attendance management solution including employee absence and the fingerprint check in, with the flexibility to apply different attendance rules to generate an accurate attendance status indicators.  

<img width="1371" alt="Explain_Chart" src="https://user-images.githubusercontent.com/93208804/170868900-8b6235e6-1c7d-4c00-bc3c-7214e6891ce0.png">

### Additional
Below is the pair list of the terms used in school / company scenarios.    


| School (current) |  Company  | 
| :---------: | :------------: | 
| Class Type  | Shift          | 
| Class Group | Department     | 
| Class       | Team           | 
| Staff       | Human Resource |
| Student     | Employee       | 

## Demo Site 
>Note: Demo Site is building on Amazon EC2 and replacing the sensor part with mock functions.  

| Role    | Entrance  | 
| :-----: | :----: | 
| Staff   | https://shihlan.com/staff_signin.html | 
| Student | https://shihlan.com/student_signin.html | 

## Table of Contents
* [Main Features](#main_features)
* [Operations](#operations)
* [Architecture](#architecture)
* [Database Design](#database_design)
* [Future Features](#future_features)
* [Contact](#contact)

<h2 id="main_features">Main Features</h2>

* Combine leave management system.
* Clocking in and out with a fingerprint scanner.
* Clear and visible chart for user attendance.  
* Flexible to set different attendance roles.

<h2 id="operations">Operations </h2> 

### [Pre-Procedure](/doc/operation_detail.md)  
Staff need to confirm below setup have been established before starting.
*  Initiate Calendar 
*  Set Class components 
   * Set Class group
   * Set Class type
   * Set Class attendance routines
* Set at least one class
* Add Students
  * Add one student
  * Add students list for one class
  * Enroll Student's fingerprint  
* Add staff 
* Set Leave Type


### [Student operations](/doc/operation_detail.md)
* Punch with fingerprint 
* Apply leave application 
* Edit leave application before staff auditting

### [Satff operations](/doc/operation_detail.md)
* Manage Leave Application
* Manage Attendance
* Change general attendance role
* Edit weekly routine role
* Add exception attendance date 



<h2 id="architecture">Architecture</h2> 

*Fingerprinta is designed to build on Local Area Network with Raspberry Pi and fingerprint sensor.  
![Architecture](https://user-images.githubusercontent.com/93208804/170868965-8c533ee2-7dbe-47f2-aa1d-5207276247ce.png)


<h2 id="database_design">Database Design</h2> 

![DB_Schema](https://user-images.githubusercontent.com/93208804/170869607-ebdd6e62-735a-49a4-bc41-16ea47baf633.png)

<h2 id="future_features">Future Features</h2> 

* Cache
* Clear error message
* Punch Remider
* Predict leave hours

<h2 id="contact">Contact</h2>  

* Author: Shih-Chun Lan
* Email: j19931119@gmail.com