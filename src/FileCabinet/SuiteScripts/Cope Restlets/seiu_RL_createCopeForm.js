/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Sagar Kumar
 *@description It will create the Cope memership record based on desired data that is sent by a post request and return reocrd id after successfull.
 *It will give error if something is missing in the data.
 */

const COPE_FILE_FOLDER_ID = 160395;

define(["N/record", "N/file", "N/error"], function (record, file, error) {
  function doValidation(args, argNames, methodName) {
    for (var i = 0; i < args.length; i++)
      if (!args[i] && args[i] !== 0)
        throw {
          Status: false,
          Name : "MISSING_REQ_ARG",
          Message :  "Missing a required argument: [" +
          argNames[i] +
          "] for method: " +
          methodName,
        }
  }

  function genericError(method){
    return {
      Status: false,
      Name : "PAGE_NOT_FOUND",
      Message :  `Requested Page is not found for '${method}'`,
    };
  }

  function createFile(fileName, type, fileData) {
    let fileType = "";
    const fileTypes = {
      txt: file.Type.PLAINTEXT,
      text: file.Type.PLAINTEXT,
      pdf: file.Type.PDF,
      csv: file.Type.CSV,
      jpeg: file.Type.JPGIMAGE,
      jpg: file.Type.JPGIMAGE,
      zip: file.Type.ZIP,
      doc: file.Type.WORD,
    };
    for (const fileTypesKey in fileTypes) {
      if (fileTypes.hasOwnProperty.call(fileTypes, fileTypesKey)) {
        const element = fileTypes[fileTypesKey];
        // log.debug("",`type is ${type} and fileTypesKey is ${fileTypesKey} where value is ${element}`);
        if (type == fileTypesKey) {
          fileType = element;
          log.debug(
            "",
            `type is ${type} and fileTypesKey is ${fileTypesKey} where value is ${fileType}`
          );
          break;
        } else {
          continue;
        }
      }
    }

    if (!fileType) {
      throw {
        Status: false,
        Name : "INVALID_DOCUMENT_TYPE",
        Message :  `${type} type is not supported`,
      }
    } else {
      log.debug(`file data is ${fileData}`);
      const fileObj = file.create({
        name: fileName,
        fileType: fileType,
        contents: fileData,
        folder: COPE_FILE_FOLDER_ID,
      });
      const fileUrl = fileObj.url;

      const fileNo = fileObj.save();
      return {
        id: fileNo,
        name: fileName,
        url: fileUrl,
      };
    }
  }

  function _get(context) {
    return genericError("GET");

  }

  function _post(context) {
    doValidation([context.data.lines.length], ["Record Creation Data"], "POST");
    const RECORDTYPE = "customtransaction108";
    const tobeCreateRecord = context.data;
    // log.debug("data is ", tobeCreateRecord);

    try {
      const bodyFields = {
        localList: "custbody_local_customer",
        localCode: "cseg_local_code",
        status: "custbody_status",
        date_transmitted: "custbody_date_transmitted",
        RejectionReasion: "custbody_rejected_comments",
        memo: "memo",
        revisedDate_transmitted: "custbody_2nd_date_transmitted",
        postingDate: "trandate",
        nonQualifying_Amount_LOCAL: "custbody_local_non_qualifying_fund",
        nonQualifying_Amount_SEIU: "custbody_seiu_non_qualifying_funds",
        qualifying_Amount_SEIU: "custbody_seiu_qualifying_funds",
        paymentMethod: "custbody_ctf_payment_method_header",
        isHold: "custbody_cust_bank_hold_acc",
        subsidiary: "subsidiary",
        qualifying_Amount_LOCAL: "custbody_local_qualifying_funds",
        totalAmount: "total",
        isFedPac: "custbody_seiu_pac_bank_acc",
        formYear: "custbodycope_year",
        rejectedBy: "custbodyrejected_by",
        fileAttachment: "custbody_seiu_support_docs",
      };

      const recordLinesObj = {
        amount: "amount",
        confirmationNo: "custcol_check_confirmation_number",
        ItemId: "custcol_membership_item",
        paymentMethod: "custcol_seiu_payment_method",
        recivedDate: "custcol_service_date",
      };

      const copeRecord = record.create({
        type: RECORDTYPE,
        isDynamic: true,
        // defaultValues: { subsidairy: tobeCreateRecord.subsidiary }
      });

        copeRecord.setValue({
          fieldId: bodyFields.subsidiary,
          value: 10,
        });

      log.debug("cope record is", copeRecord);

      for (const fieldKey in tobeCreateRecord.body) {
        if (
          tobeCreateRecord.body.hasOwnProperty.call(
            tobeCreateRecord.body,
            fieldKey
          )
        ) {
          let fieldValue = tobeCreateRecord.body[fieldKey];

          for (const recordFieldKey in bodyFields) {
            if (bodyFields.hasOwnProperty.call(bodyFields, recordFieldKey)) {
              let fieldId = bodyFields[recordFieldKey];
              if (fieldKey == recordFieldKey) {
                log.debug(
                  "fieldKey " +
                    fieldKey +
                    " recordFieldKey " +
                    recordFieldKey +
                    " fieldId " +
                    fieldId +
                    " fieldValue " +
                    fieldValue
                );
                if (
                  fieldKey == "date_transmitted" ||
                  fieldKey == "date_bankRechived" ||
                  fieldKey == "revisedDate_transmitted" ||
                  fieldKey == "postingDate"
                ) {
                  copeRecord.setValue({
                    fieldId: fieldId,
                    value: new Date(fieldValue),
                  });
                } else if (fieldKey == "fileAttachment") {
                  const reqFileObjects = tobeCreateRecord.body[fieldKey];
                  const createdreqFileObjects = createFile(
                    reqFileObjects.fileName,
                    reqFileObjects.type,
                    reqFileObjects.fileData
                  );
                  copeRecord.setValue({
                    fieldId: fieldId,
                    value: createdreqFileObjects.id,
                  });
                }else {
                  copeRecord.setValue({
                    fieldId: fieldId,
                    value: fieldValue,
                  });
                }
              }
            }
          }
        }
      }

      for (
        let reqRecordLineNo = 0;
        reqRecordLineNo < tobeCreateRecord.lines.length;
        reqRecordLineNo++
      ) {
        // copeRecord.selectLine({
        //   sublistId: "line",
        //   line: reqRecordLineNo,
        // });

        copeRecord.selectNewLine({
          sublistId: "line",
        });

        copeRecord.setCurrentSublistValue({
          sublistId: "line",
          fieldId: "account",
          value: 748,
          // ignoreFieldChange: boolean
        });

        const reqRecordLinseObj = tobeCreateRecord.lines[reqRecordLineNo];

        for (const reqcolumnKey in reqRecordLinseObj) {
          if (
            reqRecordLinseObj.hasOwnProperty.call(
              reqRecordLinseObj,
              reqcolumnKey
            )
          ) {
            let reqColumnValue = reqRecordLinseObj[reqcolumnKey];

            for (const recKey in recordLinesObj) {
              if (recordLinesObj.hasOwnProperty.call(recordLinesObj, recKey)) {
                const recColumnFieldId = recordLinesObj[recKey];

                if (reqcolumnKey == recKey) {
                  log.debug(
                    "reqcolumnKey + recKey + recColumnFieldId + reqColumnValue ",
                    reqcolumnKey +
                      " " +
                      recKey +
                      " " +
                      recColumnFieldId +
                      " " +
                      reqColumnValue
                  );

                  if (recKey == "recivedDate" || recKey == "transmittedDate") {
                    copeRecord.setCurrentSublistValue({
                      sublistId: "line",
                      fieldId: recColumnFieldId,
                      value: new Date(reqColumnValue),
                    });
                  } else if (recKey == "paymentMethod") {
                    continue;
                  } else {
                    copeRecord.setCurrentSublistValue({
                      sublistId: "line",
                      fieldId: recColumnFieldId,
                      value: reqColumnValue,
                    });
                  }
                }
              }
            }
          }
        }

        copeRecord.commitLine({
          sublistId: "line",
          //   ignoreRecalc: true,
        });
      }

      let createdCopeRecordId = copeRecord.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });

      log.debug("createdCopeRecordId", createdCopeRecordId);

      return {
        Success: true,
        Data: { id: createdCopeRecordId },
      };
    } catch (error) {
      log.debug("error during execution", error);
      //   throw error;

      return {
        Success: false,
        Data: error.message,
      };
    }
  }

  function _put(context) {
    return genericError("PUT");
  }

  function _delete(context) {
    return genericError("DELETE");
  }

  return {
    get: _get,
    post: _post,
    put: _put,
    delete: _delete,
  };
});
