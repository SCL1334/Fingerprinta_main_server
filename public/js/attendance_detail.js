const leaveStatusTable = { 0: '待審核', 1: '審核成功', 2: '審核失敗' };
$(document).ready(async () => {
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/staffs/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, leadClasses,
    } = data.data;

    // const basicInfo = window.target;
    // const {
    //   date, studentId, studentName, attendance, rule,
    // } = basicInfo;
    // $('.student_name').text(studentName);
    // $('.date').text(date);
    // $('.rule').text(rule);

    // 先不要顯示概況，和母畫面無法同步
    // const attendanceTable = $('<tr></tr>');
    // Object.keys(attendance).forEach((time) => {
    //   const tdTimeGrid = $('<td></td>').attr('class', 'time').css('background-color', attendanceColor[attendance[time]]).text(time);
    //   attendanceTable.append(tdTimeGrid);
    // });
    // $('.status').append(attendanceTable);
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    const { student, date } = params;
    const student = await axios

    // get leave_type
    try {
      const leaveTypesRaw = await axios.get('/api/1.0/leaves/types');
      const leaveTypes = leaveTypesRaw.data.data;
      // insert into option
      leaveTypes.forEach((leaveType) => {
        const leaveTypeOption = $('<option></option>').val(leaveType.id).text(leaveType.name);
        if (leaveType.id === 3) { leaveTypeOption.attr('selected', 'selected'); }
        $('#leave_type').append(leaveTypeOption);
      });
    } catch (err) {
      console.log(err);
    }

    // get attendance detail
    try {
      let table = $('.leave');
      const url = `api/1.0/students/${studentId}/leaves?from=${date}&to=${date}`;
      const leaveSearchRes = await axios.get(url);
      const leaveSearchResult = leaveSearchRes.data.data;
      console.log(leaveSearchResult);
      // error handle
<<<<<<< Updated upstream
      table = $('<table></table>').attr('class', 'leave_result table');
=======
<<<<<<< Updated upstream
      table = $('<table></table>').attr('class', 'leave_result');
>>>>>>> Stashed changes
      const tr = $('<tr></tr>');
      const heads = ['請假類型', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假事由', '狀態', '管理員備註', '', ''];
=======
      table = $('<table></table>').attr('class', 'leave_result table');
      const trHead = $('<tr></tr>');
      const heads = ['請假類型', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假緣由', '狀態', '管理員備註', '核准/拒絕', '修改', '請假證明'];
>>>>>>> Stashed changes
      heads.forEach((head) => {
        const th = $('<th></th>').text(head);
        trHead.append(th);
      });
      table.append(trHead);
      if (leaveSearchResult.length === 0) {
        table.append($('<tr></tr>').attr('class', 'none_leave').text('無資料'));
      }
      $('.leave').append(table);
      leaveSearchResult.forEach((leaveSearch) => {
        const trLeave = $(`<tr data-leave_id=${leaveSearch.id}></tr>`);
        const tdType = $('<td></td>').text(leaveSearch.leave_type_name);
        const tdStart = $('<td></td>').text(leaveSearch.start);
        const tdEnd = $('<td></td>').text(leaveSearch.end);
        const tdHours = $('<td></td>').text(leaveSearch.hours);
        const tdReason = $('<td></td>').text(leaveSearch.reason);
        const tdStatus = $('<td></td>').attr('class', 'leave_status').text(leaveStatusTable[leaveSearch.approval]);
        const tdNote = $('<td></td>').text(leaveSearch.note);
        const tdAudit = $('<td></td>');
        const getAuditBtn = (audit, text) => $('<button></button>').text(text).click(async (auditButtonEvent) => {
          // approve leave API path may be different
          const auditLeaveRes = await axios.patch(`/api/1.0/leaves/${leaveSearch.id}`, {
            approval: audit,
          });
          const auditLeaveResult = auditLeaveRes.data;
          if (auditLeaveResult) {
            $(auditButtonEvent.target).parent().siblings('.leave_status').text(leaveStatusTable[audit]);
            $(auditButtonEvent.target).remove();
          }
        });
        const approveBtn = getAuditBtn(1, '核准');
        const rejectBtn = getAuditBtn(2, '拒絕');
        const tdEdit = $('<td></td>');
        const editBtn = $('<button></button>').text('修改').click(async (callEdit) => {
          console.log(callEdit.event);
        });
        const deleteBtn = $('<button></button>').text('刪除').click(async (deleteEvent) => {
          deleteEvent.preventDefault();
        });

        // if has been approved no need approve btn
        if (leaveSearch.approval === 0) { tdAudit.append(approveBtn, rejectBtn); }
        tdEdit.append(editBtn, deleteBtn);
        trLeave.append(tdType, tdStart, tdEnd, tdHours, tdReason, tdStatus, tdNote, tdAudit, tdEdit);
        table.append(trLeave);
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
        const start = $('#leave_start').val();
        const end = $('#leave_end').val();
        const hours = $('#leave_hours').val();
        const note = $('#leave_note').val();

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
          $('.none_leave').remove();
          const table = $('.leave_result');
          const tr = $('<tr></tr>');
          const td_type = $('<td></td>').text($('#leave_type option:selected').text());
          const td_start = $('<td></td>').text(start);
          const td_end = $('<td></td>').text(end);
          const td_hours = $('<td></td>').text(hours);
          const td_description = $('<td></td>');
          const td_status = $('<td></td>').attr('class', 'leave_status').text(leaveStatusTable[1]);
          const td_note = $('<td></td>').text(note);
          const td_approve = $('<td></td>');
          const td_edit = $('<td></td>');
          const edit_btn = $('<button></button>').text('修改');
          td_edit.append(edit_btn);
          tr.append(td_type, td_start, td_end, td_hours, td_description, td_status, td_note, td_approve, td_edit);
          table.append(tr);
        }
      } catch (err) {
        console.log(err);
        console.log(err.response.data);
      }
    });

    // get punch detail
    try {
      const punchesRaw = await axios.get(`api/1.0/students/${studentId}/punches?from=${date}&to=${date}`);

      const punches = punchesRaw.data.data;
      const punchHead = ['上課打卡', '下課打卡'].reduce((acc, cur) => {
        acc.append($('<td></td>').text(cur));
        return acc;
      }, $('<tr></tr>'));
      $('.punch').append(punchHead);
      if (punches.length === 0) { $('.punch').append($('<td colspan="2"></td>').text('無紀錄')); }

      const punchDetail = punches.reduce((acc, cur) => {
        const { punch_in: punchIn, punch_out: punchOut } = cur;
        acc.append($('<td></td>').text(punchIn || '無紀錄'));
        acc.append($('<td></td>').text(punchOut || '無紀錄'));
        return acc;
      }, $('<tr></tr>'));
      $('.punch').append(punchDetail);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
    location.href = '/staff_signin.html';
  }
});
