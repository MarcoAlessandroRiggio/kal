const xlsx = require('xlsx');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async function(event) {
    try {
        let workbook = await new Promise((resolve, reject) => {
            event.Records.forEach(record => {
                const file = s3.getObject({
                    Bucket: process.env.BUCKET,
                    Key: record.s3.object.key
                }).createReadStream(), buffers = [];
                file.on('data', data => buffers.push(data));
                file.on('end', () => resolve(xlsx.read(Buffer.concat(buffers))));
            });
        });
        workbook.SheetNames.forEach(sheetName => {
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            for(const key in data){
                console.log(data[key]);
            }
        })
    } catch (e) {
        console.log(e);
    }

};