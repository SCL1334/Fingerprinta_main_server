const leaveStatusTable = { 0: '待審核', 1: '已核准', 2: '已拒絕' };
const weekdayTable = {
  0: '日', 1: 'ㄧ', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
};
const attendanceStatus = {
  0: '缺紀錄(缺席)', 1: '正常打卡', 2: '請假未審核', 3: '請假已審核&算時數(e.g.事假)', 4: '請假已審核&不算時數(e.g.喪假)',
};
const attendanceColor = {
  0: '#BD2A2E', 1: '#B2BEBF', 2: '#363432', 3: '#F0941F', 4: '#28a7bd',
};
const sensorApiUrl = '/api/1.0/sensor';

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

  // temp remove --------------------
  // $('body').children('.modal').remove();

  const classRoutineTable = $('<table></table>').attr('id', 'class_routine_table');
  $('.content').append($('<div></div>').append(createBtn('call_create', '新增')));
  $('.content').append(classRoutineTable);
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
    <div class="modal fade" id="class_routine_form">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新增班級出勤規則</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="class_type" class="form-label">請假類型</label>
                <select id="routine_class_type" class="form-select class_type" name="class_type">
                  ${classTypeOptions}
                </select>
              </div>
              <div class="mb-3">
                <label for="weekday" class="form-label">星期</label>
                <select id="routine_weekday" class="form-select weekday" name="weekday">
                  ${weekdayOptions}
                </select>
              </div>
              <div class="mb-3">
                <label for="start_time" class="form-label">上課時間</label>
                <input id="routine_start_time" name="start_time" class="form-control start_time" type="time">
              </div>
              <div class="mb-3">
                <label for="end_time" class="form-label">請假結束時間</label>
                <input id="routine_end_time" name='end_time' class="form-control end_time" type="time">
              </div>
              <button id="routine_btn" type="submit" class="submit btn btn-dark">送出</button>
            </form>
          </div>
        </div>
      </div>
    </div>    
    `;

    $('.content').append(classRoutineForm);
    const routineModal = new bootstrap.Modal($('#class_routine_form'));
    $('#class_routine_form').on('hidden.bs.modal', () => {
      // clear last time data
      $('#class_routine_form').on('#class_routine_form').find('input,select').val('')
        .end();
      // remove listener
      $('#routine_btn').off('click');
    });

    const createRoutineBtn = $('.call_create');
    createRoutineBtn.click(async (callCreate) => {
      callCreate.preventDefault();
      routineModal.show();
      $('#routine_btn').click(async (submit) => {
        submit.preventDefault();
        try {
          const createRoutineRes = await axios(classRoutineUrl, {
            method: 'POST',
            data: {
              class_type_id: $('#routine_class_type').val(),
              weekday: $('#routine_weekday').val(),
              start_time: $('#routine_start_time').val(),
              end_time: $('#routine_end_time').val(),
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const createRoutineResult = createRoutineRes.data;
          if (createRoutineResult) {
            routineModal.hide();
            setPunchTime();
          }
        } catch (err) {
          console.log(err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: '新增失敗，請重新操作',
          });
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
          $('#routine_class_type').val(originClassTypeId);
          $('#routine_weekday').val(originWeekday);
          $('#routine_start_time').val(originStartTime);
          $('#routine_end_time').val(originEndTime);
          routineModal.show();
          $('#routine_btn').click(async (submit) => {
            submit.preventDefault();
            try {
              const editRoutineRes = await axios(`${classRoutineUrl}/${classRoutineId}`, {
                method: 'PUT',
                data: {
                  class_type_id: $('#routine_class_type').val(),
                  weekday: $('#routine_weekday').val(),
                  start_time: $('#routine_start_time').val(),
                  end_time: $('#routine_end_time').val(),
                },
                headers: {
                  'content-type': 'application/json',
                },
              });
              const editRoutineResult = editRoutineRes.data;
              if (editRoutineResult) {
                routineModal.hide();
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
  // $('body').children('.modal').remove();
  const accountCompenents = $('<div></div>').attr('class', 'account_compenent');
  const studentAccounts = $('<div></div>').attr('class', 'student_account btn btn-outline-dark ').text('學生帳號管理');
  const staffAccounts = $('<div></div>').attr('class', 'staff_account btn btn-outline-dark').text('校務人員帳號管理');
  const accountManageBoard = $('<div></div>').attr('class', 'account_manage_board');
  accountCompenents.append(studentAccounts, staffAccounts, accountManageBoard);
  $('.content').append(accountCompenents);
  // student account part
  async function studentManage() {
    // $('body').children('.modal').remove();
    const studentUrl = '/api/1.0/students';
    accountManageBoard.empty();
    accountManageBoard.append($('<div></div>').append(createBtn('call_create', '新增')));

    const studentTable = $('<table></table>').attr('class', 'students_account_table');
    accountManageBoard.append(studentTable);
    const thead = $('<thead></thead>');
    const heads = ['ID', '名稱', 'email', '班級', '累計請假時數', '指紋ID', '設定指紋', '移除指紋', '更改資訊', '刪除帳號'];
    const tr = $('<tr></tr>');
    heads.forEach((head) => {
      const th = $('<th></th>').html(head);
      tr.append(th);
    });
    thead.append(tr);
    studentTable.append(thead);

    let studentsLeavesHoursTable = {};
    try {
      const studentsLeavesHoursRaw = await axios.get('/api/1.0/students/leaves/hours');
      studentsLeavesHoursTable = studentsLeavesHoursRaw.data.data;
    } catch (err) {
      console.log(err);
    }

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
      <div class="col-3 modal fade" role="dialog" id="student_create_form">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">新增學生帳號</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p class="font-monospace text-center fs-2">新增多位學生</p>
              <form  method="POST">
                <div class="mb-3">
                  <label for="student_class" class="form-label">學生班級</label>
                    <select name="student_class" id="multi_create_class" class="form-select">
                      ${classesOptions}
                    </select>
                </div>
                <div class="mb-3">
                  <label for="name" class="form-label">學生名單(Excel)</label>
                  <input class="form-control" type="file" id="students_list" accept=".xls,.xlsx"  >
                </div>
                <button type="submit" id="create_students_btn" class="submit btn btn-dark">送出</button>
              </form>
              <p class="font-monospace text-center fs-2">新增單一學生</p>
              <form action="${studentUrl}" method="POST">
                <div class="mb-3">
                  <label for="student_class" class="form-label">學生班級</label>
                  <select name="student_class" id="create_class" class="form-select">
                    ${classesOptions}
                  </select>
                </div>
                <div class="mb-3">
                  <label for="name" class="form-label">學生名稱</label>
                  <input id="create_name" class="form-control" name='name' type='text'>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">學生Email</label>
                  <input id="create_email" class="form-control" name='email' type='email'>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">密碼</label>
                  <input id="create_password" class="form-control" name='password' type='password'>
                </div>
                <button type="submit" id="create_student_btn" class="submit btn btn-dark">送出</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      `;

      // studentAddForm = `
      // <div class="modal fade show" id="student_create_form" role="dialog">
      //   <form action="${studentUrl}" method="POST">
      //     <select class='create_class'>
      //       <option value=null>請選擇學生班級</option>
      //       ${classesOptions}
      //     </select>
      //     <input class='create_name' name='name' type='text' placeholder='請輸入名稱'>
      //     <input class='create_email' name='email' type='email' placeholder='請輸入Email'>
      //     <input class='create_password' name='password' type='password' placeholder='請輸入密碼'>
      //     <button class='submit' type="submit">送出</button>
      //   </form>
      // </div>
      // `;

      studentEditForm = `
      <div class="col-3 modal fade" role="dialog" id="student_edit_form">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">編輯學生帳號</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form action="${studentUrl}" method="POST">
                <div class="mb-3">
                  <label for="student_class" class="form-label">學生班級</label>
                  <select name="student_class" id="edit_class" class="form-select">
                    ${classesOptions}
                  </select>
                </div>
                <div class="mb-3">
                  <label for="name" class="form-label">學生名稱</label>
                  <input id="edit_name" class="form-control" name='name' type='text'>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">學生Email</label>
                  <input id="edit_email" class="form-control" name='email' type='email'>
                </div>
                <button type="submit" id="edit_student_btn" class="submit btn btn-dark">送出</button>
              </form>
            </div>
          </div>
        </div>
      </div>    
      `;
    } catch (err) {
      console.log(err);
    }

    accountManageBoard.append(studentAddForm);
    accountManageBoard.append(studentEditForm);

    const studentCreateModal = new bootstrap.Modal($('#student_create_form'));
    $('#student_create_form').on('hidden.bs.modal', () => {
      // clear last time data
      $('#student_create_form').find('input,select').val('').end();
      // remove listener
      $('#create_student_btn').off();
    });

    const studentEditModal = new bootstrap.Modal($('#student_edit_form'));
    $('#student_edit_form').on('hidden.bs.modal', () => {
      // clear last time data
      $('#student_edit_form').find('input,select').val('').end();
      // remove listener
      $('#edit_student_btn').off();
    });

    const createStudentAccountBtn = $('.call_create');
    createStudentAccountBtn.click(async (callCreate) => {
      callCreate.preventDefault();
      studentCreateModal.show();
      $('#create_student_btn').click(async (submit) => {
        submit.preventDefault();
        try {
          const studentAccountRes = await axios(studentUrl, {
            method: 'POST',
            data: {
              class_id: $('#create_class').val(),
              name: $('#create_name').val(),
              email: $('#create_email').val(),
              password: $('#create_password').val(),
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const studentAccountResult = studentAccountRes.data;
          if (studentAccountResult) {
            studentCreateModal.hide();
            studentManage();
          }
        } catch (err) {
          console.log(err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: '帳號創建失敗',
          });
        }
      });
      $('#students_list').on('change', (upload) => {
        const selectedFile = upload.target.files[0];
        $('#create_students_btn').click(async (submit) => {
          submit.preventDefault();
          if (selectedFile) {
            const fileReader = new FileReader();
            fileReader.readAsBinaryString(selectedFile);
            fileReader.onload = async (event) => {
              const data = event.target.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              // consume only one sheet
              const studentsList = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[workbook.SheetNames[0]],
              );
              try {
                const studentAccountRes = await axios(`/api/1.0/classes/${$('#multi_create_class').val()}/students`, {
                  method: 'POST',
                  data: {
                    students: studentsList,
                  },
                  headers: {
                    'content-type': 'application/json',
                  },
                });
                const studentAccountResult = studentAccountRes.data;
                if (studentAccountResult) {
                  studentCreateModal.hide();
                  studentManage();
                }
              } catch (err) {
                console.log(err);
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: '帳號創建失敗',
                });
              }
            };
          }
        });
      });
    });

    $.fn.dataTableExt.afnFiltering.push(
      (oSettings, aData, iDataIndex) => {
        const columnIndex = 4; // 5rd column
        let value = $('#filter_value').val();

        if (value && value.length > 0 && !Number.isNaN(parseInt(value, 10))) {
          value = parseInt(value, 10);
          const rowData = parseInt(aData[columnIndex], 10);
          return rowData >= value;
        }
        return true;
      },
    );

    const studentShow = studentTable.DataTable({
      pageLength: 20,
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
          render(data, typm, row) {
            return `${row.class_type_name}-${row.batch}-${row.class_group_name}`;
          },
        },
        {
          data: null,
          render(data, type, row) {
            return (studentsLeavesHoursTable[row.id]) ? studentsLeavesHoursTable[row.id].leaves_hours : 0;
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
          targets: 5,
          createdCell(td, cellData, rowData, row, col) {
            $(td).attr('class', 'finger_id');
          },
        },
        // {
        //   targets: 6,
        //   createdCell(td, cellData, rowData, row, col) {
        //     // if (rowData.finger_id !== null) {
        //     $(td).children().attr('disabled');
        //     // }
        //   },
        // },
        // {
        //   targets: 7,
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
          try {
            const enrollFingerRes = await axios.post(`${studentUrl}/${studentId}/fingerprint`);
            const enrollFingerResult = enrollFingerRes.data.data;
            if (enrollFingerResult) {
              Swal.fire('配對成功');
              studentManage();
            }
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '配對失敗',
            });
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
            console.log(removeFingerResult);
            if (removeFingerResult) {
              Swal.fire('移除成功');
              studentManage();
            }
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '移除失敗',
            });
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
          $('#edit_name').val(originName);
          $('#edit_email').val(originEmail);
          $('#edit_class').val(originClass);
          studentEditModal.show();
          $('#edit_student_btn').click(async (submit) => {
            submit.preventDefault();
            try {
              const editStudentRes = await axios(`${studentUrl}/${studentId}`, {
                method: 'PUT',
                data: {
                  name: $('#edit_name').val(),
                  email: $('#edit_email').val(),
                  class_id: $('#edit_class').val(),
                },
                headers: {
                  'content-type': 'application/json',
                },
              });
              const editStudentResult = editStudentRes.data;
              if (editStudentResult) {
                studentEditModal.hide();
                studentManage();
              }
            } catch (err) {
              console.log(err);
              console.log(err);
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: '帳號編輯失敗',
              });
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
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '帳號刪除失敗',
            });
          }
        });
      },
    });
    /* Add event listeners to the filtering inputs */
    // $('#filter_comparator').change(() => { studentShow.fnDraw(); });
    // $('#filter_value').keyon((e) => { if (e.key === 'Enter') { studentShow.fnDraw(); } });
    const leavesHoursFilter = $('<input type="number" id="filter_value">');
    leavesHoursFilter.keypress((e) => { if (e.which === 13) { studentShow.draw(); } });
    $('<label>搜尋請假時數大於</label>').append(leavesHoursFilter).insertAfter($('.dataTables_length'));
    $('.dataTables_length').remove();
  }

  studentAccounts.click(studentManage);

  // staff account part
  async function staffManage() {
    // $('body').children('.modal').remove();
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
      <div class="modal fade" role="dialog" id="staff_create_form">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">新增校務人員帳號</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="name" class="form-label">名稱</label>
                  <input id="create_name" class="form-control" name='name' type='text'>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input id="create_email" class="form-control" name='email' type='email'>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">密碼</label>
                  <input id="create_password" class="form-control" name='password' type='password'>
                </div>
                <button type="submit" id="create_staff_btn" class="submit btn btn-dark">新增帳號</button>
              </form>
            </div>
          </div>
        </div>
      </div>   
      `;

    accountManageBoard.append(createStaffAccountForm);

    const createStaffAccountModal = new bootstrap.Modal($('#staff_create_form'));
    $('#staff_create_form').on('hidden.bs.modal', () => {
      // clear last time data
      $('#staff_create_form').find('input,select').val('').end();
      // remove listener
      $('#create_staff_btn').off();
    });

    const createStaffAccountBtn = $('.call_create');
    createStaffAccountBtn.click(async (callCreate) => {
      callCreate.preventDefault();
      createStaffAccountModal.show();
      $('#create_staff_btn').click(async (submit) => {
        submit.preventDefault();
        try {
          const staffAccountRes = await axios(staffUrl, {
            method: 'POST',
            data: {
              name: $('#create_name').val(),
              email: $('#create_email').val(),
              password: $('#create_password').val(),
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const staffAccountResult = staffAccountRes.data;
          if (staffAccountResult) {
            createStaffAccountModal.hide();
            staffManage();
          }
        } catch (err) {
          console.log(err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: '帳號創建失敗',
          });
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
    const heads = ['ID', '培訓類型', 'Batch', '培訓班別', '開學', '結業', '', '', ''];
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
      }, '<option value=""}>無</option>');

      const classForm = `
        <div class="modal fade" role="dialog" id="class_form">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">新增班級</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form>
                  <div class="mb-3">
                    <label for="class_type" class="form-label">培訓形式</label>
                    <select name="class_type" id='class_type' class="form-select">
                      ${classTypesOptions}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="batch" class="form-label">梯次</label>
                    <input id="class_batch" class="form-control" name='batch' type='number'>
                  </div>
                  <div class="mb-3">
                    <label for="class_type" class="form-label">培訓班別</label>
                    <select name="class_type" id='class_group' class="form-select">
                      ${classGroupsOptions}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="start_date" class="form-label">開學日</label>
                    <input id="class_start_date" class="form-control" name='start_date' type='date'>
                  </div>
                  <div class="mb-3">
                    <label for="end_date" class="form-label">結訓日</label>
                    <input id="class_end_date" class="form-control" name='end_date' type='date'>
                  </div>
                  <button type="submit" id="class_btn" class="submit btn btn-dark">送出</button>
                </form>
              </div>
            </div>
          </div>
        </div>  
        `;
      classManageBoard.append(classForm);
      const classModal = new bootstrap.Modal($('#class_form'));
      $('#class_form').on('hidden.bs.modal', () => {
        $('#class_form').find('input,select').val('').end();
        $('#class_btn').off();
      });

      const addClassBtn = $('.call_create');
      addClassBtn.click(async (callAdd) => {
        callAdd.preventDefault();
        classModal.show();

        $('#class_btn').click(async (submit) => {
          submit.preventDefault();
          try {
            const addClassType = $('#class_type').val();
            const addClassBatch = $('#class_batch').val();
            const addClassGroup = $('#class_group').val();
            const addClassStart = $('#class_start_date').val();
            const addClassEnd = $('#class_end_date').val();
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
              classModal.hide();
              classBasicSetting();
            }
          } catch (err) {
            console.log(err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '班級創建失敗',
            });
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
              data: 'backup_leaves',
              render() {
                return createBtn('class_leaves_backup', '備份');
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
              $('#class_type').val(originClassTypeId);
              $('#class_batch').val(originClassBatch);
              $('#class_group').val(originClassGroupId);
              $('#class_start_date').val(originClassStart);
              $('#class_end_date').val(originClassEnd);
              classModal.show();
              $('#class_btn').click(async (submit) => {
                submit.preventDefault();
                try {
                  const editClassRes = await axios(`${classesUrl}/${classId}`, {
                    method: 'PUT',
                    data: {
                      class_type_id: $('#class_type').val(),
                      batch: $('#class_batch').val(),
                      class_group_id: $('#class_group').val(),
                      start_date: $('#class_start_date').val(),
                      end_date: $('#class_end_date').val(),
                    },
                    headers: {
                      'content-type': 'application/json',
                    },
                  });
                  const editClassResult = editClassRes.data;
                  if (editClassResult) {
                    classModal.hide();
                    classBasicSetting();
                  }
                } catch (err) {
                  console.log(err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: '班級更新失敗',
                  });
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
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: '班級刪除失敗',
                });
              }
            });
            $('.class_leaves_backup').click(async (backupEvent) => {
              backupEvent.preventDefault();
              try {
                const classId = $(backupEvent.target).parent().siblings('.class_id').text();
                const backupRes = await axios.post(`${classesUrl}/${classId}/backup/leaves`);
                const backupResult = backupRes.data;
                if (backupResult) {
                  Swal.fire({
                    title: '備份成功',
                    icon: 'success',
                    html:
                      '請點擊連結下載備份, '
                      + `<a href="${backupResult.data.location}">檔案連結</a> `,
                    showCloseButton: true,
                    showCancelButton: true,
                    focusConfirm: false,
                    confirmButtonText:
                      '<i class="fa fa-thumbs-up"></i> 完成',
                  });
                  classBasicSetting();
                }
              } catch (err) {
                console.log(err);
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: '備份失敗',
                });
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
  const exceptionUrl = '/api/1.0/calendar/punchExceptions';
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
      if (cur.id === 1) {
        acc += `<option selected="selected" value=${cur.id}>${cur.name}</option>`;
      } else {
        acc += `<option value=${cur.id}>${cur.name}</option>`;
      }

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
            <input id='exception_date' name='date' type='date' value='2022-04-28'>
            <input id='exception_start' name='start_time' type='time' value='09:00'>
            <input id='exception_end' name='end_time' type='time' value='10:00'>
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
  const heads = ['訓練班級類型', 'Batch', '日期', '開始時間', '結束時間', ''];
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
      const addExceptionRes = await axios(exceptionUrl, {
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
        const td_delete = $('<td></td>');
        const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
          const deleteTypeRes = await axios.delete(`${exceptionUrl}/${addExceptionResult.insert_id}`);
          const deleteTypeResult = deleteTypeRes.data;
          if (deleteTypeResult) {
            $(event.target).parent().parent().remove();
          }
        });
        td_delete.append(delete_btn);
        tr.append(td_class_type, td_batch, td_date, td_start, td_end, td_delete);
        table.append(tr);
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '新增化失敗',
      });
    }
  });

  const date = new Date().toISOString().split('T')[0].split('-');
  // get all exception
  try {
    const exceptionRes = await axios.get(`/api/1.0/calendar/months/${date[0]}${date[1]}/punchExceptions`);
    const exceptionResult = exceptionRes.data.data;
    exceptionResult.forEach((edate) => {
      const tr = $('<tr></tr>');
      const td_class_type = $('<td></td>').text(classTypeTable[edate.class_type_id].name);
      const td_batch = $('<td></td>').text(edate.batch);
      const td_date = $('<td></td>').text(edate.date);
      const td_start = $('<td></td>').text(edate.start);
      const td_end = $('<td></td>').text(edate.end);
      const td_delete = $('<td></td>');
      const delete_btn = $('<button></button>').text('刪除').click(async (event) => {
        const deleteTypeRes = await axios.delete(`${exceptionUrl}/${edate.id}`);
        const deleteTypeResult = deleteTypeRes.data;
        if (deleteTypeResult) {
          $(event.target).parent().parent().remove();
        }
      });
      td_delete.append(delete_btn);
      tr.append(td_class_type, td_batch, td_date, td_start, td_end, td_delete);
      table.append(tr);
    });
  } catch (err) {
    console.log(err);
  }
}

function genRuleManage(date) {
  return async function () {
    $('.content').empty();
    const calendarUrl = '/api/1.0/calendar';
    const dateUrl = '/api/1.0/calendar/date';
    const checkDate = (date === null || date === undefined) ? dayjs() : dayjs(date);
    const yearMonth = checkDate.format('YYYYMM');
    const year = checkDate.format('YYYY');
    const month = checkDate.format('MM');
    // create table and head
    const calendarBlock = $('<div></div>').attr('class', 'calendar row');
    const calendarMain = $('<div></div>').attr('class', 'calendar_main col-9');
    const calendarEdit = $('<div></div>').attr('class', 'calendar_edit col-3');

    // edit calendar form
    const calendarEditForm = `
    <div class="calendar_form">
      <div class="create_calendar row">
        <p class="font-monospace text-center fs-5">新增月曆資料</p>
        <div class="form-text">*請至<a class="link-success" href="https://data.gov.tw/dataset/14718">政府網站</a>下載對應年份的JSON檔案</div>
        <form action="#" method="GET">
          <div class="mb-3">
            <label for="default_calendar" class="form-label">國定假日資料</label>
            <input id='default_calendar' name='default_calendar' class="form-control" type="file" accept="application/JSON" required="required">
          </div>
          <div class="float-end">
            <button type="submit" id="init_calendar" class="btn btn-outline-success">新增</button>
          </div>
        </form>
      </div>
      <br>
      <div class="delete_calendar row">
        <p class="font-monospace text-center fs-5">刪除月曆資料</p>
        <div class="form-text">請輸入欲刪除西元年份</div>
        <form action="#" method="GET">
          <div class="mb-3">
            <input id='delete_year' name='delete_year' class="form-control" type="number" required="required">
          </div>
          <div class="float-end">
            <button type="submit" id="delete_calendar" class="btn btn-outline-danger">刪除</button>
          </div>
        </form>
      </div>
    </div>
    `;
    calendarEdit.append(calendarEditForm);

    //   try {
    //     const createRoutineRes = await axios(classRoutineUrl, {
    //       method: 'POST',
    //       data: {
    //         class_type_id: $(submit.target).parent().children('.class_type').val(),
    //         weekday: $(submit.target).parent().children('.weekday').val(),
    //         start_time: $(submit.target).parent().children('.start_time').val(),
    //         end_time: $(submit.target).parent().children('.end_time').val(),
    //       },
    //       headers: {
    //         'content-type': 'application/json',
    //       },
    //     });
    //     const createRoutineResult = createRoutineRes.data;
    //     if (createRoutineResult) {
    //       routineModal.children('.close-modal').click();
    //       setPunchTime();
    //     }
    //   } catch (err) {
    //     console.log(err);
    //     alert('create fail');
    //   }
    // });

    const calenderHead = $('<div></div>').attr('class', 'calendar_head');
    const yearDiv = $('<div></div>').attr('class', 'year text-center text-muted h3').text(`西元${year}年`);
    const calendarMonth = $('<div></div>').attr('class', 'calendar_title row');

    const monthDiv = $('<div></div>').attr('class', 'month col-4 text-center display-4').text(`${month}月`);
    const lastMonth = checkDate.subtract(1, 'month');
    const nextMonth = checkDate.add(1, 'month');
    const lastMonthBtn = $(`<div class="col-4 text-center"><button class="change_month btn-outline-secondary" data-month="${lastMonth.format('YYYYMM')}">上個月</button></div>`);
    const nextMonthBtn = $(`<div class="col-4 text-center"><button class="change_month btn-outline-secondary" data-month="${nextMonth.format('YYYYMM')}">下個月</button></div>`);
    const tableDiv = $('<div></div>').attr('class', 'calendar_table');
    const table = $('<table></table>').attr('class', 'table');
    const tr = $('<tr></tr>');
    Object.keys(weekdayTable).forEach((head) => {
      const th = $('<th></th>').text(`星期${weekdayTable[head]}`);
      tr.append(th);
    });
    table.append(tr);

    calendarMonth.append(lastMonthBtn, monthDiv, nextMonthBtn);
    calenderHead.append(yearDiv, calendarMonth);
    calendarMain.append(calenderHead, tableDiv);
    calendarBlock.append(calendarMain, calendarEdit);
    $('.content').append(calendarBlock);

    $('#init_calendar').click((click) => click.preventDefault());

    $('#default_calendar').on('change', (upload) => {
      const selectedFile = upload.target.files[0];
      $('#init_calendar').click(async (initCalendar) => {
        initCalendar.preventDefault();
        const fileReader = new FileReader();
        fileReader.readAsText(selectedFile);
        fileReader.onload = async (event) => {
          const strCalendar = event.target.result;
          const jsonCalendar = JSON.parse(strCalendar);
          try {
            const initCalendarRes = await axios(`${calendarUrl}`, {
              method: 'POST',
              data: {
                calendar: jsonCalendar,
              },
              headers: {
                'content-type': 'application/json',
              },
            });
            const initCalendarResult = initCalendarRes.data;

            if (initCalendarResult) {
              Swal.fire('行事曆初始化成功');
              $('.rule_setting').click();
            }
          } catch (err) {
            console.log(err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '行事曆初始化失敗',
            });
          }
        };
      });
    });

    $('#delete_calendar').click(async (deleteCalendar) => {
      deleteCalendar.preventDefault();
      const year = $('#delete_year').val();
      try {
        const deleteCalendarRes = await axios.delete(`${calendarUrl}/years/${year}`);
        const deleteCalendarResult = deleteCalendarRes.data;
        if (deleteCalendarResult) {
          Swal.fire('刪除成功');
          $('.rule_setting').click();
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '刪除失敗',
        });
        console.log(err);
      }
    });

    const changeMonth = $('.change_month');
    changeMonth.click((event) => {
      event.preventDefault();
      const targetMonth = $(event.target).data('month');
      genRuleManage(`${targetMonth}`)();
    });

    try {
      const calendarRaw = await axios.get(`${calendarUrl}/months/${yearMonth}`);
      const calendar = calendarRaw.data.data;
      // get week day
      let tr = $('<tr></tr>');
      calendar.forEach((cell, index) => {
        const tdDate = $('<td></td>').css('height', '60px').attr('class', 'position-relative');
        const textDate = $('<div></div>').css('height', '50px').css('width', '52px')
          .attr('class', 'position-relative fs-3 top-0')
          .text(dayjs(cell.date).format('DD'));
        tdDate.append(textDate);
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

async function auditLeave() {
  try {
    $('.content').empty();
    const leavesUrl = 'api/1.0/leaves';
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
    const leaveResult = $('<div></div>').attr('class', 'leave_result');

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

    // get leave_type
    try {
      const leaveTypesRaw = await axios.get('/api/1.0/leaves/types');
      const leaveTypes = leaveTypesRaw.data.data;
      // insert into option
      const leaveTypeOptions = leaveTypes.reduce((acc, leaveType) => {
        const selected = (leaveType.id === 3) ? 'selected' : '';
        const leaveTypeOption = `<option ${selected} value=${leaveType.id}>${leaveType.name}</option>`;
        acc += leaveTypeOption;
        return acc;
      }, '');
      $('#leave_type').append(leaveTypeOptions);

      // gen edit modal
      const leaveStatusOptions = Object.keys(leaveStatusTable).reduce((acc, cur) => {
        acc += `<option value="${cur}">${leaveStatusTable[cur]}</option>`;
        return acc;
      }, '');
      const editLeaveForm = `
        <div class="modal fade" role="dialog" id="edit_leave_form">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">編輯假單</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form action="/api/1.0/students/leaves" method="PUT">
                  <div class="form-text" id="edit_date"></div>
                  <div class="form-text" id="edit_class_name"></div>
                  <div class="form-text" id="edit_student_name"></div>
                  <div class="mb-3">
                    <label for="leave_type" class="form-label">請假類型</label>
                    <select class="form-select" id='edit_type'>
                      ${leaveTypeOptions}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="leave_start" class="form-label">請假開始時間</label>
                    <input id='edit_start' name='leave_start' class="form-control" type="time">
                  </div>
                  <div class="mb-3">
                    <label for="leave_end" class="form-label">請假結束時間</label>
                    <input id='edit_end' name='leave_end' class="form-control" type="time">
                  </div>
                  <div class="mb-3">
                    <label for="leave_hours" class="form-label">請假小時數</label>
                    <input id='edit_hours' name='leave_hour' class="form-control" type="number">
                  </div>
                  <div class="mb-3">
                    <span class="input-group-text">學生請假緣由</span>
                    <textarea id="edit_reason" name="leave_reason" class="form-control" aria-label="請假緣由"></textarea>
                    <div class="form-text">上限50字</div>
                  </div>
                  <div class="mb-3">
                    <span class="input-group-text">管理員備註</span>
                    <textarea id="edit_note" name="leave_note" class="form-control" aria-label="管理員備註"></textarea>
                    <div class="form-text">上限50字</div>
                  </div>
                  <div class="mb-3">
                  <label for="leave_status" class="form-label">狀態</label>
                  <select class="form-select" id='edit_status'>
                    ${leaveStatusOptions}
                  </select>
                  </div>
                  <button type="submit" id="edit_leave_btn" class="submit btn btn-dark">送出</button>
                  <div class="form-text">*請假時間以一小時為單位，不足一小時以一小時計</div>
                </form>
              </div>
            </div>
          </div>
        </div>     
        `;
      // $('.content').append(editLeaveForm);
      $('.content').append(editLeaveForm);
    } catch (err) {
      console.log(err);
    }

    const editLeaveModal = new bootstrap.Modal($('#edit_leave_form'));
    // const editLeaveModal = $('#test');
    $('#edit_leave_form').on('hidden.bs.modal', () => {
      // clear last time data
      $('#edit_leave_form').find('input,select').val('').end();
      // remove listener
      $('#edit_leave_btn').off();
    });

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
    $('.content').append(leaveResult);
    $('.search_btn').click(async () => {
      try {
        $('.leave_result').empty();
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
        const table = $('<table></table>').attr('class', 'table');
        const tr = $('<tr></tr>');
        const heads = ['請假日期', '請假學員', '學員班級', '請假類型', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假緣由', '管理員備註', '狀態', '核准/拒絕', '修改', '請假證明'];
        heads.forEach((head) => {
          const th = $('<th></th>').text(head);
          tr.append(th);
        });
        table.append(tr);

        $('.leave_result').append(table);
        leaveSearchResult.forEach((leaveSearch) => {
          const trLeave = $(`<tr data-leave_id=${leaveSearch.id}></tr>`);
          const tdDate = $('<td></td>').attr('class', 'leave_date').text(leaveSearch.date);
          const tdType = $('<td></td>').attr('class', 'leave_type').attr('data-leave_type_id', leaveSearch.leave_type_id).text(leaveSearch.leave_type_name);
          const tdStudent = $('<td></td>').attr('class', 'leave_student').text(leaveSearch.student_name);
          const tdClass = $('<td></td>').attr('class', 'class_name').attr('data-class_id', leaveSearch.class_id).text(`${leaveSearch.class_type_name}-${leaveSearch.batch}-${leaveSearch.class_group_name}`);
          const tdStart = $('<td></td>').attr('class', 'leave_start').text(leaveSearch.start);
          const tdEnd = $('<td></td>').attr('class', 'leave_end').text(leaveSearch.end);
          const tdHours = $('<td></td>').attr('class', 'leave_hours').text(leaveSearch.hours);
          const tdReason = $('<td></td>').attr('class', 'leave_reason').text(leaveSearch.reason);
          const tdStatus = $('<td></td>').attr('class', 'leave_status').attr('data-leave_status', leaveSearch.approval).text(leaveStatusTable[leaveSearch.approval]);
          const tdNote = $('<td></td>').attr('class', 'leave_note').text(leaveSearch.note);
          const tdAudit = $('<td></td>').attr('class', 'leave_audit');
          const tdCertificate = $('<td></td>').attr('class', 'leave_certificate');
          const getAuditBtn = (audit, text) => $('<button></button>').text(text).click(async (auditButtonEvent) => {
            auditButtonEvent.preventDefault();
            // approve leave API path may be different
            const auditLeaveRes = await axios.patch(`/api/1.0/leaves/${leaveSearch.id}`, {
              approval: audit,
            });
            const auditLeaveResult = auditLeaveRes.data;
            if (auditLeaveResult) {
            // auditBtn.parent().siblings('.leave_status').text(leaveStatusTable[audit]);
            // auditBtn.siblings('button').remove();
            // auditBtn.remove();
              $('.search_btn').trigger('click');
            }
          });
          const approveBtn = getAuditBtn(1, '核准');
          const rejectBtn = getAuditBtn(2, '拒絕');
          if (leaveSearch.certificate_url) {
            const checkCertificate = $('<button></button>').text('證明連結').click(async (checkEvent) => {
              checkEvent.preventDefault();
              Swal.fire({
                imageUrl: leaveSearch.certificate_url,
                imageAlt: 'leave certificate',
              });
            });
            tdCertificate.append(checkCertificate);
          }

          const tdEdit = $('<td></td>');
          const editBtn = $('<button></button>').text('修改').click(async (callEdit) => {
            callEdit.preventDefault();
            const callEditBtn = $(callEdit.target);
            const date = callEditBtn.parent().siblings('.leave_date').text();
            const className = callEditBtn.parent().siblings('.class_name').text();
            const studentName = callEditBtn.parent().siblings('.leave_student').text();
            const leaveId = callEditBtn.parent().parent().data('leave_id');
            const leaveTypeId = callEditBtn.parent().siblings('.leave_type').data('leave_type_id');
            const status = callEditBtn.parent().siblings('.leave_status').data('leave_status');
            const start = callEditBtn.parent().siblings('.leave_start').text();
            const end = callEditBtn.parent().siblings('.leave_end').text();
            const hours = callEditBtn.parent().siblings('.leave_hours').text();
            const reason = callEditBtn.parent().siblings('.leave_reason').text();
            const note = callEditBtn.parent().siblings('.leave_note').text();
            $('#edit_student_name').text(studentName);
            $('#edit_class_name').text(className);
            $('#edit_date').text(date);
            $('#edit_type').val(leaveTypeId);
            $('#edit_start').val(start);
            $('#edit_end').val(end);
            $('#edit_hours').val(hours);
            $('#edit_reason').val(reason);
            $('#edit_note').val(note);
            $('#edit_status').val(status);
            editLeaveModal.show();

            $('#edit_leave_btn').click(async (submit) => {
              submit.preventDefault();
              try {
                const editLeaveRes = await axios(`${leavesUrl}/${leaveId}`, {
                  method: 'PUT',
                  data: {
                    date,
                    leave_type_id: $('#edit_type').val(),
                    start: $('#edit_start').val(),
                    end: $('#edit_end').val(),
                    hours: $('#edit_hours').val(),
                    reason: $('#edit_reason').val(),
                    note: $('#edit_note').val(),
                    approval: $('#edit_status').val(),
                  },
                  headers: {
                    'content-type': 'application/json',
                  },
                });
                const editLeaveResult = editLeaveRes.data;
                if (editLeaveResult) {
                  editLeaveModal.hide();
                  $('.search_btn').trigger('click');
                }
              } catch (err) {
                console.log(err);
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: '更改失敗，請重新操作',
                });
              }
            });
          });
          const deleteBtn = $('<button></button>').text('刪除').click(async (deleteEvent) => {
            deleteEvent.preventDefault();
            try {
              const deleteRes = await axios.delete(`${leavesUrl}/${leaveSearch.id}`);
              const deleteResult = deleteRes.data;
              if (deleteResult) { $('.search_btn').trigger('click'); }
            } catch (err) {
              console.log(err);
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: '刪除失敗，請重新操作',
              });
            }
          });

          // if has been approved no need approve btn
          if (leaveSearch.approval === 0) { tdAudit.append(approveBtn, rejectBtn); }
          tdEdit.append(editBtn, deleteBtn);
          trLeave.append(
            tdDate,
            tdStudent,
            tdClass,
            tdType,
            tdStart,
            tdEnd,
            tdHours,
            tdReason,
            tdNote,
            tdStatus,
            tdAudit,
            tdEdit,
            tdCertificate,
          );
          table.append(trLeave);
        });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
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
      try {
        const sensorIdentifyRes = await axios.post(`${sensorApiUrl}/identify`);
        const sensorIdentifyResult = sensorIdentifyRes.data;
        if (sensorIdentifyResult) {
          Swal.fire('指紋機：正在切換到打卡模式');
        }
      } catch (err) {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '指紋機：打卡模式啟動失敗',
        });
      }
    });

    $('#sensor_stop').click(async () => {
      try {
        const sensorStopRes = await axios.post(`${sensorApiUrl}/stop`);
        const sensorStopResult = sensorStopRes.data;
        if (sensorStopResult) {
          Swal.fire('指紋機：切換到待機模式');
        }
      } catch (err) {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '指紋機：待機模式啟動失敗',
        });
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

    // approve leave application
    $('.approve_leave_application').click(auditLeave);

    // get attendance
    $('.get_attendances').click(async () => {
      $('.content').empty();

      const attendance = $('<div></div>').attr('class', 'attendance').text('出勤查詢');

      const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from').val('2022-04-25');
      const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to').val('2022-05-02');
      const searchBtn = $('<button></button>').attr('class', 'search_btn').text('查詢');
      const checkBtn = $('<button></button>').attr('class', 'check_btn float-right').text('查看顏色提示');
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

      const attendanceSquares = Object.keys(attendanceColor).reduce((acc, cur) => {
        acc += `<div style="height:30px; width:30px; background-color:${attendanceColor[cur]}"></div><span>${attendanceStatus[cur]}</span>`;
        return acc;
      }, '');

      const explainColor = `
      <div class="col-3 modal fade" role="dialog" id="remind_modal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">出勤狀況對應顏色</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${attendanceSquares}
            </div>
          </div>
        </div>
      </div>    
      `;
      const attendanceHead = $('<div></div>');
      attendanceHead.append(classOptions, studentOptions, searchFrom, searchTo, searchBtn, checkBtn);
      attendance.append(attendanceHead);

      $('.content').append(explainColor, attendance);

      const remindModal = new bootstrap.Modal($('#remind_modal'));
      $('.check_btn').click((remindEvent) => {
        remindEvent.preventDefault();
        remindModal.show();
      });

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

            // 0: 缺紀錄(缺席) 1: 正常打卡 2: 請假未審核 3: 請假已審核 4:請假已審核&不算時數 (遠距假 喪假)
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
              const date = $(detailButtonEvent.target).parent().siblings('.attendance_date').text()
                .replaceAll('-', '');
              const studentId = $(detailButtonEvent.target).parent().siblings('.leave_student')
                .data('student_id');
              // const studentName = $(detailButtonEvent.target).parent().siblings('.leave_student')
              //   .text();
              // const rule = $(detailButtonEvent.target).parent().siblings('.rule')
              //   .text();
              // const attendanceDetail = {
              //   date, studentId, studentName, attendance, rule,
              // };
              const attendanceDetailPage = window.open(`/attendance_detail.html?student_id=${studentId}&date=${date}`);

              // var receiveMessage = function (event) {
              //   if (event.data.indexOf("SUCCESS") !== -1 && event.origin.indexOf('.remoteserver.com') !== -1) {
              //     popup.close();
              //   }
              // };

              // window.removeEventListener("message", receiveMessage);
              // attendanceDetailPage.target = attendanceDetail;
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
  } catch (err) {
    console.log(err);
    location.href = '/staff_signin.html';
  }
});
