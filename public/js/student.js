$(document).ready(async () => {
  try {
    const profile = await axios.get('/api/1.0/students/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, batch, class_group_name, class_type_name,
    } = data.data;
    $('.userName').text(`你好 ${data.data.name}`);
    $('.content').text(`培訓內容:${class_type_name} 梯次:${batch} 班別:${class_group_name}`);

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
  } catch (err) {
    console.log(err);
    location.href = location.href.replace('.html', '_signin.html');
  }
});
