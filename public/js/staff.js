const leaveStatusTable = { 0: '待審核', 1: '已審核' };
const weekdayTable = {
  0: '日', 1: 'ㄧ', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
};
// 0: 正常 1: 缺席 2: 請假未審核 3: 請假已審核 4:不算時數 (遠距假 喪假)
const attendanceColor = {
  0: '#B2BEBF', 1: '#BD2A2E', 2: '#3B3936',
};
const sensorUrl = 'http://127.0.0.1:5000';
const content = $('.content');

function createBtn(clas, text) {
  return `<input type='submit' class='${clas}' value='${text}'>`;
}

async function changePassword() {
  console.log('text');
  $('.content').text('');
  const changePasswordForm = `
  <div class="change card">
    <div class="card-header">
      <div class="card-title">
        <h3>更改密碼</h3>
      </div>
    </div>
    <form class="change_form card-body" method="put" action="/api/1.0/staffs/password">
      <div class="form-group form-floating">
        <input id="password" name="password" type="password" placeholder="請輸入原始密碼" required>
      </div>
      <div class="form-group form-floating">
        <input id="new_password" name="new_password" type="password" placeholder="請輸入新密碼" required>
      </div>
      <div class="form-group form-floating">
        <input id="confirm_password" name="confirm_password" type="password" placeholder="請再次輸入新密碼" required>
        <span id="match"></span>
      </div>
      <div class="card-footer">
        <button type="submit">更改密碼</button>
      </div>
    </form>
    <div class="message"></div>
  </div>
  `;
  $('.content').append(changePasswordForm);
  const changeForm = $('.change_form');
  let match = false;

  $('#new_password, #confirm_password').on('keyup', () => {
    if ($('#new_password').val() === $('#confirm_password').val()) {
      match = true;
      $('#match').html('密碼相符').css('background-color', 'green');
    } else {
      match = false;
      $('#match').html('密碼不相符').css('background-color', 'red');
    }
  });
  changeForm.submit(async (event) => {
    event.preventDefault();
    const message = $('.message');
    try {
      if (!match) { return; }
      const changeRes = await axios(changeForm.attr('action'), {
        method: changeForm.attr('method'),
        data: {
          password: $('#password').val(),
          new_password: $('#new_password').val(),
        },
        headers: {
          'content-type': 'application/json',
        },
      });
      const changeResult = await changeRes.data;
      if (changeResult) {
        message.html('密碼更改成功').css('background-color', 'green');
      }
    } catch (err) {
      console.log(err);
      message.html('密碼更改失敗').css('background-color', 'red');
    }
  });
}

async function setPunchTime() {
  const classRoutineUrl = '/api/1.0/classes/routines';
  // init
  $('.content').empty();
  const classRoutineTable = $('<table></table>').attr('id', 'class_routine_table');
  $('.content').append(classRoutineTable);
  $('.content').append($('<div></div>').append(createBtn('call_create', '新增')));
  const thead = $('<thead></thead>');
  const heads = ['培訓班級類型', '星期', '上課時間', '下課時間', '', ''];
  const tr = $('<tr></tr>');
  heads.forEach((head) => {
    const th = $('<th></th>').text(head);
    tr.append(th);
  });
  thead.append(tr);
  classRoutineTable.append(thead);
  try {
    const classTypesRaw = await axios.get('/api/1.0/classes/types');
    const classTypes = classTypesRaw.data.data;
    const classTypeOptions = classTypes.reduce((acc, cur) => {
      acc += `<option value=${cur.id}>${cur.name}</option>`;
      return acc;
    }, '');
    const weekdayOptions = Object.keys(weekdayTable).reduce((acc, cur) => {
      acc += `<option value=${cur}>星期${weekdayTable[cur]}</option>`;
      return acc;
    }, '');
    const classRoutineForm = `
    <div class="modal fade" id="class_routine_form" role="dialog">
      <label for="class_type"></label>
      <select class="class_type" name="class_type">
        <option value="disabled selected hidden">請選擇培訓班級類型</option>
        ${classTypeOptions}
      </select>
      <label for="weekday"></label>
      <select class="weekday" name="weekday">
        <option value="disabled selected hidden">請選擇星期</option>
        ${weekdayOptions}
      </select>
      <label for="start_time">上課時間</label>
      <input class="start_time" type="time">
      <label for="end_time">下課時間</label>
      <input class="end_time" type="time">
      <button type="submit" class="submit">送出</button>
    </div>
    `;

    $('.content').append(classRoutineForm);
    const createRoutineModal = $('#class_routine_form');
    createRoutineModal.on($.modal.BEFORE_CLOSE, () => {
      // clear last time data
      createRoutineModal.find('input,select').val('').end();
      // remove listener
      createRoutineModal.children('.submit').off();
    });

    const createRoutineBtn = $('.call_create');
    createRoutineBtn.click(async (callCreate) => {
      callCreate.preventDefault();
      createRoutineModal.modal('show');
      createRoutineModal.children('.submit').click(async (submit) => {
        submit.preventDefault();
        try {
          const createRoutineRes = await axios(classRoutineUrl, {
            method: 'POST',
            data: {
              class_type_id: $(submit.target).parent().children('.class_type').val(),
              weekday: $(submit.target).parent().children('.weekday').val(),
              start_time: $(submit.target).parent().children('.start_time').val(),
              end_time: $(submit.target).parent().children('.end_time').val(),
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const createRoutineResult = createRoutineRes.data;
          if (createRoutineResult) {
            createRoutineModal.children('.close-modal').click();
            setPunchTime();
          }
        } catch (err) {
          console.log(err);
          alert('create fail');
        }
      });
    });

    await classRoutineTable.DataTable({
      ajax: {
        url: classRoutineUrl, // 要抓哪個地方的資料
        type: 'GET', // 使用什麼方式抓
        dataType: 'json', // 回傳資料的類型
      },
      columns: [
        { data: 'class_type_name' },
        {
          data: 'weekday',
          render(data) {
            return data = weekdayTable[data];
          },
        },
        {
          data: 'start_time',
        },
        {
          data: 'end_time',
        },
        {
          data: 'edit_class_routine',
          render() {
            return createBtn('routine_edit', '編輯');
          },
        },
        {
          data: 'delete_class_routine',
          render() {
            return createBtn('routine_delete', '刪除');
          },
        },
      ],
      columnDefs: [
        {
          targets: 0,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('data-class_type_id', rowData.class_type_id);
            $(td).attr('class', 'class_type');
          },
        },
        {
          targets: 1,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'weekday');
            $(td).attr('data-weekday', rowData.weekday);
          },
        },
        {
          targets: 2,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'start_time');
          },
        },
        {
          targets: 3,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'end_time');
          },
        },
      ],
      createdRow(row, data, dataIndex) {
        $(row).attr('data-id', data.id);
      },
      fnDrawCallback(oSettings) {
        $('.routine_edit').click(async (callEdit) => {
          callEdit.preventDefault();
          const classRoutineId = $(callEdit.target).parent().parent().data('id');
          const originClassTypeId = $(callEdit.target).parent().siblings('.class_type').data('class_type_id');
          const originWeekday = $(callEdit.target).parent().siblings('.weekday').data('weekday');
          const originStartTime = $(callEdit.target).parent().siblings('.start_time').text();
          const originEndTime = $(callEdit.target).parent().siblings('.end_time').text();
          createRoutineModal.children('.class_type').val(originClassTypeId);
          createRoutineModal.children('.weekday').val(originWeekday);
          createRoutineModal.children('.start_time').val(originStartTime);
          createRoutineModal.children('.end_time').val(originEndTime);
          createRoutineModal.modal('show');
          createRoutineModal.children('.submit').click(async (submit) => {
            submit.preventDefault();
            try {
              const editRoutineRes = await axios(`${classRoutineUrl}/${classRoutineId}`, {
                method: 'PUT',
                data: {
                  class_type_id: $(submit.target).parent().children('.class_type').val(),
                  weekday: $(submit.target).parent().children('.weekday').val(),
                  start_time: $(submit.target).parent().children('.start_time').val(),
                  end_time: $(submit.target).parent().children('.end_time').val(),
                },
                headers: {
                  'content-type': 'application/json',
                },
              });
              const editRoutineResult = editRoutineRes.data;
              if (editRoutineResult) {
                createRoutineModal.children('.close-modal').click();
                setPunchTime();
              }
            } catch (err) {
              console.log(err);
              alert('update fail');
            }
          });
        });
        $('.routine_delete').click(async (event) => {
          try {
            const classRoutineRow = $(event.target).parent().parent();
            const classRoutineId = classRoutineRow.data('id');
            const deleteRoutineRes = await axios.delete(`${classRoutineUrl}/${classRoutineId}`);
            const deleteRoutineResult = deleteRoutineRes.data;
            if (deleteRoutineResult) {
              setPunchTime();
            }
          } catch (err) {
            console.log(err);
          }
        });
      },
    });
  } catch (err) {
    console.log(err);
  }
}

