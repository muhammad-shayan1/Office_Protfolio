(function () {
    'use strict';

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----- Custom Cursor -----
    if (!isTouch && !prefersReducedMotion) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (dot) {
                dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            }
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            if (ring) {
                ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateRing);
        }
        requestAnimationFrame(animateRing);

        const hoverSel = 'a, button, .service-card, .team-card, .project-card, .feature-card, .service-list, .stat, input, select, textarea, .team-skills span, .contact-card, .social-row a, .form-group';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverSel) && ring) ring.classList.add('hover');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverSel) && ring) ring.classList.remove('hover');
        });

        document.addEventListener('mouseleave', () => {
            if (dot) dot.style.opacity = '0';
            if (ring) ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            if (dot) dot.style.opacity = '1';
            if (ring) ring.style.opacity = '1';
        });
    }

    // ----- Mobile Navigation -----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navIcon = document.getElementById('navIcon');
    const navbar = document.getElementById('navbar');

    function toggleNav() {
        if (!navLinks) return;
        navLinks.classList.toggle('open');
        if (navIcon) {
            const open = navLinks.classList.contains('open');
            navIcon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
    }
    if (navToggle) navToggle.addEventListener('click', toggleNav);

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (navLinks && navLinks.classList.contains('open')) toggleNav();
        });
    });

    document.addEventListener('click', (e) => {
        if (!navLinks || !navbar) return;
        if (!navbar.contains(e.target) && navLinks.classList.contains('open')) toggleNav();
    });

    // ----- Navbar scrolled state -----
    function onScroll() {
        if (!navbar) return;
        if (window.scrollY > 60) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ----- Smooth scroll with offset -----
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = 75;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    // ----- Active nav on scroll -----
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-link');

    function setActiveLink() {
        const scrollPos = window.scrollY + 120;
        let current = '';
        sections.forEach((s) => {
            if (scrollPos >= s.offsetTop && scrollPos < s.offsetTop + s.offsetHeight) {
                current = s.id;
            }
        });
        allNavLinks.forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
        });
    }
    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();

    // ----- Scroll Reveal (IntersectionObserver) -----
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = Math.min((Array.from(revealEls).indexOf(entry.target) % 6) * 80, 400);
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
        revealEls.forEach((el) => obs.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    // ----- Animated Counters -----
    const counters = document.querySelectorAll('.counter');
    let countersStarted = false;

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const duration = 1800;
        const start = performance.now();

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const val = Math.floor(easeOutExpo(progress) * target);
            el.textContent = val;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }

    function startCountersIfVisible() {
        if (countersStarted) return;
        const first = counters[0];
        if (!first) return;
        const rect = first.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
            countersStarted = true;
            counters.forEach(animateCounter);
        }
    }
    window.addEventListener('scroll', startCountersIfVisible, { passive: true });
    startCountersIfVisible();

    // ----- 3D Tilt Effect -----
    if (!isTouch && !prefersReducedMotion) {
        const tiltEls = document.querySelectorAll('.tilt');
        tiltEls.forEach((el) => {
            let rafId = null;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 10;
                const rotateX = (0.5 - y) * 10;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    el.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    el.style.transition = 'transform 0.05s linear';
                });
            });
            el.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                el.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
                el.style.transform = '';
            });
        });
    }

    // ----- Hero Parallax -----
    if (!prefersReducedMotion) {
        const heroBg = document.querySelector('.hero-bg');
        window.addEventListener('scroll', () => {
            if (!heroBg) return;
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.15}px)`;
            }
        }, { passive: true });
    }

    // ----- Magnetic Buttons -----
    if (!isTouch && !prefersReducedMotion) {
        const magnets = document.querySelectorAll('.magnetic');
        magnets.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);
                el.style.transform = `translate(${x * 0.2}px, ${y * 0.25}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    // ----- Skill stagger -----
    const skillGroups = document.querySelectorAll('.team-skills');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        skillGroups.forEach((group) => {
            const chips = group.querySelectorAll('span');
            chips.forEach((c) => {
                c.style.opacity = '0';
                c.style.transform = 'translateY(10px)';
                c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            });
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        chips.forEach((c, i) => {
                            setTimeout(() => {
                                c.style.opacity = '1';
                                c.style.transform = 'translateY(0)';
                            }, i * 70);
                        });
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(group);
        });
    }

    // ----- Contact form handler -----
    window.handleForm = function (e) {
        if (e) e.preventDefault();
        const form = e && e.target ? e.target : null;
        if (!form) return false;

        const name = form.querySelector('#name')?.value || '';
        const email = form.querySelector('#email')?.value || '';
        const service = form.querySelector('#service')?.value || '';
        const message = form.querySelector('#message')?.value || '';

        const subject = encodeURIComponent(`New Project Inquiry from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nService: ${service || 'Not specified'}\n\nProject Details:\n${message}`
        );
        window.location.href = `mailto:hello@smartgrowth.com?subject=${subject}&body=${body}`;

        alert('Thank you! Your email client has been opened with the message. Alternatively, email us directly at hello@smartgrowth.com or call +92 300 123 4567.');
        return false;
    };

})();
