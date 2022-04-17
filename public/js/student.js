$(document).ready(async () => {
  const leaveTypeTable = { 1: '事假', 2: '病假' };
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/students/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, batch, class_group_name, class_type_name,
    } = data.data;
    $('.userName').text(`你好 ${data.data.name}`);
    $('.content').text(`培訓內容:${class_type_name} 梯次:${batch} 班別:${class_group_name}`);

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

    // get attendance
    $('.get_attendances').click(async () => {
      $('.content').text('');

      const attendance = $('<div></div>').attr('class', 'attendance').text('打卡記錄');

      const searchFrom = $('<input>').attr('type', 'date').attr('class', 'search_from');
      const searchTo = $('<input>').attr('type', 'date').attr('class', 'search_to');
      const searchBtn = $('<button></button>').attr('class', 'search_btn').text('查詢');
      attendance.append(searchFrom, searchTo, searchBtn);
      $('.content').append(attendance);
      $('.search_btn').click(async () => {
        try {
          let table = $('.attendance_result');
          if (table) { table.text(''); }
          const from = ($('.search_from').val()) ? `?from=${$('.search_from').val()}`.replaceAll('-', '') : '';
          const to = $('.search_to').val() ? `&to=${$('.search_to').val()}`.replaceAll('-', '') : '';
          const responseData = await axios.get(`/api/1.0/students/${id}/attendances${from}${to}`);
          const { data } = responseData;
          table = $('<table></table>').attr('class', 'attendance_result');
          const tr = $('<tr></tr>');
          const heads = ['打卡日期', '上課打卡', '下課打卡'];
          heads.forEach((head) => {
            const th = $('<th></th>').text(head);
            tr.append(th);
          });
          table.append(tr);

          $('.attendance').append(table);
          data.data.forEach((attendance) => {
            const tr = $('<tr></tr>');
            const td_date = $('<td></td>').text(attendance.punch_date);
            const td_punch_in = $('<td></td>').text(attendance.punch_in);
            const td_punch_out = $('<td></td>').text(attendance.punch_out);
            tr.append(td_date, td_punch_in, td_punch_out);
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
        console.log(leaveTypes);
        const options = leaveTypes.reduce((acc, cur) => {
          acc += `<option value=${cur.id}>${leaveTypeTable[cur.id]}</option>`;
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
            <input id='leave_date' name='date' type="date" value="請假日期">
            <input id='leave_start' name='start' type="time" value="請假時間(開始)">
            <input id='leave_end' name='end' type="time" value="請假時間(結束)">
            <input id='leave_reason' name='description' type="text" value="請假事由">
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
  } catch (err) {
    console.log(err);
    location.href = location.href.replace('.html', '_signin.html');
  }
});