// Account Manage
async function accountManage() {
  $('.content').empty();

  const accountCompenents = $('<div></div>').attr('class', 'account_compenent');
  const studentAccounts = $('<div></div>').attr('class', 'student_account btn btn-outline-dark ').text('學生帳號管理');
  const staffAccounts = $('<div></div>').attr('class', 'staff_account btn btn-outline-dark').text('校務人員帳號管理');
  const accountManageBoard = $('<div></div>').attr('class', 'account_manage_board');
  accountCompenents.append(studentAccounts, staffAccounts, accountManageBoard);
  $('.content').append(accountCompenents);
  // student account part
  async function studentManage() {
    const studentUrl = '/api/1.0/students';
    accountManageBoard.empty();
    accountManageBoard.append($('<div></div>').append(createBtn('call_create', '新增')));

    try {
      const fingerprintsRaw = await axios.get('/api/1.0/fingerprints');
      const fingerpinrts = fingerprintsRaw.data.data;
      const fingerprintsOptions = fingerpinrts.reduce((acc, cur) => {
        const disable = (cur.status === 0) ? '' : 'disabled';
        const remind = (cur.status === 0) ? '' : '已配對';
        const fingerOption = `<option value=${cur.id} ${disable}>${cur.id}${remind}</option>`;
        acc += fingerOption;
        return acc;
      }, '');

      const fingerpirntsStatus = `
      <div class="finger_status">
        <select id='finger_option'>
          <option value=null>請選擇欲登錄的指紋ID</option>
          ${fingerprintsOptions}
        </select>
      </div>`;

      accountManageBoard.append(fingerpirntsStatus);
    } catch (err) {
      console.log(err);
    }
    const studentTable = $('<table></table>').attr('class', 'students_account_table');
    accountManageBoard.append(studentTable);
    const thead = $('<thead></thead>');
    const heads = ['ID', '名稱', 'email', '班級', '指紋ID', '設定指紋', '移除指紋', '更改資訊', '刪除帳號'];
    const tr = $('<tr></tr>');
    heads.forEach((head) => {
      const th = $('<th></th>').text(head);
      tr.append(th);
    });
    thead.append(tr);
    studentTable.append(thead);

    let studentAddForm = '';
    let studentEditForm = '';
    try {
      const classesRaw = await axios.get('/api/1.0/classes');
      const classes = classesRaw.data.data;
      const classesOptions = classes.reduce((acc, cur) => {
        acc += `<option value=${cur.id}>${cur.class_type_name}-${cur.batch}-${cur.class_group_name}</option>`;
        return acc;
      }, '');
      studentAddForm = `
      <div class="modal fade show" id="student_create_form" role="dialog">
        <form action="${studentUrl}" method="POST">
          <select class='create_class'>
            <option value=null>請選擇學生班級</option>
            ${classesOptions}
          </select>
          <input class='create_name' name='name' type='text' placeholder='請輸入名稱'>
          <input class='create_email' name='email' type='email' placeholder='請輸入Email'>
          <input class='create_password' name='password' type='password' placeholder='請輸入密碼'>
          <button class='submit' type="submit">送出</button>
        </form>
      </div>
      `;

      studentEditForm = `
      <div class="modal fade show" id="student_edit_form" role="dialog">
        <form action="${studentUrl}" method="POST">
          <select class='edit_class'>
            <option value=null>請選擇學生班級</option>
            ${classesOptions}
          </select>
          <input class='edit_name' name='name' type='text' placeholder='請輸入名稱'>
          <input class='edit_email' name='email' type='email' placeholder='請輸入Email'>
          <button class='submit' type="submit">送出</button>
        </form>
      </div>
      `;
    } catch (err) {
      console.log(err);
    }

    accountManageBoard.append(studentAddForm);
    accountManageBoard.append(studentEditForm);

    const studentCreateModal = $('#student_create_form');
    studentCreateModal.on($.modal.BEFORE_CLOSE, () => {
      // clear last time data
      studentCreateModal.find('input,select').val('').end();
      // remove listener
      studentCreateModal.children().children('.submit').off();
    });

    const studentEditModal = $('#student_edit_form');
    studentEditModal.on($.modal.BEFORE_CLOSE, () => {
      // clear last time data
      studentEditModal.find('input,select').val('').end();
      // remove listener
      studentEditModal.children().children('.submit').off();
    });

    const createStudentAccountBtn = $('.call_create');
    createStudentAccountBtn.click(async (callCreate) => {
      callCreate.preventDefault();
      studentCreateModal.modal('show');
      studentCreateModal.children().children('.submit').click(async (submit) => {
        submit.preventDefault();
        try {
          const studentAccountRes = await axios(studentUrl, {
            method: 'POST',
            data: {
              class_id: $(submit.target).siblings('.create_class').val(),
              name: $(submit.target).siblings('.create_name').val(),
              email: $(submit.target).siblings('.create_email').val(),
              password: $(submit.target).siblings('.create_password').val(),
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const studentAccountResult = studentAccountRes.data;
          if (studentAccountResult) {
            studentCreateModal.children('.close-modal').click();
            studentManage();
          }
        } catch (err) {
          console.log(err);
          alert('帳號創建失敗');
        }
      });
    });
    studentTable.DataTable({
      ajax: {
        url: studentUrl, // 要抓哪個地方的資料
        type: 'GET', // 使用什麼方式抓
        dataType: 'json', // 回傳資料的類型
      },
      columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'email' },
        {
          data: null,
          render(data, typem, row) {
            return `${row.class_type_name}-${row.batch}-${row.class_group_name}`;
          },
        },
        { data: 'finger_id' },
        {
          data: 'finger_enroll',
          render() {
            return createBtn('finger_enroll', '設定指紋');
          },
        },
        {
          data: 'finger_remove',
          render() {
            return createBtn('finger_remove', '移除指紋');
          },
        },
        {
          data: 'student_edit',
          render() {
            return createBtn('student_edit', '更改資訊');
          },
        },
        {
          data: 'student_delete',
          render() {
            return createBtn('student_delete', '刪除帳號');
          },
        },
      ],
      columnDefs: [
        {
          targets: 0,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'student_id');
          },
        },
        {
          targets: 1,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'name');
          },
        },
        {
          targets: 2,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'email');
          },
        },
        {
          targets: 3,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('data-class_id', rowData.class_id);
            $(td).attr('class', 'class');
          },
        },
        {
          targets: 4,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'finger_id');
          },
        },
        // {
        //   targets: 5,
        //   createdCell(td, cellData, rowData, row, col) {
        //     // if (rowData.finger_id !== null) {
        //     $(td).children().attr('disabled');
        //     // }
        //   },
        // },
        // {
        //   targets: 6,
        //   createdCell(td, cellData, rowData, row, col) {
        //     if (rowData.finger_id === null) {
        //       $(td).children().attr('disabled');
        //     }
        //   },
        // },
      ],
      fnDrawCallback(oSettings) {
        $('.finger_enroll').click(async (enrrollEvent) => {
          enrrollEvent.preventDefault();
          const enrollBtn = $(enrrollEvent.target);
          const studentId = enrollBtn.parent().siblings('.student_id').text();
          const fingerId = $('#finger_option').val();
          try {
            const enrollFingerRes = await axios.post(`${studentUrl}/${studentId}/fingerprint/${fingerId}`);
            const enrollFingerResult = enrollFingerRes.data.data;
            if (enrollFingerResult) {
              alert('配對成功');
              studentManage();
            }
          } catch (err) {
            alert('配對失敗');
            console.log(err);
          }
        });
        $('.finger_remove').click(async (removeEvent) => {
          removeEvent.preventDefault();
          const removeBtn = $(removeEvent.target);
          const fingerId = removeBtn.parent().siblings('.finger_id').text();
          try {
            const removeFingerRes = await axios.delete(`${studentUrl}/fingerprint/${fingerId}`);
            const removeFingerResult = removeFingerRes.data.data;
            if (removeFingerResult) {
              alert('移除成功');
              studentManage();
            }
          } catch (err) {
            alert('移除失敗');
            console.log(err);
          }
        });
        $('.student_edit').click(async (callEdit) => {
          callEdit.preventDefault();
          const callEditBtn = $(callEdit.target);
          const studentId = callEditBtn.parent().siblings('.student_id').text();
          const originName = callEditBtn.parent().siblings('.name').text();
          const originEmail = callEditBtn.parent().siblings('.email').text();
          const originClass = callEditBtn.parent().siblings('.class').data('class_id');
          studentEditModal.children().children('.edit_name').val(originName);
          studentEditModal.children().children('.edit_email').val(originEmail);
          studentEditModal.children().children('.edit_class').val(originClass);
          studentEditModal.modal('show');
          studentEditModal.children().children('.submit').click(async (submit) => {
            submit.preventDefault();
            const editSunmit = $(submit.target);
            try {
              const editStudentRes = await axios(`${studentUrl}/${studentId}`, {
                method: 'PUT',
                data: {
                  name: editSunmit.siblings('.edit_name').val(),
                  email: editSunmit.siblings('.edit_email').val(),
                  class_id: editSunmit.siblings('.edit_class').val(),
                },
                headers: {
                  'content-type': 'application/json',
                },
              });
              const editStudentResult = editStudentRes.data;
              if (editStudentResult) {
                studentEditModal.children('.close-modal').click();
                studentManage();
              }
            } catch (err) {
              console.log(err);
              alert('update fail');
            }
          });
        });
        $('.student_delete').click(async (deleteEvent) => {
          try {
            deleteEvent.preventDefault();
            // maybe need to init finger id as well
            const deleteBtn = $(deleteEvent.target);
            const studentId = deleteBtn.parent().siblings('.student_id').text();
            const deleteStudentRes = await axios.delete(`${studentUrl}/${studentId}`);
            const deleteStudentResult = deleteStudentRes.data;
            if (deleteStudentResult) {
              studentManage();
            }
          } catch (err) {
            console.log(err);
          }
        });
      },
    });
  }

  studentAccounts.click(studentManage);

  // const studentAccountModal = $('#student_form');
  // studentAccountModal.on($.modal.BEFORE_CLOSE, () => {
  //   // clear last time data
  //   studentAccountModal.find('input,select').val('').end();
  //   // remove listener
  //   studentAccountModal.children('.submit').off();
  // });

  // const createStudentAccountBtn = $('.call_create');
  // createStudentAccountBtn.click(async (callCreate) => {
  //   callCreate.preventDefault();
  //   accountManageBoard.append(studentAddForm);
  //   const createStaffAccountModal = $('#create_staff_account_form');
  //   createStudentAccountBtn.modal('show');
  //   createStudentAccountBtn.children('.submit').click(async (submit) => {
  //     submit.preventDefault();
  //     try {
  //       const studentAccountRes = await axios(studentUrl, {
  //         method: 'POST',
  //         data: {
  //           name: $(submit.target).siblings('.create_name').val(),
  //           email: $(submit.target).siblings('.create_email').val(),
  //           password: $(submit.target).siblings('.create_password').val(),
  //         },
  //         headers: {
  //           'content-type': 'application/json',
  //         },
  //       });
  //       const staffAccountResult = staffAccountRes.data;
  //       if (staffAccountResult) {
  //         createStaffAccountModal.children('.close-modal').click();
  //         staffManage();
  //       }
  //     } catch (err) {
  //       console.log(err);
  //       alert('帳號創建失敗');
  //     }
  //   });
  // });

  // })

  //   // Add new student trigger
  //   $('.student_form form').submit(async (newStudentSubmitEvent) => {
  //     try {
  //       newStudentSubmitEvent.preventDefault();
  //       const addStudentName = $('#student_name').val();
  //       const addStudentEmail = $('#student_email').val();
  //       const addStudentPassword = $('#student_password').val();
  //       const addStudentClass = $('#student_class').val();
  //       const addStudentRes = await axios(studentUrl, {
  //         method: 'POST',
  //         data: {
  //           name: addStudentName,
  //           email: addStudentEmail,
  //           password: addStudentPassword,
  //           class_id: addStudentClass,
  //         },
  //         headers: {
  //           'content-type': 'application/json',
  //         },
  //       });
  //       const addStudentResult = addStudentRes.data.data;
  //       if (addStudentResult) {
  //         const tr = $('<tr></tr>');
  //         const td_id = $('<td></td>').text(addStudentResult.insert_id);
  //         const td_student_name = $('<td></td>').text(addStudentName);
  //         const td_student_email = $('<td></td>').text(addStudentEmail);
  //         const td_student_class = $('<td></td>').text($('#student_class option:selected').text());
  //         const td_student_finger = $('<td></td>').attr('class', 'finger_id').text('未註冊');
  //         const td_delete = $('<td></td>');
  //         const td_enroll = $('<td></td>');
  //         const delete_btn = $('<button></button>').text('刪除').click(async (deleteButtonEvent) => {
  //           const deleteStudentRes = await axios.delete(`${studentUrl}/${addStudentResult.insert_id}`);
  //           const deleteStudentResult = deleteStudentRes.data;
  //           if (deleteStudentResult) {
  //             $(deleteButtonEvent.target).parent().parent().remove();
  //           }
  //         });
  //         const enroll_btn = $('<button></button>').text('註冊指紋').click(async (enrollButtonEvent) => {
  //           const enrollFingerRes = await axios.post(`${studentUrl}/${addStudentResult.insert_id}/fingerprint`);
  //           const enrollFingerResult = enrollFingerRes.data.data;
  //           if (enrollFingerResult) {
  //             $(enrollButtonEvent.target).parent().siblings('.finger_id').text(enrollFingerResult.finger_id);
  //           }
  //         });
  //         td_enroll.append(enroll_btn);
  //         td_delete.append(delete_btn);
  //         tr.append(td_id, td_student_name, td_student_email, td_student_class, td_student_finger, td_enroll, td_delete);
  //         table.append(tr);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //       console.log(err.response.data);
  //     }
  //   });

  //   // init table
  //   const table = $('<table></table>').attr('class', 'students_result');
  //   const tr = $('<tr></tr>');
  //   const heads = ['ID', '名稱', 'email', '班級', '指紋ID', '', ''];
  //   heads.forEach((head) => {
  //     const th = $('<th></th>').text(head);
  //     tr.append(th);
  //   });
  //   table.append(tr);
  //   accountManageBoard.append(table);
  //   // show all exists students
  //   try {
  //     const studentsDetail = await axios.get(studentUrl);
  //     const studentsData = studentsDetail.data.data;
  //     studentsData.forEach((student) => {
  //       const tr = $('<tr></tr>');
  //       const td_id = $('<td></td>').text(student.id);
  //       const td_student_name = $('<td></td>').text(student.name);
  //       const td_student_email = $('<td></td>').text(student.email);
  //       const td_student_class = $('<td></td>').text(`${student.class_type_name}-${student.batch}-${student.class_group_name}`);
  //       const td_student_finger = $('<td></td>').attr('class', 'finger_id').text(student.finger_id || '未註冊');
  //       const td_delete = $('<td></td>');
  //       const td_enroll = $('<td></td>');
  //       const delete_btn = $('<button></button>').text('刪除').click(async (deleteButtonEvent) => {
  //         const deleteStudentRes = await axios.delete(`${studentUrl}/${student.id}`);
  //         const deleteStudentResult = deleteStudentRes.data;
  //         if (deleteStudentResult) {
  //           $(deleteButtonEvent.target).parent().parent().remove();
  //         }
  //       });
  //       const enroll_btn = $('<button></button>').text('註冊指紋').click(async (enrollButtonEvent) => {
  //         const enrollFingerRes = await axios.post(`${studentUrl}/${student.id}/fingerprint`);
  //         const enrollFingerResult = enrollFingerRes.data.data;
  //         if (enrollFingerResult) {
  //           $(enrollButtonEvent.target).parent().siblings('.finger_id').text(enrollFingerResult.finger_id);
  //         }
  //       });
  //       td_enroll.append(enroll_btn);
  //       td_delete.append(delete_btn);
  //       tr.append(td_id, td_student_name, td_student_email, td_student_class, td_student_finger, td_enroll, td_delete);
  //       table.append(tr);
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // staff account part
  async function staffManage() {
    const staffUrl = '/api/1.0/staffs';
    accountManageBoard.empty();
    accountManageBoard.append($('<div></div>').append(createBtn('call_create', '新增')));
    const staffAccountTable = $('<table></table>').attr('id', 'staff_account_table');
    accountManageBoard.append(staffAccountTable);
    const thead = $('<thead></thead>');
    const heads = ['ID', '名稱', 'email', ''];
    const tr = $('<tr></tr>');
    heads.forEach((head) => {
      const th = $('<th></th>').text(head);
      tr.append(th);
    });
    thead.append(tr);
    staffAccountTable.append(thead);

    const createStaffAccountForm = `
      <div class="modal fade show" id="create_staff_account_form" role="dialog">
        <input class='create_name' name='name' type='text' placeholder='請輸入名稱'>
        <input class='create_email' name='email' type='email' placeholder='請輸入Email'>
        <input class='create_password' name='password' type='password' placeholder='請輸入密碼'>
        <button type="submit" class="submit">新增帳號</button>
      </div>
      `;

    accountManageBoard.append(createStaffAccountForm);

    const createStaffAccountModal = $('#create_staff_account_form');
    createStaffAccountModal.on($.modal.BEFORE_CLOSE, () => {
      // clear last time data
      createStaffAccountModal.find('input,select').val('').end();
      // remove listener
      createStaffAccountModal.children('.submit').off();
    });

    const createStaffAccountBtn = $('.call_create');
    createStaffAccountBtn.click(async (callCreate) => {
      callCreate.preventDefault();
      createStaffAccountModal.modal('show');
      createStaffAccountModal.children('.submit').click(async (submit) => {
        submit.preventDefault();
        try {
          const staffAccountRes = await axios(staffUrl, {
            method: 'POST',
            data: {
              name: $(submit.target).siblings('.create_name').val(),
              email: $(submit.target).siblings('.create_email').val(),
              password: $(submit.target).siblings('.create_password').val(),
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const staffAccountResult = staffAccountRes.data;
          if (staffAccountResult) {
            createStaffAccountModal.children('.close-modal').click();
            staffManage();
          }
        } catch (err) {
          console.log(err);
          alert('帳號創建失敗');
        }
      });
    });

    staffAccountTable.DataTable({
      ajax: {
        url: staffUrl, // 要抓哪個地方的資料
        type: 'GET', // 使用什麼方式抓
        dataType: 'json', // 回傳資料的類型
      },
      columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'email' },
        {
          data: 'staff_delete',
          render() {
            return createBtn('staff_delete', '刪除');
          },
        },
      ],
      columnDefs: [
        {
          targets: 0,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'staff_id');
          },
        },
        {
          targets: 1,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'name');
          },
        },
        {
          targets: 2,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'email');
          },
        },
      ],
      fnDrawCallback(oSettings) {
        $('.staff_delete').click(async (event) => {
          event.preventDefault();
          try {
            const staffRow = $(event.target).parent().parent();
            const staffId = staffRow.children('.staff_id').text();
            const deleteStaffRes = await axios.delete(`${staffUrl}/${staffId}`);
            const deleteStaffResult = deleteStaffRes.data;
            if (deleteStaffResult) {
              staffManage();
            }
          } catch (err) {
            console.log(err);
          }
        });
      },
    });
  }
  staffAccounts.click(staffManage);
}

