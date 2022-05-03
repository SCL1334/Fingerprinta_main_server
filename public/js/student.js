const content = $('.content');

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
      console.log(err);
      message.html('密碼更改失敗').css('background-color', 'red');
    }
  });
}

$(document).ready(async () => {
  const leaveStatusTable = { 0: '審核中', 1: '已審核' };
  const attendanceColor = {
    0: '#B2BEBF', 1: '#BD2A2E', 2: '#3B3936',
  };
  const today = new Date().toISOString().split('T')[0].replaceAll('-', '');
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
          location.href = location.href.replace('.html', '_signin.html');
        }
      } catch (err) {
        console.log(err);
      }
    });

    // change password
    const editPassword = $('.edit_password');
    editPassword.click(changePassword);

    // punch today
    try {
      const punchTodayRaw = await axios.get(`api/1.0/students/${id}/punches?from=${today}&to=${today}`);
      const punchToday = punchTodayRaw.data.data;
      const punchHead = ['上課打卡', '下課打卡'].reduce((acc, cur) => {
        acc.append($('<td></td>').text(cur));
        return acc;
      }, $('<thead><tr></tr></thead>'));
      $('.punch_today').append(punchHead);
      if (punchToday.length === 0) { $('.punch_today').append($('<td colspan="2"></td>').text('無紀錄')); }

      const punchDetail = punchToday.reduce((acc, cur) => {
        const { punch_in: punchIn, punch_out: punchOut } = cur;
        acc.append($('<td></td>').text(punchIn || '無紀錄'));
        acc.append($('<td></td>').text(punchOut || '無紀錄'));
        return acc;
      }, $('<tr></tr>'));
      $('.punch_today').append(punchDetail);
    } catch (err) {
      console.log(err);
    }

    // leave total
    try {
      const leavesTotalRes = await axios.get(`api/1.0/students/${id}/leaves/hours`);
      const leavesTotalResult = leavesTotalRes.data.data;
      $('.leave_total').append($('<h5></h5>').text(`目前已核准請假時數 累計:${leavesTotalResult.leaves_hours}小時`));
    } catch (err) {
      console.log(err);
    }
    // get attendance
    $('.get_attendances').click(async () => {
      $('.content').text('');

      const attendance = $('<div></div>').attr('class', 'attendance').html('<h4>出席記錄查詢</h4>');

      const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from');
      const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to');
      const searchBtn = $('<button></button>').attr('class', 'search_btn btn-secondary').text('查詢');
      attendance.append('<br>', searchFrom, '<br>', searchTo, '<br>', searchBtn);
      $('.content').append(attendance);
      $('.search_btn').click(async () => {
        try {
          let table = $('.attendance_result').css('width', '100%');
          if (table) { table.text(''); }
          const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
          const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
          const attendanceSearchRes = await axios.get(`/api/1.0/students/${id}/attendances${from}${to}`);
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
        <div class="leave_form">請假申請
          <form action="/api/1.0/students/${id}/leaves" method="POST">
            <select id='leave_type'>
              <option>請選擇請假類型</option>
              ${options}
            </select>
            <input id='leave_date' name='date' type="date" value="2022-05-02">
            <input id='leave_start' name='start' type="time" value="13:00">
            <input id='leave_end' name='end' type="time" value="16:00">
            <input id='leave_reason' name='description' type="text" value="看牙醫">
            <button type="submit">送出</button>
          </form>
        </div>
        `;
      } catch (err) {
        console.log(err);
        console.log(err.response.data);
        return;
      }

      $('.content').append(leaveForm);
      $('.leave_form form').submit(async (event) => {
        try {
          event.preventDefault();
          const leaveTypeTd = $('#leave_type').val();
          const leaveDate = $('#leave_date').val();
          const leaveStart = $('#leave_start').val();
          const leaveEnd = $('#leave_end').val();
          const leaveReason = $('#leave_reason').val();
          const responseData = await axios($('.leave_form form').attr('action'), {
            method: $('.leave_form form').attr('method'),
            data: {
              leave_type_id: leaveTypeTd,
              date: leaveDate,
              start: leaveStart,
              end: leaveEnd,
              description: leaveReason,
            },
            headers: {
              'content-type': 'application/json',
            },
          });
          const { data } = await responseData;
          if (data) {
            $('.leave_form').text('已提交請假申請，請等候校務人員審核');
          }
        } catch (err) {
          console.log(err);
          console.log(err.response.data);
        }
      });
    });

    // search leave application
    $('.check_leave').click(async () => {
      try {
        $('.content').empty();
        const leave = $('<div></div>').attr('class', 'leave').text('請假記錄');
        const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from');
        const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to');
        const searchBtn = $('<button></button>').attr('class', 'search_btn').text('查詢');
        leave.append(searchFrom, searchTo, searchBtn);
        $('.content').append(leave);
        $('.search_btn').click(async () => {
          try {
            let table = $('.leave_result');
            if (table) { table.empty(); }
            const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
            const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
            const responseData = await axios.get(`/api/1.0/students/${id}/leaves${from}${to}`);
            const { data } = responseData;
            table = $('<table></table>').attr('class', 'leave_result table');
            const tr = $('<tr></tr>');
            const heads = ['請假日期', '請假類型', '請假時間(開始)', '請假時間(結束)', '請假理由', '狀態'];
            heads.forEach((head) => {
              const th = $('<th></th>').text(head);
              tr.append(th);
            });
            table.append(tr);

            $('.leave').append(table);
            data.data.forEach((leave) => {
              const tr = $('<tr></tr>');
              const td_date = $('<td></td>').text(leave.date);
              const td_type = $('<td></td>').text(leave.leave_type_name);
              const td_start = $('<td></td>').text(leave.start);
              const td_end = $('<td></td>').text(leave.end);
              const td_reason = $('<td></td>').text(leave.description);
              const td_status = $('<td></td>').text(leaveStatusTable[leave.approval]);
              tr.append(td_date, td_type, td_start, td_end, td_reason, td_status);
              table.append(tr);
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
  } catch (err) {
    console.log(err);
    location.href = location.href.replace('.html', '_signin.html');
  }
});
