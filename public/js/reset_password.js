$(document).ready(() => {
  const resetForm = $('.reset_form');

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const { apply } = params;
  let match = false;

  if (!apply) {
    alert('請重新點擊連結\n或重新申請一組連結');
    location.href = location.href.replace('reset.html', 'apply_reset.html');
  }

  $('#password, #confirm_password').on('keyup', () => {
    if ($('#password').val() === $('#confirm_password').val()) {
      match = true;
      $('#match').html('密碼相符').css('background-color', 'green');
    } else {
      match = false;
      $('#match').html('密碼不相符').css('background-color', 'red');
    }
  });

  resetForm.submit(async (event) => {
    try {
      event.preventDefault();
      if (!match) { return; }
      const responseData = await axios(`${resetForm.attr('action')}?apply=${apply}`, {
        method: resetForm.attr('method'),
        data: {
          password: $('#password').val(),
        },
        headers: {
          'content-type': 'application/json',
        },
      });
      const { data } = await responseData;
      if (data) {
        alert('密碼設定成功');
        // redirect to signin page
        location.href = location.pathname.replace('reset.html', 'signin.html');
      }
    } catch (err) {
      console.log(err);
      if (err.response.status === 400) {
        alert('連結失效，請重新申請');
        location.href = location.href.replace('reset.html', 'apply_reset.html');
        return;
      }
      alert('設定失敗');
    }
  });
});
