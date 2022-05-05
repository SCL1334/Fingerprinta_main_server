const imageForm = document.querySelector('#imageForm');
const imageInput = document.querySelector('#imageInput');

imageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = imageInput.files[0];

  // 從後端拿網址
  const { id, url } = await fetch('/api/1.0/students/s3url').then((res) => res.json());
  console.log('The data id is', id);
  console.log('The data url is', url);

  // 把圖片傳到s3
  await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: file,
  });

  const imageUrl = url.split('?')[0];
  console.log('the image is', imageUrl);

  // imageUrl點開就會是實際的網址，再把網址連同原本的東西丟給後端即可
});
