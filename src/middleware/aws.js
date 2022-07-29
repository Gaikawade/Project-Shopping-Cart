const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: 'AKIAY3L35MCRVFM24Q7U',
    secretAccessKey: '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',
    region: 'ap-south-1',
});

let uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        const s3 = new aws.S3({apiVersion: '2006-03-01'});
        const params = {
            ACL: 'public-read',
            Bucket: 'classroom-training-bucket',
            Key: 'file/' + file.originalname,
            Body: file.buffer
        };
        s3.upload(params, (err, data) => {
            if(err) return reject({'error': err});
            return resolve(data.Location);
        });
    });
};

module.exports = {uploadFile};