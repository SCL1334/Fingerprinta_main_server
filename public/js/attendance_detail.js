$(document).ready(async () => {
  const attendanceColor = {
    0: 'SteelBlue', 1: 'Pink', 2: 'Peru',
  };
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

    const attendanceTable = $('<tr></tr>');
    Object.keys(attendance).forEach((time) => {
      const tdTimeGrid = $('<td></td>').attr('class', 'time').css('background-color', attendanceColor[attendance[time]]).text(time);
      attendanceTable.append(tdTimeGrid);
    });
    $('.status').append(attendanceTable);
  } catch (err) {
    console.log(err);
    // location.href ='/staff_signin.html';
  }
});