// class setting
async function classManage() {
  $('.content').empty();
  const classCompenents = $('<div></div>').attr('class', 'class_compenent');
  const classTypes = $('<div></div>').attr('class', 'class_type btn btn-outline-dark').text('培訓形式設定');
  const classGroups = $('<div></div>').attr('class', 'class_group btn btn-outline-dark').text('培訓班別設定');
  const classes = $('<div></div>').attr('class', 'classes btn btn-outline-dark').text('班級基礎資訊設定');
  const classManageBoard = $('<div></div>').attr('class', 'class_manage_board');
  classCompenents.append(classes, classTypes, classGroups, classManageBoard);
  $('.content').append(classCompenents);

  // classes basic manage
  async function classBasicSetting() {
    classManageBoard.empty();
    const classesUrl = '/api/1.0/classes';

    // init table
    const classTable = $('<table></table>').attr('id', 'classes_result');
    const thead = $('<thead></thead>');
    const heads = ['ID', '培訓類型', 'Batch', '培訓班別', '開學', '結業', '', ''];
    const tr = $('<tr></tr>');
    heads.forEach((head) => {
      const th = $('<th></th>').text(head);
      tr.append(th);
    });
    thead.append(tr);
    classTable.append(thead);
    classManageBoard.append($('<div></div>').append(createBtn('call_create', '新增')));
    classManageBoard.append(classTable);

    // class Add form building
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

      const classForm = `
        <div class="modal fade" id="class_form" role="dialog">
          <form action="" method="">
            <select id='class_type'>
              <option value='disabled selected hidden'>請選擇班級培訓形式</option>
              ${classTypesOptions}
            </select>
            <input id='class_batch' name='batch' type="number">
            <select id='class_group'>
              <option value='disabled selected hidden'>請選擇班級培訓班別</option>
              ${classGroupsOptions}
            </select>
            <input id='class_start_date' name='start_date' type="date">
            <input id='class_end_date' name='end_date' type="date">
            <button class="submit" type="submit">送出</button>
          </form>
        </div>
        `;
      classManageBoard.append(classForm);
      const classModal = $('#class_form');
      classModal.on($.modal.BEFORE_CLOSE, () => {
        classModal.children().find('input,select').val('').end();
        classModal.children().children('.submit').off();
      });

      const addClassBtn = $('.call_create');
      addClassBtn.click(async (callAdd) => {
        callAdd.preventDefault();
        classModal.modal('show');

        classModal.children().children('.submit').click(async (submit) => {
          submit.preventDefault();
          try {
            const addClassType = $(submit.target).siblings('#class_type').val();
            const addClassBatch = $(submit.target).siblings('#class_batch').val();
            const addClassGroup = $(submit.target).siblings('#class_group').val();
            const addClassStart = $(submit.target).siblings('#class_start_date').val();
            const addClassEnd = $(submit.target).siblings('#class_end_date').val();
            const addClassRes = await axios(classesUrl, {
              method: 'POST',
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
            const addClassResult = addClassRes.data;
            if (addClassResult) {
              classModal.children('.close-modal').click();
              classBasicSetting();
            }
          } catch (err) {
            console.log(err);
            alert('create fail');
          }
        });
      });

      // show all exist classes
      try {
        await classTable.DataTable({
          ajax: {
            url: classesUrl, // 要抓哪個地方的資料
            type: 'GET', // 使用什麼方式抓
            dataType: 'json', // 回傳資料的類型
          },
          columns: [
            { data: 'id' },
            { data: 'class_type_name' },
            { data: 'batch' },
            { data: 'class_group_name' },
            { data: 'start_date' },
            { data: 'end_date' },
            {
              data: 'edit_class',
              render() {
                return createBtn('class_edit', '編輯');
              },
            },
            {
              data: 'delete_class',
              render() {
                return createBtn('class_delete', '刪除');
              },
            },
          ],
          columnDefs: [
            {
              targets: 0,
              createdCell(td, cellData, rowData, row, col) {
                $(td).attr('class', 'class_id');
              },
            },
            {
              targets: 1,
              createdCell(td, cellData, rowData, row, col) {
                $(td).attr('data-class_type_id', rowData.class_type_id);
                $(td).attr('class', 'class_type');
              },
            },
            {
              targets: 2,
              createdCell(td, cellData, rowData, row, col) {
                $(td).attr('class', 'batch');
              },
            },
            {
              targets: 3,
              createdCell(td, cellData, rowData, row, col) {
                $(td).attr('data-class_group_id', rowData.class_group_id);
                $(td).attr('class', 'class_group');
              },
            },
            {
              targets: 4,
              createdCell(td, cellData, rowData, row, col) {
                $(td).attr('class', 'start_date');
              },
            },
            {
              targets: 5,
              createdCell(td, cellData, rowData, row, col) {
                $(td).attr('class', 'end_date');
              },
            },
          ],
          fnDrawCallback(oSetting) {
            $('.class_edit').click(async (callEdit) => {
              callEdit.preventDefault();
              const classId = $(callEdit.target).parent().siblings('.class_id').text();
              const originClassTypeId = $(callEdit.target).parent().siblings('.class_type').data('class_type_id');
              const originClassBatch = $(callEdit.target).parent().siblings('.batch').text();
              const originClassGroupId = $(callEdit.target).parent().siblings('.class_group').data('class_group_id');
              const originClassStart = $(callEdit.target).parent().siblings('.start_date').text();
              const originClassEnd = $(callEdit.target).parent().siblings('.end_date').text();
              classModal.children().children('#class_type').val(originClassTypeId);
              classModal.children().children('#class_batch').val(originClassBatch);
              classModal.children().children('#class_group').val(originClassGroupId);
              classModal.children().children('#class_start_date').val(originClassStart);
              classModal.children().children('#class_end_date').val(originClassEnd);
              classModal.modal('show');
              classModal.children().children('.submit').click(async (submit) => {
                submit.preventDefault();
                try {
                  const editClassRes = await axios(`${classesUrl}/${classId}`, {
                    method: 'PUT',
                    data: {
                      class_type_id: $(submit.target).siblings('#class_type').val(),
                      batch: $(submit.target).siblings('#class_batch').val(),
                      class_group_id: $(submit.target).siblings('#class_group').val(),
                      start_date: $(submit.target).siblings('#class_start_date').val(),
                      end_date: $(submit.target).siblings('#class_end_date').val(),
                    },
                    headers: {
                      'content-type': 'application/json',
                    },
                  });
                  const editClassResult = editClassRes.data;
                  if (editClassResult) {
                    classModal.children('.close-modal').click();
                    classBasicSetting();
                  }
                } catch (err) {
                  console.log(err);
                  alert('update fail');
                }
              });
            });
            $('.class_delete').click(async (deleteEvent) => {
              deleteEvent.preventDefault();
              try {
                const classId = $(deleteEvent.target).parent().siblings('.class_id').text();
                const deleteClassRes = await axios.delete(`${classesUrl}/${classId}`);
                const deleteClassResult = deleteClassRes.data;
                if (deleteClassResult) {
                  classBasicSetting();
                }
              } catch (err) {
                console.log(err);
              }
            });
          },
        });
      } catch (err) {
        console.log(err);
        console.log(err.response.data);
      }
    } catch (err) {
      console.log(err);
    }
  }
  classes.click(classBasicSetting);

  // class type manage
  classTypes.click(async () => {
    const classTypeUrl = '/api/1.0/classes/types';
    classManageBoard.empty();

    const add = $('<input>').attr('class', 'add_class_type').attr('type', 'text').val('請輸入培訓形式名稱');
    const addBtn = $('<button></button>').attr('class', 'add_class_type_btn').text('新增');
    const table = $('<table></table>').attr('class', 'class_type_result table');
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
    const table = $('<table></table>').attr('class', 'class_group_result table');
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
}

// holiday setting
async function exceptionManage() {
  $('.content').empty();
  let exceptionForm = '';
  let classTypeTable = '';
  try {
    const classTypesRaw = await axios.get('/api/1.0/classes/types');
    const classTypes = classTypesRaw.data.data;
    classTypeTable = classTypes.reduce((acc, cur) => {
      if (!acc[cur.id]) { acc[cur.id] = cur; }
      return acc;
    }, {});
    const classTypeOptions = classTypes.reduce((acc, cur) => {
      acc += `<option value=${cur.id}>${cur.name}</option>`;
      return acc;
    }, '');

    exceptionForm = `
        <div class="exception_form">新增出勤例外日期
          <form action="/api/1.0/calendar/punchExceptions" method="POST">
            <select id='exception_class_type'>
              <option value=null>請選擇班級類型</option>
              ${classTypeOptions}
            </select>
            <input id='exception_batch' name='batch' type='number' value='15'>
            <input id='exception_date' name='date' type='date' value='2022-05-02'>
            <input id='exception_start' name='start_time' type='time' value='09:00'>
            <input id='exception_end' name='end_time' type='time' value='14:00'>
            <button type="submit">送出</button>
          </form>
        </div>
      `;
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
  }
  $('.content').append(exceptionForm);

  // init table
  const table = $('<table></table>').attr('class', 'exception_result table');
  const tr = $('<tr></tr>');
  const heads = ['訓練班級類型', 'Batch', '日期', '開始時間', '結束時間'];
  heads.forEach((head) => {
    const th = $('<th></th>').text(head);
    tr.append(th);
  });
  table.append(tr);
  $('.content').append(table);

  $('.exception_form form').submit(async (newExceptionEvent) => {
    try {
      newExceptionEvent.preventDefault();
      const addExceptionType = $('#exception_class_type').val();
      const addExceptionTypeName = $('#exception_class_type option:selected').text();
      const addExceptionBatch = $('#exception_batch').val();
      const addExceptionDate = $('#exception_date').val();
      const addExceptionStart = $('#exception_start').val();
      const addExceptionEnd = $('#exception_end').val();
      const addExceptionRes = await axios('/api/1.0/calendar/punchExceptions', {
        method: 'POST',
        data: {
          class_type_id: addExceptionType,
          batch: addExceptionBatch,
          date: addExceptionDate,
          start_time: addExceptionStart,
          end_time: addExceptionEnd,
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      const addExceptionResult = addExceptionRes.data.data;
      if (addExceptionResult) {
        const tr = $('<tr></tr>');
        const td_class_type = $('<td></td>').text(addExceptionTypeName);
        const td_batch = $('<td></td>').text(addExceptionBatch);
        const td_date = $('<td></td>').text(addExceptionDate);
        const td_start = $('<td></td>').text(`${addExceptionStart}:00`);
        const td_end = $('<td></td>').text(`${addExceptionEnd}:00`);
        tr.append(td_class_type, td_batch, td_date, td_start, td_end);
        table.append(tr);
      }
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
    }
  });

  const date = new Date().toISOString().split('T')[0].split('-');
  // get all exception
  try {
    const exceptionRes = await axios.get(`/api/1.0/calendar/months/${date[0]}${date[1]}/punchExceptions`);
    const exceptionResult = exceptionRes.data.data;
    exceptionResult.forEach((edate) => {
      const tr = $('<tr></tr>');
      const td_class_ttype = $('<td></td>').text(classTypeTable[edate.class_type_id].name);
      const td_batch = $('<td></td>').text(edate.batch);
      const td_date = $('<td></td>').text(edate.date);
      const td_start = $('<td></td>').text(edate.start);
      const td_end = $('<td></td>').text(edate.end);
      tr.append(td_class_ttype, td_batch, td_date, td_start, td_end);
      table.append(tr);
    });
  } catch (err) {
    console.log(err);
  }
}

function genRuleManage(date) {
  return async function () {
    $('.content').empty();
    const calendarUrl = '/api/1.0/calendar/months';
    const dateUrl = '/api/1.0/calendar/date';
    const checkDate = (date === null || date === undefined) ? dayjs() : dayjs(date);
    const yearMonth = checkDate.format('YYYYMM');
    const year = checkDate.format('YYYY');
    const month = checkDate.format('MM');
    // create table and head
    const calendarBlock = $('<div></div>').attr('class', 'calendar');
    const calenderHead = $('<div></div>').attr('class', 'calendar_head');
    const calendarTitle = $('<div></div>').attr('class', 'calendar_title');
    const yearDiv = $('<div></div>').attr('class', 'year').text(`西元${year}年`);
    const monthDiv = $('<div></div>').attr('class', 'month').text(`${month}月`);
    const lastMonth = checkDate.subtract(1, 'month');
    const nextMonth = checkDate.add(1, 'month');
    const lastMonthBtn = $(`<div class="change_month"><button class="btn-outline-secondary" data-month="${lastMonth.format('YYYYMM')}">上個月</button></div>`);
    const nextMonthBtn = $(`<div class="change_month"><button class="btn-outline-secondary" data-month="${nextMonth.format('YYYYMM')}">下個月</button></div>`);
    const tableDiv = $('<div></div>').attr('class', 'calendar_table');
    const table = $('<table></table>').attr('class', 'table');
    const tr = $('<tr></tr>');
    Object.keys(weekdayTable).forEach((head) => {
      const th = $('<th></th>').text(`星期${weekdayTable[head]}`);
      tr.append(th);
    });
    table.append(tr);

    calendarTitle.append(yearDiv, monthDiv);
    calenderHead.append(lastMonthBtn, calendarTitle, nextMonthBtn);
    calendarBlock.append(calenderHead);
    $('.content').append(calendarBlock, tableDiv);

    const changeMonth = $('.change_month');
    changeMonth.click((event) => {
      const targetMonth = $(event.target).data('month');
      genRuleManage(`${targetMonth}`)();
    });

    try {
      const calendarRaw = await axios.get(`${calendarUrl}/${yearMonth}`);
      const calendar = calendarRaw.data.data;
      // get week day
      let tr = $('<tr></tr>');
      calendar.forEach((cell, index) => {
        const tdDate = $('<td></td>').text(dayjs(cell.date).format('DD'));
        //  .css('background-color', schoolDay[cell.need_punch]);
        // const btn = $(`<a href="${calendarUrl}/${dayjs(cell.date).format('YYYYMMDD')}"
        // class="btn btn-info" role="button">🔘</a>`);
        const toggle = $(`
          <label class="switch">
            <input type="checkbox">
            <span class="slider"></span>
          </label>
        `);
        const btn = toggle.children('input');
        if (cell.need_punch === 1) { btn.prop('checked', true); }

        // set btn function
        btn.click(async (event) => {
          event.preventDefault();
          // if click the checkbox itself, is(':checked') will get the opposite result from current
          const wantToBe = $(event.target).is(':checked');
          try {
            const switchRes = await axios.put(`${dateUrl}/${cell.date.replaceAll('-', '')}`);
            const switchResult = switchRes.data;
            if (switchResult) {
              btn.prop('checked', wantToBe);
            }
          } catch (err) {
            console.log(err);
          }
        });

        // first date, check lack tr
        if (index === 0) {
          for (let i = 0; i < dayjs(cell.date).day(); i += 1) {
            const tdBlank = $('<td></td>').css('background-color', '#F2F2F2');
            tr.append(tdBlank);
          }
        }
        tdDate.append(toggle);
        tr.append(tdDate);

        if (dayjs(cell.date).day() === 6) {
          table.append(tr);
          tr = $('<tr></tr>');
        }

        // last date, add to full week
        if (index === calendar.length - 1) {
          const lastDateDay = dayjs(cell.date).day();
          for (let i = lastDateDay; i < 6; i += 1) {
            const tdBlank = $('<td></td>').css('background-color', '#F2F2F2');
            tr.append(tdBlank);
            table.append(tr);
          }
        }
      });
      tableDiv.append(table);
    } catch (err) {
      console.log(err);
    }
  };
}

$(document).ready(async () => {
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

    // ----------------------------- temp route ----------------------------------
    // change password
    const editPassword = $('.edit_password');
    editPassword.click(changePassword);

    const punchRule = $('.rule_setting');
    punchRule.click(genRuleManage());

    const punchException = $('.exception_setting');
    punchException.click(exceptionManage);

    // Class routine
    const punchTime = $('.punch_time_setting');
    punchTime.click(setPunchTime);

    // accounts manage
    const account = $('.account_manage');
    account.click(accountManage);

    // class manage
    $('.class_manage').click(classManage);

    // get attendance
    $('.get_attendances').click(async () => {
      $('.content').empty();

      const attendance = $('<div></div>').attr('class', 'attendance').text('出勤查詢');

      const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from').val('2022-04-25');
      const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to').val('2022-05-04');
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
          let table = $('.attendance_result').css('width', '100%');
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
          table = $('<table></table>').attr('class', 'attendance_result table');
          const tr = $('<tr></tr>');
          const heads = ['打卡日期', '班級', '姓名', '應出席時間', '狀態', ''];
          heads.forEach((head) => {
            const th = $('<th></th>').text(head);
            tr.append(th);
          });
          table.append(tr);

          $('.attendance').append(table);
          attendanceSearchResult.forEach((attendanceSearch) => {
            const tr = $('<tr></tr>').css('height', '60px');
            const td_date = $('<td></td>').attr('class', 'attendance_date').text(attendanceSearch.date);
            const td_class = $('<td></td>').text(`
              ${attendanceSearch.class_type_name}-${attendanceSearch.batch}-${attendanceSearch.class_group_name}
            `);
            const td_progress = $('<td></td>').attr('class', 'attendance_progress').text(`${attendanceSearch.progress}`);
            const td_name = $('<td></td>').attr('class', 'leave_student').attr('data-student_id', attendanceSearch.student_id).text(attendanceSearch.student_name);
            const td_punch_rule = $('<td></td>').attr('class', 'rule').text(`${attendanceSearch.start}-${attendanceSearch.end}`);

            const td_punch_in = $('<td></td>');
            const td_punch_out = $('<td></td>');
            const td_status = $('<td></td>').attr('class', 'attendance_status').append($('<div></div>'));

            const attendanceTable = $('<tr></tr>');
            const { attendance } = attendanceSearch;
            Object.keys(attendance).forEach((time) => {
              const td_time_grid = $('<td></td>').attr('class', 'time').css('background-color', attendanceColor[attendance[time]]).css('width', '20px')
                .css('height', '20px')
                .css('border', '0.5px black solid');
              attendanceTable.append(td_time_grid);
            });
            td_status.append(attendanceTable);

            const td_leave_time = $('<td></td>').attr('class', 'leave_time');
            const td_leave_hours = $('<td></td>').attr('class', 'leave_hours');
            const td_detail_btn = $('<td></td>');
            const td_note = $('<td></td>').attr('class', 'note');

            const detail_btn = $('<button></button>').text('顯示詳細資料').click((detailButtonEvent) => {
              const attendanceDetailPage = window.open('/attendance_detail.html');
              const date = $(detailButtonEvent.target).parent().siblings('.attendance_date')
                .text();
              const studentId = $(detailButtonEvent.target).parent().siblings('.leave_student')
                .data('student_id');
              const studentName = $(detailButtonEvent.target).parent().siblings('.leave_student')
                .text();
              const rule = $(detailButtonEvent.target).parent().siblings('.rule')
                .text();
              const attendanceDetail = {
                date, studentId, studentName, attendance, rule,
              };
              attendanceDetailPage.target = attendanceDetail;
            });

            td_detail_btn.append(detail_btn);

            const punch_in_detail = $('<div></div>');
            const punch_out_detail = $('<div></div>');
            const status_detail = $('<div></div>');
            const leave_time_detail = $('<div></div>');
            const leave_hours_detail = $('<div></div>');

            const punches = attendanceSearch.punch;
            if (punches) {
              punches.forEach((punch) => {
                const { punch_in, punch_out } = punch;
                const div_punch_in = $('<div></div>').text(punch_in || '無紀錄');
                const div_punch_out = $('<div></div>').text((punch_out || '無紀錄'));
                punch_in_detail.append(div_punch_in);
                punch_out_detail.append(div_punch_out);
              });

              td_punch_in.append(punch_in_detail);
              td_punch_out.append(punch_out_detail);
            }

            const leavesTransfer = attendanceSearch.trans_to_leave;

            // if (leavesTransfer.length > 0) {
            //   leavesTransfer.forEach((leave, index) => {
            //     const {
            //       description, hours, start, end,
            //     } = leave;
            //     const div_status = $('<div></div>').attr('class', `pair_${index}`).text(AttendanceStatus[description]);
            //     const div_leave_time = $('<div></div>').attr('class', `pair_${index}`).text(`${start}-${end}`);
            //     const div_leave_hours = $('<div></div>').attr('class', `pair_${index}`).append($('<input>').attr('type', 'number')
            //       .attr('value', hours));
            //     const div_trabsfer_btn = $('<div></div>');
            //     const div_note = $('<div></div>').attr('class', `pair_${index}`).append($('<input>').attr('class', 'note').attr('type', 'text')
            //       .text(attendanceSearch.note || null));
            //     status_detail.append(div_status);
            //     leave_time_detail.append(div_leave_time);
            //     leave_hours_detail.append(div_leave_hours);
            //     const transfer_btn = $('<button></button>').text('轉換假單').click(async (transferButtonEvent) => {
            //       try {
            //         const date = $(transferButtonEvent.target).parent().parent().siblings('.attendance_date')
            //           .text();
            //         const studentId = $(transferButtonEvent.target).parent().parent().siblings('.leave_student')
            //           .data('student_id');
            //         const time = $(transferButtonEvent.target).parent().parent().siblings('.leave_time')
            //           .children()
            //           .children(`.pair_${index}`)
            //           .text();
            //         const status = $(transferButtonEvent.target).parent().parent().siblings('.leave_description')
            //           .children()
            //           .children(`.pair_${index}`)
            //           .text();
            //         const hours = $(transferButtonEvent.target).parent().parent().siblings('.leave_hours')
            //           .children()
            //           .children(`.pair_${index}`)
            //           .children()
            //           .val();

            //         const note = $(transferButtonEvent.target).parent().parent().siblings('.note')
            //           .children(`.pair_${index}`)
            //           .children()
            //           .val();

            //         const [leaveStart, leaveEnd] = time.split('-');

            //         const transferLeaveRes = await axios(`/api/1.0/students/${studentId}/attendances/leaves`, {
            //           method: 'POST',
            //           data: {
            //             description: status,
            //             date,
            //             start: leaveStart,
            //             end: leaveEnd,
            //             hours,
            //             note,
            //           },
            //           headers: {
            //             'content-type': 'application/json',
            //           },
            //         });
            //         const transferLeaveResult = transferLeaveRes.data;
            //         if (transferLeaveResult) {
            //           $(transferButtonEvent.target).parent().parent().siblings('.note')
            //             .children(`.pair_${index}`)
            //             .children()
            //             .val(note);
            //           $(transferButtonEvent.target).text('轉換完成').attr('disabled', true);
            //         }
            //       } catch (err) {
            //         console.log(err);
            //         console.log(err.response.data);
            //       }
            //     });
            //     div_trabsfer_btn.append(transfer_btn);
            //     td_transfer_btn.append(div_trabsfer_btn);
            //     td_note.append(div_note);
            //   });
            // } else {
            //   const div_status = $('<div></div>').text(AttendanceStatus.normal);
            //   status_detail.append(div_status);
            // }
            td_status.append(status_detail);
            td_leave_time.append(leave_time_detail);
            td_leave_hours.append(leave_hours_detail);

            tr.append(
              td_date,
              td_class,
              td_name,
              td_punch_rule,
              td_status,
              td_detail_btn,
            );
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
            table = $('<table></table>').attr('class', 'leave_result table');
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
              const td_type = $('<td></td>').text(leaveSearch.leave_type_name);
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
