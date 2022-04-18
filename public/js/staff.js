$(document).ready(async () => {
  const leaveTypeTable = { 1: '事假', 2: '病假' };
  const leaveStatusTable = { 0: '審核中', 1: '已審核' };
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
    // accounts manage
    $('.account_manage').click(async () => {
      $('.content').empty();

      const accountCompenents = $('<div></div>').attr('class', 'account_compenent');
      const student_accounts = $('<div></div>').attr('class', 'student_account').text('學生帳號管理');
      const staff_accounts = $('<div></div>').attr('class', 'staff_account').text('校務人員帳號管理');
      const accountManageBoard = $('<div></div>').attr('class', 'account_manage_board');
      accountCompenents.append(student_accounts, staff_accounts, accountManageBoard);
      $('.content').append(accountCompenents);
      // student account part
      student_accounts.click(async () => {
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
            <input id='student_email' name='email' type="email">
            <input id='student_password' name='password' type="password">
            <input id='student_name' name='name' type="text">
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
                  console.log(deleteButtonEvent.target);
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
          const responseData = await axios.get(url);
          const { data } = responseData;
          table = $('<table></table>').attr('class', 'attendance_result');
          const tr = $('<tr></tr>');
          const heads = ['姓名', '打卡日期', '上課打卡', '下課打卡'];
          heads.forEach((head) => {
            const th = $('<th></th>').text(head);
            tr.append(th);
          });
          table.append(tr);

          $('.attendance').append(table);
          data.data.forEach((attendance) => {
            const tr = $('<tr></tr>');
            const td_name = $('<td></td>').text(attendance.student_name);
            const td_date = $('<td></td>').text(attendance.punch_date);
            const td_punch_in = $('<td></td>').text(attendance.punch_in);
            const td_punch_out = $('<td></td>').text(attendance.punch_out);
            tr.append(td_name, td_date, td_punch_in, td_punch_out);
            table.append(tr);
          });
        } catch (err) {
          console.log(err);
        }
      });
    });
  } catch (err) {
    console.log(err);
    location.href = location.href.replace('.html', '_signin.html');
  }
});
