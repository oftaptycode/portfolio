(function() {
    // ===== Page Navigation =====
    var pages = document.querySelectorAll('.page');
    var navLinksEl = document.getElementById('navLinks');
    var hamburger = document.getElementById('hamburger');
    var navbar = document.getElementById('navbar');
    var menuOpen = false;
    var isDarkMode = false;

    var pageMap = {
        'home': 'page-home',
        'about': 'page-about',
        'grades': 'page-grades',
        'plans': 'page-plans',
        'achievements': 'page-achievements',
        'experience': 'page-experience',
        'coding': 'page-coding',
        'organization': 'page-organization'
    };

    function setActivePage(pageId) {
        pages.forEach(function(page) {
            page.classList.remove('active');
        });

        var targetPage = pageMap[pageId];
        if (targetPage) {
            var pageEl = document.getElementById(targetPage);
            if (pageEl) pageEl.classList.add('active');
        }

        var allLinks = document.querySelectorAll('.nav-link');
        allLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });

        // Close mobile menu after selection
        closeMenu();

        window.scrollTo(0, 0);
    }

    // Open / close mobile menu
    function openMenu() {
        navLinksEl.classList.add('open');
        hamburger.textContent = 'close';
        menuOpen = true;
    }

    function closeMenu() {
        navLinksEl.classList.remove('open');
        hamburger.textContent = 'menu';
        menuOpen = false;
    }

    hamburger.addEventListener('click', function() {
        if (menuOpen) closeMenu(); else openMenu();
    });

    // Nav link clicks
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
        if (dark) {
            navbar.style.background = '#0A0A10';
            document.body.style.background = '#0F0F14';
            document.body.style.color = '#FFFFFF';
            // Nav name
            document.querySelector('.nav-name').style.color = '#FFFFFF';
            // Title text
            document.querySelectorAll('.page-title, .about-text p:first-of-type').forEach(function(el) {
                el.style.color = '#FFFFFF';
            });
            document.querySelectorAll('.page-subtitle, .about-text p:not(:first-of-type)').forEach(function(el) {
                el.style.color = '#A0A0B0';
            });
            // Hero
            document.querySelector('.hero-name').style.color = '#FFFFFF';
            document.querySelector('.hero-subtitle').style.color = '#A0A0B0';
            document.querySelector('.hero-desc').style.color = '#A0A0B0';
            document.querySelector('.home-hero').style.background =
                'linear-gradient(135deg, #1C1C24, #2A2A35, #363644)';
            // About text paragraphs
            document.querySelectorAll('.about-text p').forEach(function(el) {
                el.style.color = '#A0A0B0';
            });
            // Hamburger color
            hamburger.style.color = '#FFFFFF';
            // Update active nav link
            var activeLink = document.querySelector('.nav-link.active');
            document.querySelectorAll('.nav-link').forEach(function(link) {
                link.style.color = link === activeLink ? '#6366F1' : '#A0A0B0';
            });
            themeToggle.textContent = 'light_mode';
        } else {
            navbar.style.background = '#0F172A';
            document.body.style.background = '#FFFFFF';
            document.body.style.color = '#1E1B4B';
            document.querySelector('.nav-name').style.color = '#F8FAFC';
            document.querySelector('.hero-name').style.color = '';
            document.querySelector('.hero-subtitle').style.color = '';
            document.querySelector('.hero-desc').style.color = '#C7D2FE';
            document.querySelector('.home-hero').style.background = '';
            document.querySelectorAll('.page-title').forEach(function(el) {
                el.style.color = '';
            });
            document.querySelectorAll('.page-subtitle').forEach(function(el) {
                el.style.color = '';
            });
            document.querySelectorAll('.about-text p').forEach(function(el) {
                el.style.color = '';
            });
            hamburger.style.color = '#F8FAFC';
            document.querySelectorAll('.nav-link').forEach(function(link) {
                link.style.color = '';
            });
            // Re-apply active
            var activeLink2 = document.querySelector('.nav-link.active');
            if (activeLink2) {
                activeLink2.style.color = '#A5B4FC';
            }
            themeToggle.textContent = 'dark_mode';
        }
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

    // Set initial active
    var firstLink = document.querySelector('.nav-link.active');
    if (firstLink) firstLink.style.color = '#A5B4FC';

})();
