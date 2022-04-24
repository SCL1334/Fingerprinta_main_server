$(document).ready(async () => {
  const leaveTypeTable = { 1: '事假', 2: '病假' };
  const leaveStatusTable = { 0: '待審核', 1: '已審核' };
  const AttendanceStatus = {
    0: '正常', 1: '未打卡', 2: '下課未打卡', 3: '遲到', 4: '早退',
  };
  const sensorUrl = 'http://127.0.0.1:5000';
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/staffs/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, leadClasses,
    } = data.data;
    $('.userName').text(`你好 ${data.data.name}`);

    // sign out btn
    $('.signout').click(async () => {
      try {
        const responseData = await axios.post('/api/1.0/signout');
        const { data } = await responseData;
        if (data) {
          location.href = location.href.replace('.html', '_signin.html');
        }
      } catch (err) {
        console.log(err);
      }
    });

    // sensor operation
    $('#sensor_identify').click(async () => {
      const sensorIdentifyRes = await axios.post(`${sensorUrl}/identify`);
      const sensorIdentifyResult = sensorIdentifyRes.data;
      if (sensorIdentifyResult) {
        alert('指紋機：正在切換到打卡模式');
      } else {
        alert('指紋機：打卡模式啟動失敗');
      }
    });

    $('#sensor_stop').click(async () => {
      const sensorStopRes = await axios.post(`${sensorUrl}/turnoff`);
      const sensorStopResult = sensorStopRes.data;
      if (sensorStopResult) {
        alert('指紋機：切換到待機模式');
      } else {
        alert('指紋機：待機模式啟動失敗');
      }
    });

    // accounts manage
    $('.account_manage').click(async () => {
      $('.content').empty();

      const accountCompenents = $('<div></div>').attr('class', 'account_compenent');
      const studentAccounts = $('<div></div>').attr('class', 'student_account').text('學生帳號管理');
      const staffAccounts = $('<div></div>').attr('class', 'staff_account').text('校務人員帳號管理');
      const accountManageBoard = $('<div></div>').attr('class', 'account_manage_board');
      accountCompenents.append(studentAccounts, staffAccounts, accountManageBoard);
      $('.content').append(accountCompenents);
      // student account part
      studentAccounts.click(async () => {
        const studentUrl = '/api/1.0/students';
        let studentAddForm = '';
        try {
          const classesRaw = await axios.get('/api/1.0/classes');
          const classes = classesRaw.data.data;
          const classesOptions = classes.reduce((acc, cur) => {
            acc += `<option value=${cur.id}>${cur.class_type_name}-${cur.batch}-${cur.class_group_name}</option>`;
            return acc;
          }, '');
          accountManageBoard.empty();
          studentAddForm = `
          <div class="student_form">新增學生帳號
          <form action="${studentUrl}" method="POST">
            <select id='student_class'>
              <option value=null>請選擇學生班級</option>
              ${classesOptions}
            </select>
            <input id='student_name' name='name' type='text' value='葉承彥'>
            <input id='student_email' name='email' type='email' value='sean@test.com'>
            <input id='student_password' name='password' type='password' value='1234'>
            <button type="submit">送出</button>
          </form>
        </div>
          `;
        } catch (err) {
          console.log(err);
          console.log(err.response.data);
          return;
        }
        accountManageBoard.append(studentAddForm);

        // Add new student trigger
        $('.student_form form').submit(async (newStudentSubmitEvent) => {
          try {
            newStudentSubmitEvent.preventDefault();
            const addStudentName = $('#student_name').val();
            const addStudentEmail = $('#student_email').val();
            const addStudentPassword = $('#student_password').val();
            const addStudentClass = $('#student_class').val();
            const addStudentRes = await axios(studentUrl, {
              method: 'POST',
              data: {
                name: addStudentName,
                email: addStudentEmail,
                password: addStudentPassword,
                class_id: addStudentClass,
              },
              headers: {
                'content-type': 'application/json',
              },
            });
            const addStudentResult = addStudentRes.data.data;
            if (addStudentResult) {
              const tr = $('<tr></tr>');
              const td_id = $('<td></td>').text(addStudentResult.insert_id);
              const td_student_name = $('<td></td>').text(addStudentName);
              const td_student_email = $('<td></td>').text(addStudentEmail);
              const td_student_class = $('<td></td>').text($('#student_class option:selected').text());
              const td_student_finger = $('<td></td>').attr('class', 'finger_id').text('未註冊');
              const td_delete = $('<td></td>');
              const td_enroll = $('<td></td>');
              const delete_btn = $('<button></button>').text('刪除').click(async (deleteButtonEvent) => {
                const deleteStudentRes = await axios.delete(`${studentUrl}/${addStudentResult.insert_id}`);
                const deleteStudentResult = deleteStudentRes.data;
                if (deleteStudentResult) {
                  $(deleteButtonEvent.target).parent().parent().remove();
                }
              });
              const enroll_btn = $('<button></button>').text('註冊指紋').click(async (enrollButtonEvent) => {
                const enrollFingerRes = await axios.post(`${studentUrl}/${addStudentResult.insert_id}/fingerprint`);
                const enrollFingerResult = enrollFingerRes.data.data;
                if (enrollFingerResult) {
                  $(enrollButtonEvent.target).parent().siblings('.finger_id').text(enrollFingerResult.finger_id);
                }
              });
              td_enroll.append(enroll_btn);
              td_delete.append(delete_btn);
              tr.append(td_id, td_student_name, td_student_email, td_student_class, td_student_finger, td_enroll, td_delete);
              table.append(tr);
            }
          } catch (err) {
            console.log(err);
            console.log(err.response.data);
          }
        });

        // init table
        const table = $('<table></table>').attr('class', 'students_result');
        const tr = $('<tr></tr>');
        const heads = ['ID', '名稱', 'email', '班級', '指紋ID', '', ''];
        heads.forEach((head) => {
          const th = $('<th></th>').text(head);
          tr.append(th);
        });
        table.append(tr);
        accountManageBoard.append(table);
        // show all exists students
        try {
          const studentsDetail = await axios.get(studentUrl);
          const studentsData = studentsDetail.data.data;
          studentsData.forEach((student) => {
            const tr = $('<tr></tr>');
            const td_id = $('<td></td>').text(student.id);
            const td_student_name = $('<td></td>').text(student.name);
            const td_student_email = $('<td></td>').text(student.email);
            const td_student_class = $('<td></td>').text(`${student.class_type_name}-${student.batch}-${student.class_group_name}`);
            const td_student_finger = $('<td></td>').attr('class', 'finger_id').text(student.finger_id || '未註冊');
            const td_delete = $('<td></td>');
            const td_enroll = $('<td></td>');
            const delete_btn = $('<button></button>').text('刪除').click(async (deleteButtonEvent) => {
              const deleteStudentRes = await axios.delete(`${studentUrl}/${student.id}`);
              const deleteStudentResult = deleteStudentRes.data;
              if (deleteStudentResult) {
                $(deleteButtonEvent.target).parent().parent().remove();
              }
            });
            const enroll_btn = $('<button></button>').text('註冊指紋').click(async (enrollButtonEvent) => {
              const enrollFingerRes = await axios.post(`${studentUrl}/${student.id}/fingerprint`);
              const enrollFingerResult = enrollFingerRes.data.data;
              if (enrollFingerResult) {
                $(enrollButtonEvent.target).parent().siblings('.finger_id').text(enrollFingerResult.finger_id);
              }
            });
            td_enroll.append(enroll_btn);
            td_delete.append(delete_btn);
            tr.append(td_id, td_student_name, td_student_email, td_student_class, td_student_finger, td_enroll, td_delete);
            table.append(tr);
          });
        } catch (err) {
          console.log(err);
        }
      });

      // staff account part
    });

    // class manage
    $('.class_manage').click(async () => {
      $('.content').empty();
      const classCompenents = $('<div></div>').attr('class', 'class_compenent');
      const classTypes = $('<div></div>').attr('class', 'class_type').text('培訓形式設定');
      const classGroups = $('<div></div>').attr('class', 'class_group').text('培訓班別設定');
      const classes = $('<div></div>').attr('class', 'classes').text('班級基礎資訊設定');
      const classManageBoard = $('<div></div>').attr('class', 'class_manage_board');
      classCompenents.append(classes, classTypes, classGroups, classManageBoard);
      $('.content').append(classCompenents);

      // classes manage
      classes.click(async () => {
        const classesUrl = '/api/1.0/classes';

        // class Add form building
        let classAddForm = '';
        try {
          const classTypesRaw = await axios.get(`${classesUrl}/types`);
          const classGroupsRaw = await axios.get(`${classesUrl}/groups`);
          const classTypes = classTypesRaw.data.data;
          const classGroups = classGroupsRaw.data.data;
          const classTypesOptions = classTypes.reduce((acc, cur) => {
            acc += `<option value=${cur.id}>${cur.name}</option>`;
            return acc;
          }, '');
          const classGroupsOptions = classGroups.reduce((acc, cur) => {
            acc += `<option value=${cur.id}>${cur.name}</option>`;
            return acc;
          }, '');
          classManageBoard.empty();
          classAddForm = `
          <div class="class_form">新增班級
            <form action="${classesUrl}" method="POST">
              <select id='class_type'>
                <option value=null>請選擇班級培訓形式</option>
                ${classTypesOptions}
              </select>
              <input id='class_batch' name='batch' type="number">
              <select id='class_group'>
                <option value=null>請選擇班級培訓班別</option>
                ${classGroupsOptions}
              </select>
              <input id='class_start_date' name='start_date' type="date">
              <input id='class_end_date' name='end_date' type="date">
              <button type="submit">送出</button>
            </form>
          </div>
          `;
        } catch (err) {
          console.log(err);
          console.log(err.response.data);
          return;
        }
        classManageBoard.append(classAddForm);

        // Add new class trigger
        $('.class_form form').submit(async (newClassSubmitEvent) => {
          try {
            newClassSubmitEvent.preventDefault();
            const addClassType = $('#class_type').val();
            const addClassBatch = $('#class_batch').val();
            const addClassGroup = $('#class_group').val();
            const addClassStart = $('#class_start_date').val();
            const addClassEnd = $('#class_end_date').val();
            const addClassRes = await axios(classesUrl, {
              method: $('.class_form form').attr('method'),
              data: {
                class_type_id: addClassType,
                batch: addClassBatch,
                class_group_id: addClassGroup,
                start_date: addClassStart,
                end_date: addClassEnd,
              },
              headers: {
                'content-type': 'application/json',
              },
            });
            const addClassResult = addClassRes.data.data;
            if (addClassResult) {
              const tr = $('<tr></tr>');
              const td_id = $('<td></td>').text(addClassResult.insert_id);
              const td_class_type = $('<td></td>').text($('#class_type option:selected').text());
              const td_class_batch = $('<td></td>').text(addClassBatch);
              const td_class_group = $('<td></td>').text($('#class_group option:selected').text());
              const td_class_start = $('<td></td>').text(addClassStart);
              const td_class_end = $('<td></td>').text(addClassEnd);
              const td_delete = $('<td></td>');
              const delete_btn = $('<button></button>').text('刪除').click(async (deleteButtonEvent) => {
                const deleteClassRes = await axios.delete(`${classesUrl}/${addClassResult.insert_id}`);
                const deleteClassResult = deleteClassRes.data;
                if (deleteClassResult) {
                  $(deleteButtonEvent.target).parent().parent().remove();
                }
              });
              td_delete.append(delete_btn);
              tr.append(td_id, td_class_type, td_class_batch, td_class_group, td_class_start, td_class_end, td_delete);
              table.append(tr);
            }
          } catch (err) {
            console.log(err);
            console.log(err.response.data);
          }
        });

        // init table
        const table = $('<table></table>').attr('class', 'classes_result');
        const tr = $('<tr></tr>');
        const heads = ['ID', '培訓類型', 'Batch', '培訓班別', '開學', '結業', ''];
        heads.forEach((head) => {
          const th = $('<th></th>').text(head);
          tr.append(th);
        });
        table.append(tr);

        // show all exist classes
        try {
          const classesDetail = await axios.get(classesUrl);
          const classesData = classesDetail.data;
          classesData.data.forEach((clas) => {
            const tr = $('<tr></tr>');
            const td_id = $('<td></td>').text(clas.id);
            const td_class_type = $('<td></td>').text(clas.class_type_name);
            const td_class_batch = $('<td></td>').text(clas.batch);
            const td_class_group = $('<td></td>').text(clas.class_group_name);
            const td_class_start = $('<td></td>').text(clas.start_date);
            const td_class_end = $('<td></td>').text(clas.end_date);
            const td_delete = $('<td></td>');
            const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
              const deleteClassRes = await axios.delete(`${classesUrl}/${clas.id}`);
              const deleteClassResult = deleteClassRes.data;
              if (deleteClassResult) {
                $(event.target).parent().parent().remove();
              }
            });
            td_delete.append(delete_btn);
            tr.append(td_id, td_class_type, td_class_batch, td_class_group, td_class_start, td_class_end, td_delete);
            table.append(tr);
          });
          classManageBoard.append(table);
        } catch (err) {
          console.log(err);
        }
      });

      // class type manage
      classTypes.click(async () => {
        const classTypeUrl = '/api/1.0/classes/types';
        classManageBoard.empty();

        const add = $('<input>').attr('class', 'add_class_type').attr('type', 'text').val('請輸入培訓形式名稱');
        const addBtn = $('<button></button>').attr('class', 'add_class_type_btn').text('新增');
        const table = $('<table></table>').attr('class', 'class_type_result');
        const tr = $('<tr></tr>');
        const heads = ['ID', '培訓形式名稱', ''];
        heads.forEach((head) => {
          const th = $('<th></th>').text(head);
          tr.append(th);
        });
        table.append(tr);
        classManageBoard.append(add, addBtn, table);

        addBtn.click(async () => {
          const newType = $('.add_class_type').val();
          try {
            const addTypeRes = await axios(classTypeUrl, {
              method: 'POST',
              data: {
                type_name: newType,
              },
              headers: {
                'content-type': 'application/json',
              },
            });
            const addTypeResult = addTypeRes.data;
            if (addTypeResult) {
              const tr = $('<tr></tr>');
              const td_id = $('<td></td>').text(addTypeResult.data.insert_id);
              const td_name = $('<td></td>').text(newType);
              const td_delete = $('<td></td>');
              const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
                const deleteTypeRes = await axios.delete(`${classTypeUrl}/${addTypeResult.data.insert_id}`);
                const deleteTypeResult = deleteTypeRes.data;
                if (deleteTypeResult) {
                  $(event.target).parent().parent().remove();
                }
              });
              td_delete.append(delete_btn);
              tr.append(td_id, td_name, td_delete);
              table.append(tr);
            }
          } catch (err) {
            console.log(err);
          }
        });
        try {
          const classTypeDetail = await axios.get(classTypeUrl);
          const classTypeData = classTypeDetail.data;
          classTypeData.data.forEach((classType) => {
            const tr = $('<tr></tr>');
            const td_id = $('<td></td>').text(classType.id);
            const td_name = $('<td></td>').text(classType.name);
            const td_delete = $('<td></td>');
            const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
              const deleteTypeRes = await axios.delete(`${classTypeUrl}/${classType.id}`);
              const deleteTypeResult = deleteTypeRes.data;
              if (deleteTypeResult) {
                $(event.target).parent().parent().remove();
              }
            });
            td_delete.append(delete_btn);
            tr.append(td_id, td_name, td_delete);
            table.append(tr);
          });
        } catch (err) {
          console.log(err);
        }
      });

      // class group manage
      classGroups.click(async () => {
        const classGroupUrl = '/api/1.0/classes/groups';
        classManageBoard.empty();

        const add = $('<input>').attr('class', 'add_class_group').attr('type', 'text').val('請輸入培訓班別名稱');
        const addBtn = $('<button></button>').attr('class', 'add_class_group_btn').text('新增');
        const table = $('<table></table>').attr('class', 'class_group_result');
        const tr = $('<tr></tr>');
        const heads = ['ID', '培訓班別名稱', ''];
        heads.forEach((head) => {
          const th = $('<th></th>').text(head);
          tr.append(th);
        });
        table.append(tr);
        classManageBoard.append(add, addBtn, table);

        addBtn.click(async () => {
          const newGroup = $('.add_class_group').val();
          try {
            const addGroupRes = await axios(classGroupUrl, {
              method: 'POST',
              data: {
                group_name: newGroup,
              },
              headers: {
                'content-type': 'application/json',
              },
            });
            const addGroupResult = addGroupRes.data;
            if (addGroupResult) {
              const tr = $('<tr></tr>');
              const td_id = $('<td></td>').text(addGroupResult.data.insert_id);
              const td_name = $('<td></td>').text(newGroup);
              const td_delete = $('<td></td>');
              const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
                const deleteGroupRes = await axios.delete(`${classGroupUrl}/${addGroupResult.data.insert_id}`);
                const deleteGroupResult = deleteGroupRes.data;
                if (deleteGroupResult) {
                  $(event.target).parent().parent().remove();
                }
              });
              td_delete.append(delete_btn);
              tr.append(td_id, td_name, td_delete);
              table.append(tr);
            }
          } catch (err) {
            console.log(err);
          }
        });
        try {
          const classGroupDetail = await axios.get(classGroupUrl);
          const classGroupData = classGroupDetail.data;
          classGroupData.data.forEach((classGroup) => {
            const tr = $('<tr></tr>');
            const td_id = $('<td></td>').text(classGroup.id);
            const td_name = $('<td></td>').text(classGroup.name);
            const td_delete = $('<td></td>');
            const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
              const deleteGroupRes = await axios.delete(`${classGroupUrl}/${classGroup.id}`);
              const deleteGroupResult = deleteGroupRes.data;
              if (deleteGroupResult) {
                $(event.target).parent().parent().remove();
              }
            });
            td_delete.append(delete_btn);
            tr.append(td_id, td_name, td_delete);
            table.append(tr);
          });
        } catch (err) {
          console.log(err);
        }
      });
    });

    // get attendance
    $('.get_attendances').click(async () => {
      $('.content').empty();

      const attendance = $('<div></div>').attr('class', 'attendance').text('出勤查詢');

      const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from');
      const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to');
      const searchBtn = $('<button></button>').attr('class', 'search_btn').text('查詢');
      const classOptions = $('<select></select>').attr('class', 'class_options');
      const classInitOption = $('<option value=0>全部班級</option>');
      classOptions.append(classInitOption);
      const studentOptions = $('<select></select>').attr('class', 'student_options');
      const studentInitOption = $('<option value=0>全部學生</option>');
      studentOptions.append(studentInitOption);

      // get init class options
      try {
        const classDetail = await axios.get('/api/1.0/classes');
        const classData = classDetail.data;
        classData.data.forEach((clas) => {
          classOptions.append(`
          <option value=${clas.id}>
            ${clas.class_type_name} -
            batch ${clas.batch} -
            ${clas.class_group_name}
          </option>`);
        });
      } catch (err) {
        console.log(err);
      }

      // get student option by class
      classOptions.change(async () => {
        try {
          studentOptions.empty();
          studentOptions.append(studentInitOption);
          if ($('.class_options').val() === '0') {
            return;
          }
          const studentDetail = await axios.get(`/api/1.0/classes/${$('.class_options').val()}/students`);
          const studentData = studentDetail.data;
          studentData.data.forEach((student) => {
            studentOptions.append(`<option value=${student.id}>${student.name}</option>`);
          });
        } catch (err) {
          console.log(err);
        }
      });

      attendance.append(classOptions, studentOptions, searchFrom, searchTo, searchBtn);
      $('.content').append(attendance);
      $('.search_btn').click(async () => {
        try {
          let table = $('.attendance_result');
          if (table) { table.text(''); }
          const classOption = $('.class_options').val();
          const classPath = (classOption === '0' || !classOption) ? '' : `/classes/${classOption}/`;
          const studentOption = $('.student_options').val();
          const studentPath = (studentOption === '0' || !studentOption) ? '' : `/students/${studentOption}/`;
          const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
          const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
          const url = `/api/1.0/${studentPath || classPath || 'students/'}attendances${from}${to}`;
          const attendanceSearchRes = await axios.get(url);
          const attendanceSearchResult = attendanceSearchRes.data.data;
          table = $('<table></table>').attr('class', 'attendance_result');
          const tr = $('<tr></tr>');
          const heads = ['打卡日期', '班級', '姓名', '應出席時間', '上課打卡', '下課打卡', '狀態', '轉換請假時段', '轉換時假時數', '備註', ''];
          heads.forEach((head) => {
            const th = $('<th></th>').text(head);
            tr.append(th);
          });
          table.append(tr);

          $('.attendance').append(table);
          attendanceSearchResult.forEach((attendanceSearch) => {
            const tr = $('<tr></tr>');
            const td_date = $('<td></td>').attr('class', 'attendance_date').text(attendanceSearch.date);
            const td_class = $('<td></td>').text(`
              ${attendanceSearch.class_type_name}-${attendanceSearch.batch}-${attendanceSearch.class_group_name}
            `);

            const td_name = $('<td></td>').attr('data-student_id', attendanceSearch.student_id).text(attendanceSearch.student_name);
            const td_punch_rule = $('<td></td>').text(`${attendanceSearch.start}-${attendanceSearch.end}`);

            const td_punch_in = $('<td></td>');
            const td_punch_out = $('<td></td>');
            const td_status = $('<td></td>');
            const td_leave_time = $('<td></td>');
            const td_leave_hours = $('<td></td>');
            const td_transfer_btn = $('<td></td>');
            const td_note = $('<td></td>').attr('class', 'note');

            const punch_in_detail = $('<div></div>');
            const punch_out_detail = $('<div></div>');
            const status_detail = $('<div></div>');
            const leave_time_detail = $('<div></div>');
            const leave_hours_detail = $('<div></div>');

            const punches = attendanceSearch.punch;
            if (punches) {
              punches.forEach((punch) => {
                console.log(punch);
                const { punch_in, punch_out } = punch;
                console.log(punch_out);
                const div_punch_in = $('<div></div>').text(punch_in || '無紀錄');
                const div_punch_out = $('<div></div>').text((punch_out || '無紀錄'));
                punch_in_detail.append(div_punch_in);
                punch_out_detail.append(div_punch_out);
              });

              td_punch_in.append(punch_in_detail);
              td_punch_out.append(punch_out_detail);
            }

            const leavesTransfer = attendanceSearch.trans_to_leave;
            if (leavesTransfer.length > 0) {
              leavesTransfer.forEach((leave) => {
                const {
                  reason, hours, start, end,
                } = leave;
                const div_status = $('<div></div>').text(reason);
                const div_leave_time = $('<div></div>').attr('class', 'leave_time').text(`${start}-${end}`);
                const div_leave_hours = $('<div></div>').append($('<input>').attr('type', 'number').attr('class', 'leave_hours').attr('value', hours));
                const div_trabsfer_btn = $('<div></div>');
                const div_note = $('<div></div>').append($('<input>').attr('class', 'note').attr('type', 'text').text(attendanceSearch.note || null));
                status_detail.append(div_status);
                leave_time_detail.append(div_leave_time);
                leave_hours_detail.append(div_leave_hours);
                const transfer_btn = $('<button></button>').text('轉換假單').click(async (transferButtonEvent) => {
                  console.log($(transferButtonEvent.target).parent());
                  // const approveLeaveRes = await axios.patch(`/api/1.0/leaves/${leaveSearch.id}`);
                  // const approveLeaveResult = approveLeaveRes.data;
                  // if (approveLeaveResult) {
                  //   $(approveButtonEvent.target).parent().siblings('.leave_status').text(leaveStatusTable[1]);
                  //   $(approveButtonEvent.target).remove();
                  // }
                });
                div_trabsfer_btn.append(transfer_btn);
                td_transfer_btn.append(div_trabsfer_btn);
                td_note.append(div_note);
              });
            } else {
              const div_status = $('<div></div>').text('normal');
              status_detail.append(div_status);
            }
            td_status.append(status_detail);
            td_leave_time.append(leave_time_detail);
            td_leave_hours.append(leave_hours_detail);

            tr.append(td_date, td_class, td_name, td_punch_rule, td_punch_in, td_punch_out, td_status, td_leave_time, td_leave_hours, td_note, td_transfer_btn);
            table.append(tr);
          });
        } catch (err) {
          console.log(err);
        }
      });
    });

    // approve leave application
    $('.approve_leave_application').click(async () => {
      try {
        $('.content').empty();
        const leave = $('<div></div>').attr('class', 'leave').text('請假申請');
        const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from');
        const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to');
        const searchBtn = $('<button></button>').attr('class', 'search_btn').text('查詢');
        const classOptions = $('<select></select>').attr('class', 'class_options');
        const classInitOption = $('<option value=0>全部班級</option>');
        classOptions.append(classInitOption);
        const studentOptions = $('<select></select>').attr('class', 'student_options');
        const studentInitOption = $('<option value=0>全部學生</option>');
        studentOptions.append(studentInitOption);

        // get init class options
        try {
          const classDetail = await axios.get('/api/1.0/classes');
          const classData = classDetail.data;
          classData.data.forEach((clas) => {
            classOptions.append(`
          <option value=${clas.id}>
            ${clas.class_type_name} -
            batch ${clas.batch} -
            ${clas.class_group_name}
          </option>`);
          });
        } catch (err) {
          console.log(err);
        }

        // get student option by class
        classOptions.change(async () => {
          try {
            studentOptions.empty();
            studentOptions.append(studentInitOption);
            if ($('.class_options').val() === '0') {
              return;
            }
            const studentDetail = await axios.get(`/api/1.0/classes/${$('.class_options').val()}/students`);
            const studentData = studentDetail.data;
            studentData.data.forEach((student) => {
              studentOptions.append(`<option value=${student.id}>${student.name}</option>`);
            });
          } catch (err) {
            console.log(err);
          }
        });

        leave.append(classOptions, studentOptions, searchFrom, searchTo, searchBtn);
        $('.content').append(leave);
        $('.search_btn').click(async () => {
          try {
            let table = $('.leave_result');
            if (table) { table.empty(); }
            const classOption = $('.class_options').val();
            const classPath = (classOption === '0' || !classOption) ? '' : `classes/${classOption}/`;
            const studentOption = $('.student_options').val();
            const studentPath = (studentOption === '0' || !studentOption) ? '' : `students/${studentOption}/`;
            const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
            const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
            const url = `/api/1.0/${studentPath || classPath || 'students/'}leaves${from}${to}`;
            const leaveSearchRes = await axios.get(url);
            const leaveSearchResult = leaveSearchRes.data.data;
            // error handle
            table = $('<table></table>').attr('class', 'leave_result');
            const tr = $('<tr></tr>');
            const heads = ['請假日期', '請假學員', '學員班級', '請假類型', '請假時間(開始)', '請假時間(結束)', '請假理由', '狀態', ''];
            heads.forEach((head) => {
              const th = $('<th></th>').text(head);
              tr.append(th);
            });
            table.append(tr);

            $('.leave').append(table);
            leaveSearchResult.forEach((leaveSearch) => {
              const tr = $('<tr></tr>');
              const td_date = $('<td></td>').text(leaveSearch.date);
              const td_student = $('<td></td>').text(leaveSearch.student_name);
              const td_class = $('<td></td>').text(`${leaveSearch.class_type_name}-${leaveSearch.batch}-${leaveSearch.class_group_name}`);
              const td_type = $('<td></td>').text(leaveTypeTable[leaveSearch.leave_type_id]);
              const td_start = $('<td></td>').text(leaveSearch.start);
              const td_end = $('<td></td>').text(leaveSearch.end);
              const td_reason = $('<td></td>').text(leaveSearch.description);
              const td_status = $('<td></td>').attr('class', 'leave_status').text(leaveStatusTable[leaveSearch.approval]);
              const td_approve = $('<td></td>');
              const approve_btn = $('<button></button>').text('核准申請').click(async (approveButtonEvent) => {
                // approve leave API path may be different
                const approveLeaveRes = await axios.patch(`/api/1.0/leaves/${leaveSearch.id}`);
                const approveLeaveResult = approveLeaveRes.data;
                if (approveLeaveResult) {
                  $(approveButtonEvent.target).parent().siblings('.leave_status').text(leaveStatusTable[1]);
                  $(approveButtonEvent.target).remove();
                }
              });
              // if has been approved no need approve btn
              if (leaveSearch.approval === 0) { td_approve.append(approve_btn); }

              tr.append(td_date, td_student, td_class, td_type, td_start, td_end, td_reason, td_status, td_approve);
              table.append(tr);
            });
          } catch (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
    location.href = location.href.replace('.html', '_signin.html');
  }
});
