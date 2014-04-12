$(function() {
  $(document).on('click', '.login-user-icon', function() {
    var $userMenu = $('.user-menu');
    if ($userMenu.is('.inactive')) {
      $userMenu.show(0, function() {
        $userMenu.addClass('active').removeClass('inactive');
      });
    } else {
      $userMenu.hide(0, function() {
        $userMenu.addClass('inactive').removeClass('active');
      });
    }
  });

  $(document).on('click', '.link', function() {
    var href = $(this).attr('href');
    if (href) {
      window.location = href;
    }
  });
});
