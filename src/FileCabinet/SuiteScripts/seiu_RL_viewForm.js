/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Sagar Kumar
 *@description it will return record data on behalf record internla id which will be given by source API.
 */
define(["N/record", "N/error"], function (record, error) {
  function doValidation(args, argNames, methodName) {
    for (var i = 0; i < args.length; i++)
      if (!args[i] && args[i] !== 0)
        throw error.create({
          name: "MISSING_REQ_ARG",
          message:
            "Missing a required argument: [" +
            argNames[i] +
            "] for method: " +
            methodName,
        });
  }

  function _get(context) {
    const copeForm = {
      recordId: "id",
      body: {
        customer: "custbody_local_customer",
        localCode: "cseg_local_code",
        status: "custbody_status",
        date_transmitted: "custbody_date_transmitted",
        RejectionReasion: "custbody_rejected_comments",
        memo: "memo",
        date_bankRechived: "custbody_seiu_cope_bank_rec_date",
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
      },
      lines: [],
    };

    try {
      //Validate the record data is correct if not then through custom error.
      doValidation([context.id], ["id"], "GET");

      //load required record that id sent by requester.
      const copeRecord = record.load({
        type: "customtransaction108",
        id: context.id,
      });

      copeForm.recordId = context.id;

      // Map required body fields of record.
      for (const bodyFieldKey in copeForm.body) {
        if (copeForm.body.hasOwnProperty.call(copeForm.body, bodyFieldKey)) {
          copeForm.body[bodyFieldKey] = copeRecord.getValue({
            fieldId: copeForm.body[bodyFieldKey],
          });
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
      return {
        success : false,
        data: error.message,
      };
    }
  }

  function _post(context) {
    return {
      Success: "false",
      error: {
        Message: "This method is not allowed.",
      },
    };
  }

  function _delete(context) {
    return {
      Success: "false",
      error: {
        Message: "This method is not allowed.",
      },
    };
  }

  function _put(context) {
    return {
      Success: "false",
      error: {
        Message: "This method is not allowed.",
      },
    };
  }

  return {
    get: _get,
    post: _post,
    put: _put,
    delete: _delete,
  };
});
