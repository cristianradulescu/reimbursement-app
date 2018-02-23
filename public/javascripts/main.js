'use strict';

jQuery(document).ready(() => {
  console.log('Ready to do stuff from main script!');

  var documentTypeSelect = jQuery('select#documentTypeSelect');
  documentTypeSelect.on('change', () => {
    toggleNewDocumentDetails(documentTypeSelect);
  });

  toggleNewDocumentDetails(documentTypeSelect);
  syncTravelDates();
});

/**
 * Show/hide form sections based on selected document type
 * 
 * @param {string} documentTypeSelect 
 */
function toggleNewDocumentDetails(documentTypeSelect) {
  var allOptions = jQuery('#'+documentTypeSelect.attr('id')+' option');
  var selectedOption = jQuery('#'+documentTypeSelect.attr('id')+' option:selected');

  allOptions.each((key, element) => {
    if (jQuery(element).val() == selectedOption.val()) {
      jQuery('#newDocumentForm'+jQuery(element).text()+'Details').removeClass('d-none');
      enableDocumentDetailsValidation(jQuery(element).text().toLowerCase(), true);
    } else {
      jQuery('#newDocumentForm'+jQuery(element).text()+'Details').addClass('d-none');
      enableDocumentDetailsValidation(jQuery(element).text().toLowerCase(), false);
    }
  });
}

/**
 * Add/remove "required" prop from inputs
 * 
 * @param {string} documentType 
 * @param {boolean} required Defaults to "true"
 */
function enableDocumentDetailsValidation(documentType, required = true) {
  jQuery('input[name^="'+documentType+'["]').each((key, value) => {
    jQuery(value).prop("required", required); 
    console.log(jQuery(value).prop("required"));
  });
}

/**
 * Autofill leave/arrival times based on the travel period. 
 */
function syncTravelDates()
{
  jQuery('#travelDateStartInput').on('change', function() {
    jQuery('#travelDateEndInput').val(jQuery(this).val()).trigger('change');
    jQuery('#travelDepartureLeaveTimeInput').val(jQuery(this).val()+'T06:00');
    jQuery('#travelDestinationArrivalTimeInput').val(jQuery(this).val()+'T09:00');
  });

  jQuery('#travelDateEndInput').on('change', function() {
    jQuery('#travelDestinationLeaveTimeInput').val(jQuery(this).val()+'T18:00');
    jQuery('#travelDepartureArrivalTimeInput').val(jQuery(this).val()+'T21:00');
  });
}