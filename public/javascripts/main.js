'use strict';

jQuery(document).ready(() => {
  console.log('Ready to do stuff from main script!');

  var documentTypeSelect = jQuery('select#documentTypeSelect');
  documentTypeSelect.on('change', () => {
    toggleNewDocumentDetails(documentTypeSelect);
  });

  toggleNewDocumentDetails(documentTypeSelect);
});

function toggleNewDocumentDetails(documentTypeSelect) {
  if (documentTypeSelect.val() == 1) {
    console.log('Travel');
    jQuery('#newDocumentFormTravelDetails').removeClass('invisible');

    // add "required" prop from travel related inputs
    enableTravelDetailsValidation();

  } else if (documentTypeSelect.val() == 2) {
    console.log('Reimbursement');
    jQuery('#newDocumentFormTravelDetails').addClass('invisible');

    // remove "required" prop from travel related inputs
    enableTravelDetailsValidation(false);;
  }
}

function enableTravelDetailsValidation(required = true) {
  jQuery('input[name^="travel["]').each((key, value) => {
    jQuery(value).prop("required", required); 
    console.log(jQuery(value).prop("required"));
  });
}