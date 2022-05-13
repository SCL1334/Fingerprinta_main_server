const attendanceColor = {
  0: '#BD2A2E', 1: '#B2BEBF', 2: '#363432', 3: '#F0941F', 4: '#28a7bd',
};
const leaveStatusTable = { 0: '待審核', 1: '已核准', 2: '已拒絕' };

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
        <div class="col-3 modal fade" role="dialog" id="edit_leave_form">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">編輯假單</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form action="/api/1.0/students/leaves" method="PUT">
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
                  <button type="submit" id="edit_leave_btn" class="submit btn btn-dark">轉換</button>
                  <div class="form-text">*請假時間以一小時為單位，不足一小時以一小時計</div>
                </form>
              </div>
            </div>
          </div>
        </div>              
        `;
      // $('.content').append(editLeaveForm);
      $('body').append(editLeaveForm);
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

    // get leave detail
    try {
      let table = $('.leave');
      const url = `api/1.0/students/${studentId}/leaves?from=${date}&to=${date}`;
      const leaveSearchRes = await axios.get(url);
      const leaveSearchResult = leaveSearchRes.data.data;
      // error handle
      table = $('<table></table>').attr('class', 'leave_result table');
      const trHead = $('<tr></tr>');
      const heads = ['請假類型', '請假時間(開始)', '請假時間(結束)', '請假時數', '請假緣由', '管理員備註', '狀態', '', '', '請假證明'];
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
        const tdType = $('<td></td>').attr('class', 'leave_type').attr('data-leave_type_id', leaveSearch.leave_type_id).text(leaveSearch.leave_type_name);
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
            location.reload();
          }
        });
        const approveBtn = getAuditBtn(1, '核准').attr('class', 'btn btn-outline-success btn-sm');
        const rejectBtn = getAuditBtn(2, '拒絕').attr('class', 'btn btn-outline-secondary btn-sm');
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
        const editBtn = $('<button></button>').text('修改').attr('class', 'btn btn-outline-primary btn-sm').click(async (callEdit) => {
          callEdit.preventDefault();
          const callEditBtn = $(callEdit.target);
          const leaveId = callEditBtn.parent().parent().data('leave_id');
          const leaveTypeId = callEditBtn.parent().siblings('.leave_type').data('leave_type_id');
          const status = callEditBtn.parent().siblings('.leave_status').data('leave_status');
          const start = callEditBtn.parent().siblings('.leave_start').text();
          const end = callEditBtn.parent().siblings('.leave_end').text();
          const hours = callEditBtn.parent().siblings('.leave_hours').text();
          const reason = callEditBtn.parent().siblings('.leave_reason').text();
          const note = callEditBtn.parent().siblings('.leave_note').text();
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
                location.reload();
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
        const deleteBtn = $('<button></button>').text('刪除').attr('class', 'btn btn-outline-danger btn-sm').click(async (deleteEvent) => {
          deleteEvent.preventDefault();
          try {
            const result = await doubleCheckAlert('刪除資料便無法復原', '確定刪除', '取消');
            if (!result) { return; }
            // const deleteRes = await axios.delete(`${leavesUrl}/${leaveSearch.id}`);
            // const deleteResult = deleteRes.data;
            if (deleteResult) { location.reload(); }
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
    location.href = '/staff_signin.html';
  }
};

$(document).ready(manageAttendance);
