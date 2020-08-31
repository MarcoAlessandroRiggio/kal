const xlsx = require('xlsx');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const scanTable = (params) => {
    return new Promise((resolve, reject) => {
        const docClient = new AWS.DynamoDB.DocumentClient();
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Scan succeeded.");
                resolve(data.Items);
            }
        });
    });
}

exports.handler = async function (event) {
    const workbookPromise = await new Promise((resolve, reject) => {
        try {
            event.Records.forEach(record => {
                const file = s3.getObject({
                    Bucket: process.env.BUCKET,
                    Key: record.s3.object.key
                }).createReadStream(), buffers = [];
                file.on('data', data => buffers.push(data));
                file.on('end', () => resolve(xlsx.read(Buffer.concat(buffers))));
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
    const playersPromise = scanTable({TableName: process.env.USERS_TABLE});
    const testsDefinitionPromise = scanTable({TableName: process.env.TESTS_DEFINITION_TABLE});

    const [workbook, players, testsDefinition] = await Promise.all([workbookPromise, playersPromise, testsDefinitionPromise]);

    await new Promise((resolve, reject) => {
        const sheetPromises = [];

        workbook.SheetNames.forEach(sheetName => {
            const testDefinition = testsDefinition.filter(e => e.name.toLowerCase() === sheetName.toLowerCase());
            if (testDefinition.length === 1) {
                const writeRequest = {
                    RequestItems: {
                        [process.env.TESTS_TABLE]: []
                    }
                };
                const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
                for (const key in data) {
                    const record = data[key];
                    const player = players.filter(e => e.name.toLowerCase() === record["ATLETI"].toLowerCase());
                    if (player.length === 1) {
                        const recordToPush = {PutRequest: {Item: {}}};
                        recordToPush.PutRequest.Item["id"] = {S: `${player[0].id}_${testDefinition[0].id}_${record["Date"]}`};
                        recordToPush.PutRequest.Item["date"] = {S: `${record["Date"]}`};
                        recordToPush.PutRequest.Item["player"] = {S: `${player[0].id}`};
                        recordToPush.PutRequest.Item["test"] = {S: `${testDefinition[0].id}`};
                        for (const property in record) {
                            recordToPush.PutRequest.Item[property] = {S: `${record[property]}`};
                        }
                        writeRequest.RequestItems[process.env.TESTS_TABLE].push(recordToPush);
                    } else {
                        console.warn(`row ${key} of sheet ${sheetName} skipped, player not recognized.`);
                    }
                }
                if(writeRequest.RequestItems[process.env.TESTS_TABLE].length) {
                    sheetPromises.push(new Promise((resolve1, reject1) => {
                        new AWS.DynamoDB().batchWriteItem(writeRequest, (err, data1) => {
                            if (err) {
                                console.error(err);
                                reject1(err);
                            } else resolve1(data1);
                        });
                    }));
                } else console.warn(`sheet ${sheetName} processed but nothing to store!!`);

            } else {
                console.warn(`Sheet skipped: ${sheetName}`);
                // TODO manage test name error
            }
        })
        Promise.all(sheetPromises)
            .then(value => resolve(value))
            .catch(reason => {
                console.error(reason);
                reject(reason);
            });
    });

};