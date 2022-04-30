require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

const domain = process.env.DOMAIN;

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.MAIL_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

const sendResetEmail = async (role, name, email, hash) => {
  const url = `http://${domain}/${role}_reset.html?apply=${hash}`;
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.sender = { email: 'sendinblue@sendinblue.com', name: 'Fingerprinta' };
  sendSmtpEmail.subject = '[Fingerprinta]忘記密碼提醒信';
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <body>
        <div>嗨 ${name}</div>
        <div>
          <p></p>
          系統已經收到重新設定密碼的申請，<br>
          請連結到以下網頁，重新設定一組新密碼：<br>
          <a href="${url}">${url}</a>
          <br>
          [請注意]<br>
          此連結在申請後1小時以內只能使用一次。<br>
          如果連結已無法使用，<br>
          煩請再次申請密碼。<br>
          <br>
          Fingerprinta 敬上<br>
          <br>
          <small>*此信件為系統自動寄出，請勿直接回覆。</small>
        </div>
      </body>
    </html>
  `;
  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(result);
    return { code: 1000 };
  } catch (err) {
    console.log(err);
    return { code: 2000 };
  }
};

module.exports = { sendResetEmail };
