window.addEventListener('load', () => {
  showProfile();
});

async function showProfile() {
  try {
    const url = '/api/1.0/users/profile';
    const userName = document.querySelector('.userName');
    const content = document.querySelector('.content');
    const navbar = document.querySelector('.navbar');
    const responseData = await axios.get(url);
    if (responseData.error) { throw new Error('aioxs fail'); }
    const { data } = await responseData;
    const {
      name, account, batch, class_group_name, class_type_name, actions,
    } = data.data;
    console.log(data);
    userName.innerText = data.data.name;
    content.innerHTML = `
    培訓內容:${class_type_name} 梯次:${batch} 班別:${class_group_name}
    `;
    console.log(actions);
    Object.keys(actions).forEach((action) => {
      const div = document.createElement('div');
      const a = document.createElement('a');
      div.setAttribute('class', 'nav_btn');
      a.innerText = action;
      a.setAttribute('href', actions[action]);
      div.appendChild(a);
      navbar.appendChild(div);
    });
  } catch (err) {
    console.log(err);
    location.href = '/';
  }
}
