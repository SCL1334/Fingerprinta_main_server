const attendanceColor = {
  0: '#BD2A2E', 1: '#B2BEBF', 2: '#363432', 3: '#F0941F', 4: '#28a7bd',
};
const attendanceStatus = {
  0: '缺紀錄(缺席)', 1: '正常打卡', 2: '請假未審核', 3: '請假已審核&算時數(e.g.事假)', 4: '請假已審核&不算時數(e.g.喪假)',
};
const content = $('.content');

async function doubleCheckAlert(msg, confirm, deny) {
  const decision = await Swal.fire({
    title: msg,
    icon: 'info',
    showDenyButton: true,
    confirmButtonText: confirm,
    denyButtonText: deny,
    confirmButtonColor: '#BD2A2E',
    denyButtonColor: '#B2BEBF',
  });
  if (!decision.isConfirmed) { return false; }
  return true;
}

async function changePassword() {
  content.text('');
  const changePasswordForm = `
  <div class="change card">
    <div class="card-header">
      <div class="card-title">
        <h3>更改密碼</h3>
      </div>
    </div>
    <form class="change_form card-body" method="put" action="/api/1.0/students/password">
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
  content.append(changePasswordForm);
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
      const { status } = err.response;
      if (status === 401) { location.href = '/student_signin.html'; }
      console.log(err);
      message.html('密碼更改失敗').css('background-color', 'red');
    }
  });
}

$(document).ready(async () => {
  const leaveStatusTable = { 0: '審核中', 1: '審核成功', 2: '審核失敗' };
  const today = dayjs().format('YYYYMMDD');
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/students/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, batch, class_group_name, class_type_name,
    } = data.data;
    $('.userName').text(`你好 ${data.data.name}`);
    $('.content').html(`
      <div class="card" style="width: 18rem; margin: 0 auto;">
        <div class="card-header">
          班級基本資訊
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">培訓內容:${class_type_name}</li>
          <li class="list-group-item">梯次:${batch}</li>
          <li class="list-group-item">班別:${class_group_name}</li>
        </ul>
      </div>
    `);

    // sign out btn
    $('.signout').click(async () => {
      try {
        const responseData = await axios.post('/api/1.0/signout');
        const { data } = await responseData;
        if (data) {
          location.href = '/student_signin.html';
        }
      } catch (err) {
        const { status } = err.response;
        if (status === 401) { location.href = '/student_signin.html'; }
        console.log(err);
      }
    });

    // change password
    const editPassword = $('.edit_password');
    editPassword.click(changePassword);

    // punch today
    try {
      const punchTodayRaw = await axios.get(`api/1.0/my/punches?from=${today}&to=${today}`);
      const punchToday = punchTodayRaw.data.data;
      const punchTable = $('.punch_today');
      const punchHead = ['上課打卡', '下課打卡'].reduce((acc, cur) => {
        acc.append($('<td></td>').text(cur));
        return acc;
      }, $('<thead><tr></tr></thead>'));
      punchTable.append(punchHead);
      if (punchToday.length === 0) { $('.punch_today').append('<td>無紀錄</td><td>無紀錄</td>'); }

      punchToday.forEach((punch) => {
        const { punch_in: punchIn, punch_out: punchOut } = punch;
        const row = $('<tr></tr>');
        row.append($('<td></td>').text(punchIn || '無紀錄'));
        row.append($('<td></td>').text(punchOut || '無紀錄'));
        punchTable.append(row);
      }, $('<tr></tr>'));
    } catch (err) {
      const { status } = err.response;
      if (status === 401) { location.href = '/student_signin.html'; }
      console.log(err);
    }

    // leave total
    try {
      const leavesTotalRes = await axios.get('api/1.0/my/leaves/hours');
      const leavesTotalResult = leavesTotalRes.data.data;
      $('.leave_total').append($('<h5></h5>').text(`目前已核准請假時數 累計:${leavesTotalResult.leaves_hours}小時`));
    } catch (err) {
      const { status } = err.response;
      if (status === 401) { location.href = '/student_signin.html'; }
      console.log(err);
    }
    // get attendance
    $('.get_attendances').click(async () => {
      $('.content').text('');

      const attendance = $('<div></div>').attr('class', 'attendance').html('<h4>出席記錄查詢</h4>');
      const checkBtn = $('<button></button>').attr('class', 'check_btn float-right btn btn-outline-dark btn-sm').text('查看顏色提示');

      const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from').val('2022-05-17')
        .attr('val', '2022-05-17');
      const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to').val('2022-05-17');
      const searchBtn = $('<button></button>').attr('class', 'search_btn btn-secondary').text('查詢');
      attendance.append(checkBtn, '<br>', searchFrom, '<br>', searchTo, '<br>', searchBtn);

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

      $('.content').append(attendance, explainColor);

      const remindModal = new bootstrap.Modal($('#remind_modal'));
      $('.check_btn').click((remindEvent) => {
        remindEvent.preventDefault();
        remindModal.show();
      });

      $('.search_btn').click(async () => {
        try {
          $('.attendance_result').remove();
          let table = $('.attendance_result').css('width', '100%');
          if (table) { table.text(''); }
          const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
          const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
          const attendanceSearchRes = await axios.get(`/api/1.0/my/attendances${from}${to}`);
          const attendanceSearchResult = attendanceSearchRes.data.data;
          table = $('<table></table>').attr('class', 'attendance_result table').css('width', '100%');
          const tr = $('<tr></tr>');
          const heads = ['應出席日期', '應出席時間', '出席狀態'];
          heads.forEach((head) => {
            const th = $('<th></th>').text(head);
            tr.append(th);
          });
          table.append(tr);

          $('.attendance').append(table);
          attendanceSearchResult.forEach((attendanceSearch) => {
            const tr = $('<tr></tr>').css('height', '60px');
            const td_date = $('<td></td>').attr('class', 'attendance_date').text(attendanceSearch.date);
            const td_punch_rule = $('<td></td>').attr('class', 'rule').text(`${attendanceSearch.start}-${attendanceSearch.end}`);
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
            tr.append(
              td_date,
              td_punch_rule,
              td_status,
            );
            table.append(tr);
          });
        } catch (err) {
          const { status } = err.response;
          if (status === 401) { location.href = '/student_signin.html'; }
          console.log(err);
        }
      });
    });

    // apply leave page
    $('.apply_leave').click(async () => {
      let leaveForm = '';
      try {
        const leaveTypesRaw = await axios.get('/api/1.0/leaves/types');
        const leaveTypes = leaveTypesRaw.data.data;
        const options = leaveTypes.reduce((acc, cur) => {
          acc += `<option value=${cur.id}>${cur.name}</option>`;
          return acc;
        }, '');
        $('.content').text('');
        leaveForm = `
        <p class="font-monospace text-center fs-2">請假申請表單</p>
        <div class="leave_form">
        <form action="/api/1.0/my/leaves" method="POST">
          <div class="mb-3">
            <label for="leave_type" class="form-label">請假類型</label>
            <select class="form-select" id='leave_type'>
              ${options}
            </select>
          </div>
          <div class="mb-3">
            <label for="leave_date" class="form-label">請假日期</label>
            <input id='leave_date' name='date' class="form-control" type="date" value="2022-05-02">
          </div>
          <div class="mb-3">
            <label for="leave_start" class="form-label">請假開始時間</label>
            <input id='leave_start' name='start' class="form-control" type="time" value="13:00">
          </div>
          <div class="mb-3">
            <label for="leave_end" class="form-label">請假結束時間</label>
            <input id='leave_end' name='end' class="form-control" type="time" value="16:00">
          </div>
          <div class="mb-3">
            <span class="input-group-text">請假緣由</span>
            <textarea id="leave_reason" name="reason" class="form-control" aria-label="請假緣由"></textarea>
            <div class="form-text">上限50字</div>
          </div>
          <div class="input-group">
            <span class="input-group-text">請假證明(圖片)</span>
            <input id='leave_certificate' name='certificate' class="form-control" type="file" accept="inage/*">
          </div>
          <button type="submit" class="btn btn-dark">送出</button>
          <div class="form-text">*請假時間以一小時為單位，不足一小時以一小時計</div>
        </form>
      </div>
        `;
      } catch (err) {
        const { status } = err.response;
        if (status === 401) { location.href = '/student_signin.html'; }
        console.log(err);
        return;
      }

      $('.content').append(leaveForm);
      $('.leave_form form').submit(async (event) => {
        try {
          event.preventDefault();
          const leaveCertificate = $('#leave_certificate').val();
          const leaveTypeTd = $('#leave_type').val();
          const leaveDate = $('#leave_date').val();
          const leaveStart = $('#leave_start').val();
          const leaveEnd = $('#leave_end').val();
          const leaveReason = $('#leave_reason').val();
          let certificateUrl = '';
          if (leaveCertificate !== '') {
            Swal.fire({
              text: '圖片上傳中...',
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
            });
            const certificateImg = $('#leave_certificate').prop('files')[0];
            const s3UrlRes = await axios.get('/api/1.0/my/s3url');
            const s3UrlResult = s3UrlRes.data;
            if (!s3UrlResult) {
              alert('檔案上傳失敗');
              return;
            }
            const s3Url = s3UrlResult.data.url;
            const uploadRes = await axios.put(s3Url, certificateImg, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            const uploadResult = uploadRes.data;
            if (uploadResult) {
              alert('檔案上傳失敗');
              return;
            }
            [certificateUrl] = s3Url.split('?');
          }
          const leaveApplyRes = await axios($('.leave_form form').attr('action'), {
            method: $('.leave_form form').attr('method'),
            data: {
              leave_type_id: leaveTypeTd,
              date: leaveDate,
              start: leaveStart,
              end: leaveEnd,
              reason: leaveReason,
              certificate_url: certificateUrl,
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const leaveApplyResult = await leaveApplyRes.data;
          if (leaveApplyResult) {
            Swal.close();
            $('.leave_form').html('<p class="font-monospace text-center fs-2">請假申請已提交，請等候校務人員審核</p>');
          }
        } catch (err) {
          const { status } = err.response;
          if (status === 401) { location.href = '/student_signin.html'; }
          if (status === 423) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '請假時數超過上限',
            });
          }
          console.log(err);
        }
      });
    });

    // search leave application
    $('.check_leave').click(async () => {
      try {
        const leavesUrl = 'api/1.0/leaves';
        $('.content').empty();
        const leave = $('<div></div>').attr('class', 'leave').text('請假記錄');
        const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from');
        const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to');
        const searchBtn = $('<button></button>').attr('class', 'search_btn').text('查詢');
        leave.append(searchFrom, searchTo, searchBtn);
        $('.content').append(leave);
        $('.search_btn').click(async () => {
          try {
            $('.leave_result').remove();
            const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
            const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
            const leaveSearchRes = await axios.get(`/api/1.0/my/leaves${from}${to}`);
            const leaveSearchResult = leaveSearchRes.data.data;
            const table = $('<table></table>').attr('class', 'leave_result table');
            const tr = $('<tr></tr>');
            const heads = ['請假日期', '請假類型', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假緣由', '管理員備註', '狀態', '請假證明'];
            heads.forEach((head) => {
              const th = $('<th></th>').text(head);
              tr.append(th);
            });
            table.append(tr);

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
              // class="col-3 modal fade leave_form" id="edit_leave_form"
              const editLeaveForm = `
              <div class="col-3 modal fade leave_form" id="edit_leave_form">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">編輯假單</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form action="" method="PUT">
                        <div class="mb-3">
                          <label for="leave_type" class="form-label">請假類型</label>
                          <select class="form-select" id='edit_type'>
                            ${leaveTypeOptions}
                          </select>
                        </div>
                        <div class="mb-3">
                          <label for="date" class="form-label">請假日期</label>
                          <input id="edit_date" class="form-control" name='date' type='date'>
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
                          <span class="input-group-text">學生請假緣由</span>
                          <textarea id="edit_reason" name="leave_reason" class="form-control" aria-label="請假緣由"></textarea>
                          <div class="form-text">上限50字</div>
                        </div>
                        <button type="submit" id="edit_leave_btn" class="submit btn btn-dark">送出</button>
                        <div class="form-text">*請假時間以一小時為單位，不足一小時以一小時計</div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>                
              `;

              $('.content').append(editLeaveForm);
            } catch (err) {
              const { status } = err.response;
              if (status === 401) { location.href = '/student_signin.html'; }
              console.log(err);
            }

            const editLeaveModal = new bootstrap.Modal($('#edit_leave_form'));

            // editLeaveModal.on($.modal.BEFORE_CLOSE, () => {
            $('#edit_leave_form').on('hidden.bs.modal', () => {
              // clear last time data
              $('#edit_leave_form').on('edit_leave_form').find('input,select').val('')
                .end();
              // remove listener
              $('#edit_leave_form').on('edit_leave_form').find('#edit_leave_btn').off('click');
            });

            $('.leave').append(table);
            leaveSearchResult.forEach((leaveSearch) => {
              const trLeave = $(`<tr data-leave_id=${leaveSearch.id}></tr>`);
              const tdDate = $('<td></td>').attr('class', 'leave_date').text(leaveSearch.date);
              const tdType = $('<td></td>').attr('class', 'leave_type').attr('data-leave_type_id', leaveSearch.leave_type_id).text(leaveSearch.leave_type_name);
              const tdStart = $('<td></td>').attr('class', 'leave_start').text(leaveSearch.start);
              const tdEnd = $('<td></td>').attr('class', 'leave_end').text(leaveSearch.end);
              const tdHours = $('<td></td>').attr('class', 'leave_hours').text(leaveSearch.hours);
              const tdReason = $('<td></td>').attr('class', 'leave_reason').text(leaveSearch.reason);
              const tdNote = $('<td></td>').attr('class', 'leave_note').text(leaveSearch.note);
              const tdStatus = $('<td></td>').attr('class', 'leave_status').attr('data-leave_status', leaveSearch.approval).text(leaveStatusTable[leaveSearch.approval]);
              const tdCertificate = $('<td></td>').attr('class', 'leave_certificate');

              if (leaveSearch.certificate_url) {
                const checkCertificate = $('<button></button>').attr('class', 'btn btn-outline-dark').text('證明連結').click(async (checkEvent) => {
                  checkEvent.preventDefault();
                  Swal.fire({
                    imageUrl: leaveSearch.certificate_url,
                    imageAlt: 'leave certificate',
                  });
                });
                tdCertificate.append(checkCertificate);
              }

              // const
              const tdEdit = $('<td></td>');
              const editBtn = $('<button></button>').attr('class', 'btn btn-outline-primary')
                .text('修改')
                .click(async (callEdit) => {
                  editLeaveModal.show();
                  callEdit.preventDefault();
                  // const callEditBtn = $(callEdit.target);
                  const date = $(callEdit.target).parent().siblings('.leave_date').text();
                  const leaveId = $(callEdit.target).parent().parent().data('leave_id');
                  const leaveTypeId = $(callEdit.target).parent().siblings('.leave_type').data('leave_type_id');
                  const reason = $(callEdit.target).parent().siblings('.leave_reason').text();
                  const start = $(callEdit.target).parent().siblings('.leave_start').text();
                  const end = $(callEdit.target).parent().siblings('.leave_end').text();
                  const hours = $(callEdit.target).parent().siblings('.leave_hours').text();
                  $('#edit_date').val(date);
                  $('#edit_type').val(leaveTypeId);
                  $('#edit_start').val(start);
                  $('#edit_end').val(end);
                  $('#edit_hours').val(hours);
                  $('#edit_reason').val(reason);

                  // editLeaveModal.modal('show');
                  $('#edit_leave_btn').click(async (submit) => {
                    submit.preventDefault();
                    try {
                      const editLeaveRes = await axios(`/api/1.0/my/leaves/${leaveId}`, {
                        method: 'PUT',
                        data: {
                          date: $('#edit_date').val(),
                          leave_type_id: $('#edit_type').val(),
                          start: $('#edit_start').val(),
                          end: $('#edit_end').val(),
                          reason: $('#edit_reason').val(),

                        },
                        headers: {
                          'content-type': 'application/json',
                        },
                      });
                      const editLeaveResult = editLeaveRes.data;
                      if (editLeaveResult) {
                        editLeaveModal.hide();
                        // editLeaveModal.remove();
                        $('.search_btn').trigger('click');
                      }
                    } catch (err) {
                      const { status } = err.response;
                      if (status === 401) { location.href = '/student_signin.html'; }
                      console.log(err);
                      Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: '更改失敗，請重新操作',
                      });
                    }
                  });
                });
              const deleteBtn = $('<button></button>').attr('class', 'btn btn-outline-danger').text('刪除').click(async (deleteEvent) => {
                deleteEvent.preventDefault();
                try {
                  const result = await doubleCheckAlert('資料刪除便無法復原', '確定刪除', '取消');
                  if (!result) { return; }
                  const deleteRes = await axios.delete(`/api/1.0/my/leaves/${leaveSearch.id}`);
                  const deleteResult = deleteRes.data;
                  if (deleteResult) { $('.search_btn').trigger('click'); }
                } catch (err) {
                  const { status } = err.response;
                  if (status === 401) { location.href = '/student_signin.html'; }
                  console.log(err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: '刪除失敗，請重新操作',
                  });
                }
              });

              // if has been approved no need approve btn
              if (leaveSearch.approval === 0) { tdEdit.append(editBtn, deleteBtn); }
              trLeave.append(
                tdDate,
                tdType,
                tdStart,
                tdEnd,
                tdHours,
                tdReason,
                tdNote,
                tdStatus,
                tdEdit,
                tdCertificate,
              );
              table.append(trLeave);
            });
          } catch (err) {
            const { status } = err.response;
            if (status === 401) { location.href = '/student_signin.html'; }
            console.log(err);
          }
        });
      } catch (err) {
        const { status } = err.response;
        if (status === 401) { location.href = '/student_signin.html'; }
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
    location.href = '/student_signin.html';
  }
});
