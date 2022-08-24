/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Sagar Kumar
 *@description It return the Obligation record of a localist. It will required localist and year for preduce data from source API.
 *@example:

 */

define(["N/record", "N/error", "N/search"], function (record, error, search) {
  function setObligationRecordTotalAmount(localCustomer, year) {
    const obligationRecordFeilds = {
      localist: "custrecord218",
      obligationAmount: "custrecord219",
      contributionAmount: "custrecord220",
      year: "custrecord_script_year",
      amountRevQalifying: "custrecord_co_qualifying_rev_amnt",
      amountRevNonQaulifying: "custrecord_co_non_quallifying_rev_amnt",
      amountRevHold: "custrecord_co_hold_rev_amnt",
      totalReversal: "custrecord_co_reversal_sum",
      differenceRevContr: "custrecord_co_difference_amnt",
    };

    // serach record to set total amount in cope obligation field.
    var customrecord_seiu_cope_obligationSearchObj = search.create({
      type: "customrecord_seiu_cope_obligation",
      filters: [
        ["custrecord218", "anyof", localCustomer],
        "AND",
        ["custrecord_script_year", "is", year],
      ],
      columns: [
        search.createColumn({ name: "internalid", label: "Internal ID" }),
      ],
    });
    var searchResultCount =
      customrecord_seiu_cope_obligationSearchObj.runPaged().count;
    log.debug(
      "customrecord_seiu_cope_obligationSearchObj result count",
      searchResultCount
    );

    if (searchResultCount > 0) {
      let localList = "";
      customrecord_seiu_cope_obligationSearchObj.run().each(function (result) {
        // .run().each has a limit of 4,000 results
        var recordId = result.getValue({
          name: "internalid",
        });

        log.debug("record id is " + recordId);

        if (recordId) {
          localList = record.load({
            type: "customrecord_seiu_cope_obligation",
            id: recordId,
          });
        }

        // log.debug("localist record is", localList);

        return true;
      });

      if (localList) {
        for (const fieldKey in obligationRecordFeilds) {
          if (
            obligationRecordFeilds.hasOwnProperty.call(
              obligationRecordFeilds,
              fieldKey
            )
          ) {
            const recordFieldId = obligationRecordFeilds[fieldKey];

            obligationRecordFeilds[fieldKey] = localList.getValue({
              fieldId: recordFieldId,
            });
          }
        }

        return {
          Success : true,
          Data : obligationRecordFeilds
        }

        log.debug(
          "obligation record repsonse object is",
          obligationRecordFeilds
        );
      }
    } else {
      return {
        Success: false,
        Data: {
          Name: "DATA_NOT_FOUND",
          Message : `No record found for ${localCustomer}`
        },
      };
    }

    // return localList;

    /*
    customrecord_seiu_cope_obligationSearchObj.id="customsearch1654784421346";
    customrecord_seiu_cope_obligationSearchObj.title="COPE Obligation Search sk (copy)";
    var newSearchId = customrecord_seiu_cope_obligationSearchObj.save();
    */
  }

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

  function _get(context) {

    log.debug(
      "",
      `custoemr is ${context.local_customer} and year is ${context.obligation_year} `
    );

    doValidation([context.local_customer,context.obligation_year],["local_customer","obligation_year"],"GET");

    //serach the record of localist for a specific year in record list.

    return setObligationRecordTotalAmount(
      context.local_customer,
      context.obligation_year
    );
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
