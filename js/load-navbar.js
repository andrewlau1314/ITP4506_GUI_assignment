// Load shared navbar fragment into #site-header and set active link
(function(){
  function resolveHref(dataPath){
    if(!dataPath) return '#';
    try{
      // dataPath is repo-relative (e.g. customer/create-quote.html)
      // Compute relative path from current location to target
      var curPath = window.location.pathname.split('/').filter(Boolean); // e.g. ['customer','create-quote.html'] or ['staff','view-request.html']
      var curDir = curPath.slice(0, -1); // directory parts
      var targetParts = dataPath.split('/').filter(Boolean); // e.g. ['customer','create-quote.html']
      var targetDir = targetParts.slice(0, -1);
      // find common prefix length
      var i = 0;
      while(i < curDir.length && i < targetDir.length && curDir[i] === targetDir[i]) i++;
      var up = curDir.length - i;
      var relParts = [];
      for(var j=0;j<up;j++) relParts.push('..');
      relParts = relParts.concat(targetParts.slice(i));
      return relParts.join('/') || './';
    }catch(e){return dataPath;}
  }

  function bindLogout(){
    var logout = document.getElementById('nav-logout');
    if (!logout) return;
    logout.addEventListener('click', function(e){
      e.preventDefault();
      if (window.logout) window.logout();
      else { localStorage.removeItem('currentUser'); window.location.href = '../common/login.html'; }
    });
  }

  function highlightActive(){
    var links = document.querySelectorAll('#site-header nav a');
    if (!links) return;
    var current = window.location.pathname.split('/').pop();
    links.forEach(function(a){
      var href = a.getAttribute('href') || '';
      if (href === current) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  window.loadNavbar = function(containerId){
    var tryPaths = ['../common/navbar.html','common/navbar.html','./common/navbar.html'];
    (function tryNext(i){
      if (i>=tryPaths.length) return console.error('Navbar not found');
      fetch(tryPaths[i],{method:'GET'}).then(function(res){
        if (!res.ok) return tryNext(i+1);
        return res.text();
      }).then(function(html){
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = html;
        // resolve data-path into hrefs relative to current folder
        var anchors = container.querySelectorAll('nav a[data-path]');
        anchors.forEach(function(a){
          var p = a.getAttribute('data-path');
          a.setAttribute('href', resolveHref(p));
        });
        bindLogout();
        highlightActive();
      }).catch(function(){ tryNext(i+1); });
    })(0);
  };
})();
