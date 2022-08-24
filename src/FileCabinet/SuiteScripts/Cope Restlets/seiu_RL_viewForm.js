/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Sagar Kumar
 *@description it will return record data on behalf record internla id which will be given by source API.
 */
define(["N/record", "N/error", "N/file"], function (record, error, file) {

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

  function getAttachedFile(fileId) {
    const fileObj = file.load({
      id: fileId,
    });

    return {
      id: fileId,
      name: fileObj.name,
      url: fileObj.url,
    };
  }

  function _get(context) {
    const RECORDTYPE = "customtransaction108";
    const copeForm = {
      recordId: "id",
      body: {
        localList: "custbody_local_customer",
        localCode: "cseg_local_code",
        status: "custbody_status",
        date_transmitted: "custbody_date_transmitted",
        RejectionReasion: "custbody_rejected_comments",
        memo: "memo",
        date_bankRecived: "custbody_seiu_cope_bank_rec_date",
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
      },
      lines: [],
    };

    try {
      //Validate the record data is correct if not then through custom error.
      const localId = context.localList;
      doValidation([context.id,context.localList], ["id","localList"], "GET");

      //load required record that id sent by requester.
      const copeRecord = record.load({
        type: RECORDTYPE,
        id: context.id,
      });

      copeForm.recordId = context.id;

      // Map required body fields of record.
      for (const bodyFieldKey in copeForm.body) {
        if (copeForm.body.hasOwnProperty.call(copeForm.body, bodyFieldKey)) {
          if (bodyFieldKey == "fileAttachment") {
            const fileID = copeRecord.getValue({
              fieldId: copeForm.body[bodyFieldKey],
            });

            if(fileID)
            copeForm.body[bodyFieldKey] = getAttachedFile(fileID);
          }else if(bodyFieldKey == "localList"){
            const resLocalId = copeRecord.getValue({
              fieldId: copeForm.body[bodyFieldKey],
            });
            if(resLocalId == localId){
              copeForm.body[bodyFieldKey] = copeRecord.getValue({
                fieldId: copeForm.body[bodyFieldKey],
              });
            }else{
              return genericError(localId);
            }
          } else {
            copeForm.body[bodyFieldKey] = copeRecord.getValue({
              fieldId: copeForm.body[bodyFieldKey],
            });
          }

          // copeForm.body[bodyFieldKey] = fieldValue
        }
      }

      log.debug({
        title: "copeForm.body",
        details: copeForm.body,
      });

      const totalRecordLines = copeRecord.getLineCount({
        sublistId: "line",
      });

      // Map required line fields of record.
      for (let recordLine = 0; recordLine < totalRecordLines; recordLine++) {
        // const element = array[recordLine];

        const recordLinesObj = {
          lineNo: "index",
          amount: "amount",
          confirmationNo: "custcol_check_confirmation_number",
          ItemId: "custcol_membership_item",
          qualifying_Amount: "custcol_qualifying_funds",
          nonQualifying_Amount: "custcol_non_qualifying_funds",
          quantity: "custcol_quantity",
          rate: "custcol_rate",
          paymentMethod: "custcol_seiu_payment_method",
          recivedDate: "custcol_service_date",
          transmittedDate: "custcol_service_date_by_seiu",
        };

        for (const lineFieldKey in recordLinesObj) {
          if (
            recordLinesObj.hasOwnProperty.call(recordLinesObj, lineFieldKey)
          ) {
            log.debug("recordLine", recordLine);
            log.debug("lineFieldKey", lineFieldKey);

            if (lineFieldKey == "lineNo") {
              recordLinesObj[lineFieldKey] = recordLine;
            } else {
              log.debug(
                " line value " + lineFieldKey,
                copeRecord.getSublistValue({
                  sublistId: "line",
                  fieldId: recordLinesObj[lineFieldKey],
                  line: recordLine,
                })
              );
              recordLinesObj[lineFieldKey] = copeRecord.getSublistValue({
                sublistId: "line",
                fieldId: recordLinesObj[lineFieldKey],
                line: recordLine,
              });
            }
          }
        }

        log.debug({
          title: "recordLinesObj",
          details: recordLinesObj,
        });
        copeForm.lines.push(recordLinesObj);
      }

      log.debug("cope form is", copeForm);

      return {
        Success: true,
        data: copeForm,
      };
    } catch (error) {
     return error
    }
  }

  function _post(context) {
    return genericError("POST");
  }

  function _delete(context) {
    return genericError("DELETE");
  }

  function _put(context) {
    return genericError("PUT");
  }

  return {
    get: _get,
    post: _post,
    put: _put,
    delete: _delete,
  };
});
