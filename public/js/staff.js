$(document).ready(async () => {
  const leaveTypeTable = { 1: '事假', 2: '病假' };
  const leaveStatusTable = { 0: '審核中', 1: '已審核' };
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/staffs/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, classes,
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
    // ${'.account_manage'}.click(async () => {
    //   $('.content').empty();
    //   const account = $('<div></div>').attr('class', 'account').text('帳號管理');
    //   const search

    // })

    // class manage
    $('.class_manage').click(async () => {
      $('.content').empty();
      const classCompenent = $('<div></div>').attr('class', 'class_compenent');
      const classType = $('<div></div>').attr('class', 'class_type').text('培訓形式');
      const classGroup = $('<div></div>').attr('class', 'class_group').text('培訓班別');
      const classes = $('<div></div>').attr('class', 'classes').text('班級管理');
      const classManageBoard = $('<div></div>').attr('class', 'class_manage_board');
      classCompenent.append(classes, classType, classGroup, classManageBoard);
      $('.content').append(classCompenent);

      classType.click(async () => {
        const classTypeUrl = '/api/1.0/classes/types';
        classManageBoard.empty();

        const add = $('<input>').attr('class', 'add_class_type').attr('type', 'text').val('請輸入培訓形式名稱');
        const addBtn = $('<button></button>').attr('class', 'add_class_type_btn').text('新增');
        const table = $('<table></table>').attr('class', 'class_type_result');
        const tr = $('<tr></tr>');
        const heads = ['培訓形式名稱'];
        heads.forEach((head) => {
          const th = $('<th></th>').text(head);
          tr.append(th);
        });
        table.append(tr);
        classManageBoard.append(add, addBtn, table);

        addBtn.click(async () => {
          const newType = $('.add_class_type').val();
          try {
            const addTypeResult = await axios(classTypeUrl, {
              method: 'POST',
              data: {
                type_name: newType,
              },
              headers: {
                'content-type': 'application/json',
              },
            });
            const { data } = await addTypeResult;
            if (data) {
              const tr = $('<tr></tr>');
              const td_name = $('<td></td>').text(newType);
              tr.append(td_name);
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
            const td_name = $('<td></td>').text(classType.name);
            tr.append(td_name);
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
