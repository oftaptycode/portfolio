(function() {
    // ===== Page Navigation =====
    var pages = document.querySelectorAll('.page');
    var navLinksEl = document.getElementById('navLinks');
    var hamburger = document.getElementById('hamburger');
    var navbar = document.getElementById('navbar');
    var isDarkMode = false;

    function setActivePage(pageId) {
        pages.forEach(function(page) {
            page.classList.remove('active');
        });

        var pageEl = document.getElementById('page-' + pageId);
        if (pageEl) pageEl.classList.add('active');

        var allLinks = document.querySelectorAll('.nav-link');
        allLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });

        closeMenu();
        window.scrollTo(0, 0);
    }

    function openMenu() {
        navLinksEl.classList.add('open');
        hamburger.textContent = 'close';
    }

    function closeMenu() {
        navLinksEl.classList.remove('open');
        hamburger.textContent = 'menu';
    }

    hamburger.addEventListener('click', function() {
        if (navLinksEl.classList.contains('open')) closeMenu(); else openMenu();
    });

    document.querySelectorAll('.nav-link, .cta-btn').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var pageId = this.getAttribute('data-page');
            if (pageId) setActivePage(pageId);
        });
    });

    // ===== Dark Mode Toggle =====
    var themeToggle = document.getElementById('themeToggleNav');

    function applyTheme(dark) {
        document.body.classList.toggle('dark-mode', dark);
        hamburger.style.color = dark ? '#FFFFFF' : '';
        themeToggle.textContent = dark ? 'light_mode' : 'dark_mode';
        isDarkMode = dark;
    }

    themeToggle.addEventListener('click', function() {
        applyTheme(!isDarkMode);
    });

    // ===== Grade Tabs =====
    var gradeTabs = document.querySelectorAll('.grade-tab');
    var gradePanels = document.querySelectorAll('.grade-panel');

    gradeTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var grade = this.getAttribute('data-grade');
            gradeTabs.forEach(function(t) { t.classList.remove('active'); });
            gradePanels.forEach(function(p) { p.classList.remove('active'); });
            this.classList.add('active');
            document.getElementById('grade-' + grade).classList.add('active');
        });
    });

})();
