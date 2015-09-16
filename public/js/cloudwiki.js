/* Edit functions */

$(document).ready(function() {

  $('#searchForm').on('submit', function(e) {
    e.preventDefault();
    window.location.href = '/' + $('#search').val().replace(/ /g, "_");
  });

  $('#editArticle').on('click', function() {
    var title = $(this).attr('data-title');
    $(this).fadeOut();
    $.get(title + '/edit', function(data) {

      $('#edit').append($('#editForm'), $(data));

      $('#editForm').on('submit', function(e) {

        e.preventDefault();

        var newTitle = $('#editForm').find('input[name="title"]').val().replace(/ /g, "_");
        $.post('/api/' + title, $(this).serialize(), function() {
          $('#editForm').fadeOut(400, function() {


            // I'll make this more elegant later, this works for now
            window.location.href = '/' + newTitle;

          }); // end fade out

        }); // end post

      }); // end submit
    }); // end get edit form
  }); // end button click
}); // jquery document ready

// ^ I'm so sorry... this will be cleaned up later.