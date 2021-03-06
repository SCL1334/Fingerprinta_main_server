# Fingerprinta
Fingerprinta is a convenient and user-friendly attendance management solution including employee absence and the fingerprint check-in, with the flexibility to apply different attendance rules to generate an accurate attendance status indicators.  

![Explain_Chart](https://user-images.githubusercontent.com/93208804/170914550-a4b1e1b9-7d2c-4b98-82e7-bf50838ca3ee.png)


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
>Note: The Demo Site is built on Amazon EC2 using dummy functionality in place of the sensor.  

| Role    | Entrance | Test Account | Test Password |
| :-----: | :------: | :----------: | :-----------: |
| Staff   | https://shihlan.com/staff_signin.html | cde@staff.com | test | 
| Student | https://shihlan.com/student_signin.html | GeGuoAn@armyspy.com | test | 

## Fingerprint Check-in Demo
https://user-images.githubusercontent.com/93208804/170881523-d3e20f7f-d3bf-4c61-bb05-861340821883.mp4

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

<h2 id="operations"><a href="/doc/operation_detail.md">Operations</a></h2> 

### Pre-Procedure

Staff needs to confirm the setup below before starting. 

*  [Initiate calendar](/doc/operation_detail.md#user-content-initiate_calendar) 
*  [Set class components](/doc/operation_detail.md#user-content-set_class_components)    
   * [Set class group](/doc/operation_detail.md#user-content-set_class_group)  
   * [Set class type](/doc/operation_detail.md#user-content-set_class_type)  
   * [Set class attendance routines](/doc/operation_detail.md#user-content-set_class_routine)  
* [Set at least one class](/doc/operation_detail.md#user-content-set_class)  
* [Add students](/doc/operation_detail.md#user-content-add_students)  
  * [Add one student](/doc/operation_detail.md#user-content-add_one_student)  
  * [Add students list for one class](/doc/operation_detail.md#user-content-add_students_list)  
  * [Enroll student's fingerprint](/doc/operation_detail.md#user-content-enroll_fingerprint)  
* [Add staff](/doc/operation_detail.md#user-content-add_staff)   
* [Set Leave Type](/doc/operation_detail.md#user-content-set_leave_type)  


### Student operations
* [Punch with fingerprint](/doc/operation_detail.md#user-content-punch_with_fingerprint)   
* [Apply leave application](/doc/operation_detail.md#user-content-apply_leave_application)   
* [Edit leave application before staff auditting](/doc/operation_detail.md#user-content-edit_leave_application)  

### Satff operations
* [Manage Leave application](/doc/operation_detail.md#user-content-manage_leave_application)  
* [Manage attendance](/doc/operation_detail.md#user-content-manage_attendance)  
* [Edit general attendance rules](/doc/operation_detail.md#user-content-edit_general_rules)  
* [Edit weekly routine rules](/doc/operation_detail.md#user-content-edit_routine_rules)  
* [Add exception attendance date](/doc/operation_detail.md#user-content-add_exception_date)  



<h2 id="architecture">Architecture</h2> 

*Fingerprinta is designed to build on Local Area Network with Raspberry Pi and fingerprint sensor.  
![Architecture](https://user-images.githubusercontent.com/93208804/170868965-8c533ee2-7dbe-47f2-aa1d-5207276247ce.png)


<h2 id="database_design">Database Design</h2> 

![DB_Schema](https://user-images.githubusercontent.com/93208804/170914500-c4719e97-f6bc-4e4c-9c8f-b881dd37a9e4.png)

<h2 id="future_features">Future Features</h2> 

* Cache of attendance rules 
* Clear error message
* Punch Reminder for student

<h2 id="contact">Contact</h2>  

* Author: Shih-Chun Lan
* Email: j19931119@gmail.com
