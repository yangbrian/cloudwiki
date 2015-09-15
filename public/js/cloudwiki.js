/* Edit functions */

$(document).ready(function() {
  $('#editArticle').on('click', function() {
    var title = $(this).attr('data-title');
    $(this).fadeOut();
    $.get(title + '/edit', function(data) {

      $('#edit').append($('#editForm'), $(data));

      $('#editForm').on('submit', function(e) {

        e.preventDefault();
        $.post('/api/' + title, $(this).serialize(), function() {
          $('#editForm').fadeOut(400, function() {

            console.log('test');
            $(this).remove();

            // I'll make this more elegant later, this works for now
            location.reload();

          }); // end fade out

        }); // end post

      }); // end submit
    }); // end get edit form
  }); // end button click
}); // jquery document ready

// ^ I'm so sorry... this will be cleaned up later.