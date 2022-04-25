$(document).ready(async () => {
  const attendanceColor = {
    0: 'SteelBlue', 1: 'Pink', 2: 'Peru',
  };
  const leaveTypeTable = { 1: '事假', 2: '病假' };
  const leaveStatusTable = { 0: '待審核', 1: '已審核' };
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/staffs/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, leadClasses,
    } = data.data;

    const basicInfo = window.target;
    const {
      date, studentId, studentName, attendance, rule,
    } = basicInfo;
    $('.student_name').text(studentName);
    $('.date').text(date);
    $('.rule').text(rule);

    // 先不要顯示概況，和母畫面無法同步
    // const attendanceTable = $('<tr></tr>');
    // Object.keys(attendance).forEach((time) => {
    //   const tdTimeGrid = $('<td></td>').attr('class', 'time').css('background-color', attendanceColor[attendance[time]]).text(time);
    //   attendanceTable.append(tdTimeGrid);
    // });
    // $('.status').append(attendanceTable);

    // get leave_type
    try {
      const leaveTypesRaw = await axios.get('/api/1.0/leaves/types');
      const leaveTypes = leaveTypesRaw.data.data;
      // insert into option
      leaveTypes.forEach((leaveType) => {
        const leaveTypeOption = $('<option></option>').val(leaveType.id).text(leaveType.name);
        if (leaveType.id === 3) { leaveTypeOption.attr('selected', 'selected'); }
        $('.leave_type').append(leaveTypeOption);
      });
    } catch (err) {
      console.log(err);
    }

    // create new leave application
    $('.create_leave').click(async (createButtonEvent) => {
      try {
        createButtonEvent.preventDefault();
        const createLeaveUrl = `api/1.0/students/${studentId}/attendances/leaves`;
        const leaveTypeId = $('#leave_type').val();
        const start = $('#start').val();
        const end = $('#end').val();
        const hours = $('#hours').val();
        const note = $('#note').val();

        const addLeaveRes = await axios(createLeaveUrl, {
          method: 'POST',
          data: {
            date,
            start,
            end,
            hours,
            note,
            leave_type_id: leaveTypeId,
          },
          headers: {
            'content-type': 'application/json',
          },
        });
        const addLeaveResult = addLeaveRes.data;
        if (addLeaveResult) {
          alert('請假新增成功');
        }
      } catch (err) {
        console.log(err);
        console.log(err.response.data);
      }
    });

    // get leave application
    try {
      const leaveApplicationRaw = await axios.get(`api/1.0/students/${studentId}/punches?from=${date}&to=${date}`);
      const leaveApplication = leaveApplicationRaw.data.data;
    } catch (err) {
      console.log(err);
    }
    // get attendance detail
    try {
      let table = $('.leave');
      const url = `api/1.0/students/${studentId}/leaves?from=${date}&to=${date}`;
      const leaveSearchRes = await axios.get(url);
      const leaveSearchResult = leaveSearchRes.data.data;
      // error handle
      table = $('<table></table>').attr('class', 'leave_result');
      const tr = $('<tr></tr>');
      const heads = ['請假類型', '請假時間(開始)', '請假時間(結束)', '請假理由', '狀態', ''];
      heads.forEach((head) => {
        const th = $('<th></th>').text(head);
        tr.append(th);
      });
      table.append(tr);

      $('.leave').append(table);
      leaveSearchResult.forEach((leaveSearch) => {
        const tr = $('<tr></tr>');
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

        tr.append(td_type, td_start, td_end, td_reason, td_status, td_approve);
        table.append(tr);
      });
    } catch (err) {
      console.log(err);
    }
    // get punch detail
    try {
      const punchesRaw = await axios.get(`api/1.0/students/${studentId}/punches?from=${date}&to=${date}`);

      const punches = punchesRaw.data.data;
      if (punches.length === 0) { $('.punch').append($('<div></div>').text('無紀錄')); }
      const punchHead = ['上課打卡', '下課打卡'].reduce((acc, cur) => {
        acc.append($('<td></td>').text(cur));
        return acc;
      }, $('<tr></tr>'));

      const punchDetail = punches.reduce((acc, cur) => {
        const { punch_in: punchIn, punch_out: punchOut } = cur;
        acc.append($('<td></td>').text(punchIn || '無紀錄'));
        acc.append($('<td></td>').text(punchOut || '無紀錄'));
        return acc;
      }, $('<tr></tr>'));
      $('.punch').append(punchHead, punchDetail);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
    // location.href ='/staff_signin.html';
  }
});