# Fingerprinta
Fingerprinta is a convenient and user-friendly attendance management solution including employee absence and the fingerprint check-in, with the flexibility to apply different attendance rules to generate an accurate attendance status indicators.  

<img width="1171" alt="Explain_Chart" src="https://user-images.githubusercontent.com/93208804/170891507-9d5a3286-34b9-49f6-a624-b542e9ad017a.png">

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

![DB_Schema](https://user-images.githubusercontent.com/93208804/170891626-378e93c3-be65-4c0b-9a0f-284278fbdbbb.png)

<h2 id="future_features">Future Features</h2> 

* Cache
* Clear error message
* Punch Reminder

<h2 id="contact">Contact</h2>  

* Author: Shih-Chun Lan
* Email: j19931119@gmail.com
