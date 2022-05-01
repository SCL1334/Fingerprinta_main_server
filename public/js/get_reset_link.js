$(document).ready(() => {
  const applyLink = $('.apply_link');
  applyLink.submit(async (event) => {
    event.preventDefault();
    try {
      const email = $('#email').val();
      const responseData = await axios(applyLink.attr('action'), {
        method: applyLink.attr('method'),
        data: {
          email,
        },
        headers: {
          'content-type': 'application/json',
        },
      });
      const { data } = await responseData;
      if (data) {
        // redirect to signin page
        alert('信件已寄出\n請檢查信箱');
        location.href = location.href.replace('apply_reset.html', 'signin.html');
      }
    } catch (err) {
      alert('設定失敗');
      console.log(err);
    }
  });
});
