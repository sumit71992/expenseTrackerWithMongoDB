const AWS = require('aws-sdk');

const uploadToS3 = async (data, filename) => {
    try {
      const BUCKET_NAME = process.env.AWS_USER_BUCKET;
      const IAM_USER_KEY = process.env.AWS_USER_KEY;
      const IAM_USER_SECRET = process.env.AWS_SECRET_KEY;
      let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
      })
      let fileDetails = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
      }
      return new Promise((resolve, reject) => {
        s3bucket.upload(fileDetails, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.Location);
          }
        });
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err, message: "Something went wrong" });
    }
  };

  module.exports={
    uploadToS3,
  }