const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
GOOGLE_MAILER_CLIENT_ID =
  "63611948442-ltl83efjrtj98gvb63rffuq8v2viidcv.apps.googleusercontent.com";
GOOGLE_MAILER_CLIENT_SECRET = "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";
GOOGLE_MAILER_REFRESH_TOKEN =
  "1//042Gm4lekLwolCgYIARAAGAQSNwF-L9IrDilCC8NuMkkgZ75MaabTIhXw9A5VXEFIFxOrmvugyIq7s8-LSkj-dsJvGYMO_qzXCHo";
ADMIN_EMAIL_ADDRESS = "dat.nguyen@idsolutions.com.vn";

// Khởi tạo OAuth2Client với Client ID và Client Secret
const myOAuth2Client = new OAuth2Client(
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET
);

// Set Refresh Token vào OAuth2Client Credentials
myOAuth2Client.setCredentials({
  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
});

const sendEmail = async (to, subject, htmlContent) => {
  /* Lấy AccessToken từ RefreshToken (bởi vì Access Token cứ một khoảng thời gian ngắn sẽ bị hết hạn)
   * Vì vậy mỗi lần sử dụng Access Token, chúng ta sẽ generate ra một thằng mới là chắc chắn nhất.
   */
  const myAccessTokenObject = await myOAuth2Client.getAccessToken();
  // Access Token sẽ nằm trong property 'token' trong Object mà chúng ta vừa get được ở trên
  const myAccessToken = myAccessTokenObject?.token;

  // Tạo một biến Transport từ Nodemailer với đầy đủ cấu hình, dùng để gọi hành động gửi mail
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: ADMIN_EMAIL_ADDRESS,
      clientId: GOOGLE_MAILER_CLIENT_ID,
      clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
      refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
      accessToken: myAccessToken,
    },
  });
  const options = {
    to: to, // địa chỉ gửi đến
    subject: subject, // Tiêu đề của mail
    html: htmlContent, // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
  };
  return transport.sendMail(options);
};

module.exports = {
  sendEmail: sendEmail,
};
