'use strict';

const excel = require('excel4node');

const uuidv4 = require('uuid/v4');

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports.generateReportLogUrl = (event, context, callback) => {

  // Create a new instance of a Workbook class
  let workbook = new excel.Workbook();

  //Create two worksheets:

  //   Log  
  let sheetLog = workbook.addWorksheet("Log");
  sheetLog.cell(1, 1).string("PROCESS NUMBER");
  sheetLog.cell(1, 2).string("STATUS");

  //   Det  
  let sheetDet = workbook.addWorksheet("Det");
  sheetDet.cell(1, 1).string("PROCESS NUMBER");
  sheetDet.cell(1, 2).string("NAME");
  sheetDet.cell(1, 3).string("DATE");
  sheetDet.cell(1, 4).string("DESCRIPTION");


  const logNumber = Math.floor(Math.random() * 50) + 2;
  console.log('Number of Logs :', logNumber);

  const detNumber = Math.floor(Math.random() * 100) + 2;
  console.log('Number of Details :', detNumber);

  //Simulation the information source. The source could be any thing, like Relation database, NoSQL and etc

  let rowNumberDet = 2;

  for (let i = 1; i <= logNumber; i++) {

    let processNumber = uuidv4().toString();
    let processStatus = Math.floor(Math.random() * 100) + 1;
    let processStatusDec = statusDescription(processStatus);

    let rowNumberLog = i + 1;

    sheetLog.cell(rowNumberLog, 1).string(processNumber);
    sheetLog.cell(rowNumberLog, 2).string(processStatusDec);

    for (let j = 1; j <= detNumber; j++) {

      let detName = uuidv4().toString();
      let detDate = new Date().toString();
      let detDescription = uuidv4() + " " + uuidv4() + " " + uuidv4();

      sheetDet.cell(rowNumberDet, 1).string(processNumber);
      sheetDet.cell(rowNumberDet, 2).string(detName);
      sheetDet.cell(rowNumberDet, 3).string(detDate);
      sheetDet.cell(rowNumberDet, 4).string(detDescription);

      rowNumberDet++;
    }
  }

  let fileName = 'MyLogReport_' + uuidv4() + '.xlsx';
  console.log('FileName:', fileName);

  //Replace the variable value with your bucket name
  let bucketName = 'mybucketfortemporarylogs';

  workbook.writeToBuffer().then(function (file_buffer) {

    var params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file_buffer
    };

    s3.putObject(params, function (err, pres) {
      if (err) {

        callback(err);

      } else {

        const signedUrlExpireSeconds = 86400;// 1 Day
        const url = s3.getSignedUrl('getObject', {
          Bucket: bucketName,
          Key: fileName,
          Expires: signedUrlExpireSeconds
        });

        console.log('Url : ', url);

        callback(null, url);

      }
    });
  });


};


function statusDescription(status) {

  let statusDesc = 'SUCCESS';

  if (status % 2 == 0) {
    statusDesc = 'FAIL';
  }

  return statusDesc;
}
