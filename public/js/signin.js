const signInForm = document.querySelector('.signin_form');

signInForm.addEventListener('submit', handleFromSubmit);
async function handleFromSubmit(event) {
  try {
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;
    event.preventDefault();
    const form = event.target;
    const url = form.action;
    const responseData = await axios(url, {
      method: 'POST',
      data: {
        account,
        password,
      },
      headers: {
        'content-type': 'application/json',
      },
    });
    const { data } = await responseData;
    if (data) {
      // redirect to profile page
      location.href = '/profile.html';
    }
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
  }
}
