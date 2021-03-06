$(document).ready(() => {
  $('.signin_form').submit(async (event) => {
    try {
      event.preventDefault();
      const email = $('#email').val();
      const password = $('#password').val();
      const responseData = await axios($('.signin_form').attr('action'), {
        method: $('.signin_form').attr('method'),
        data: {
          email,
          password,
        },
        headers: {
          'content-type': 'application/json',
        },
      });
      const { data } = await responseData;
      if (data) {
        // redirect to profile page
        location.href = location.href.replace('_signin.html', '.html');
      }
    } catch (err) {
      alert('登入失敗');
      console.log(err);
    }
  });
});
