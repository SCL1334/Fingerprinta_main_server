const attendanceColor = {
  0: '#B2BEBF', 1: '#BD2A2E', 2: '#3B3936',
};
const leaveStatusTable = { 0: '待審核', 1: '已核准', 2: '已拒絕' };
const manageAttendance = async function () {
  const leavesUrl = 'api/1.0/leaves';
  try {
    // init page, check if valid signin
    const profile = await axios.get('/api/1.0/staffs/profile');
    if (profile.error) { throw new Error('aioxs fail'); }
    const { data } = await profile;
    const {
      id, name, email, leadClasses,
    } = data.data;

    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    const studentId = params.student_id;
    const { date } = params;
    // basic info of student and attendance
    const attendanceRaw = await axios.get(`/api/1.0/students/${studentId}/attendances?from=${date}&to=${date}`);
    const [attendanceData] = attendanceRaw.data.data;
    $('.student_name').text(attendanceData.student_name);
    $('.date').text(date);
    $('.rule').text(`${attendanceData.start}-${attendanceData.end}`);
    // generate attendance status form
    const { attendance } = attendanceData;
    const attendanceTable = $('<tr></tr>');
    Object.keys(attendance).forEach((time) => {
      const tdTimeGrid = $('<td></td>').attr('class', 'time').css('background-color', attendanceColor[attendance[time]]).text(time);
      attendanceTable.append(tdTimeGrid);
    });
    $('.status').append(attendanceTable);
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

    // get leave detail
    try {
      let table = $('.leave');
      const url = `api/1.0/students/${studentId}/leaves?from=${date}&to=${date}`;
      const leaveSearchRes = await axios.get(url);
      const leaveSearchResult = leaveSearchRes.data.data;
      console.log(leaveSearchResult);
      // error handle
      table = $('<table></table>').attr('class', 'leave_result table');
      const trHead = $('<tr></tr>');
      const heads = ['請假類型', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假緣由', '狀態', '管理員備註', '核准/拒絕', '修改', '請假證明'];
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
        const tdCertificate = $('<td></td>');
        const getAuditBtn = (audit, text) => $('<button></button>').text(text).click(async (auditButtonEvent) => {
          auditButtonEvent.preventDefault();
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
          console.log(callEdit.event);
        });
        const deleteBtn = $('<button></button>').text('刪除').click(async (deleteEvent) => {
          deleteEvent.preventDefault();
          try {
            const deleteRes = await axios.delete(`${leavesUrl}/${leaveSearch.id}`);
            const deleteResult = deleteRes.data;
            if (deleteResult) { location.reload(); }
          } catch (err) {
            console.log(err);
            alert('刪除失敗');
          }
        });

        // if has been approved no need approve btn
        if (leaveSearch.approval === 0) { tdAudit.append(approveBtn, rejectBtn); }
        tdEdit.append(editBtn, deleteBtn);
        trLeave.append(tdType, tdStart, tdEnd, tdHours, tdReason, tdStatus, tdNote, tdAudit, tdEdit, tdCertificate);
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
        const leaveCertificate = $('#leave_certificate').val();
        const leaveTypeId = $('#leave_type').val();
        const start = $('#leave_start').val();
        const end = $('#leave_end').val();
        const hours = $('#leave_hours').val();
        const note = $('#leave_note').val();
        const reason = $('#leave_reason').val();

        let certificateUrl = '';
        if (leaveCertificate !== '') {
          Swal.fire({
            text: '圖片上傳中...',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
          const certificateImg = $('#leave_certificate').prop('files')[0];
          const s3UrlRes = await axios.get(`/api/1.0/students/${studentId}/s3url`);
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

        const leaveCreateRes = await axios(createLeaveUrl, {
          method: $('.leave_form form').attr('method'),
          data: {
            leave_type_id: leaveTypeId,
            date,
            start,
            end,
            hours,
            reason,
            note,
            certificate_url: certificateUrl,
          },
          headers: {
            'content-type': 'application/json',
          },
        });
        const leaveCreateResult = await leaveCreateRes.data;
        if (leaveCreateResult) {
          Swal.close();
          location.reload();
        }

        // const addLeaveRes = await axios(createLeaveUrl, {
        //   method: 'POST',
        //   data: {
        //     date,
        //     start,
        //     end,
        //     hours,
        //     note,
        //     leave_type_id: leaveTypeId,
        //   },
        //   headers: {
        //     'content-type': 'application/json',
        //   },
        // });
        // const addLeaveResult = addLeaveRes.data;
        // if (addLeaveResult) {
        //   alert('請假新增成功');
        //   $('.none_leave').remove();
        //   // const table = $('.leave_result');
        //   // const tr = $('<tr></tr>');
        //   // const td_type = $('<td></td>').text($('#leave_type option:selected').text());
        //   // const td_start = $('<td></td>').text(start);
        //   // const td_end = $('<td></td>').text(end);
        //   // const td_hours = $('<td></td>').text(hours);
        //   // const td_description = $('<td></td>');
        //   // const td_status = $('<td></td>').attr('class', 'leave_status').text(leaveStatusTable[1]);
        //   // const td_note = $('<td></td>').text(note);
        //   // const td_approve = $('<td></td>');
        //   // const td_edit = $('<td></td>');
        //   // const edit_btn = $('<button></button>').text('修改');
        //   // td_edit.append(edit_btn);
        //   // tr.append(td_type, td_start, td_end, td_hours, td_description, td_status, td_note, td_approve, td_edit);
        //   // table.append(tr);
        //   manageAttendance();
        // }
      } catch (err) {
        Swal.close();
        console.log(err);
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
    // location.href = '/staff_signin.html';
  }
};

$(document).ready(manageAttendance);
