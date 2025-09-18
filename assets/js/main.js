// Global animation functions
var cardAnimationSystem = {
  cards: null,
  servicesSection: null,
  isAnimating: false,
  cardStates: {
    hidden: 'hidden',
    visible: 'visible',
    animating: 'animating'
  },
  
  init: function() {
    this.cards = document.querySelectorAll('.card');
    this.servicesSection = document.getElementById('services');
    console.log('Card animation system initialized with', this.cards.length, 'cards');
    this.initializeCards();
  },
  
  initializeCards: function() {
    this.cards.forEach(function (card, index) {
      card.setAttribute('data-card-state', cardAnimationSystem.cardStates.hidden);
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
      card.style.transition = 'none';
      card.style.willChange = 'transform, opacity';
    });
  },
  
  hideCards: function() {
    this.cards.forEach(function (card) {
      card.setAttribute('data-card-state', cardAnimationSystem.cardStates.hidden);
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
      card.style.transition = 'none';
    });
  },
  
  revealCards: function(immediate = false) {
    if (this.isAnimating) {
      console.log('Cards already animating, skipping');
      return;
    }
    console.log('Revealing cards, immediate:', immediate);
    this.isAnimating = true;
    
    this.cards.forEach(function (card, index) {
      card.setAttribute('data-card-state', cardAnimationSystem.cardStates.animating);
      card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      card.style.transitionDelay = immediate ? '0s' : (index * 0.15) + 's';
      
      requestAnimationFrame(function() {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.setAttribute('data-card-state', cardAnimationSystem.cardStates.visible);
      });
    });
    
    // Reset animation state
    setTimeout(function() {
      cardAnimationSystem.isAnimating = false;
      cardAnimationSystem.cards.forEach(function(card) {
        card.style.transition = '';
        card.style.transitionDelay = '';
      });
      console.log('Card animation completed');
    }, 800);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Initialize card animation system
  cardAnimationSystem.init();

  // Set up intersection observer after cards are initialized
  var cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !cardAnimationSystem.isAnimating) {
        console.log('Card intersection detected, revealing cards');
        cardAnimationSystem.revealCards();
        cardObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe cards for scroll-triggered animations
  if (cardAnimationSystem.cards && cardAnimationSystem.cards.length > 0) {
    cardAnimationSystem.cards.forEach(function (card) {
      cardObserver.observe(card);
    });
    console.log('Intersection observer set up for', cardAnimationSystem.cards.length, 'cards');
    
    // Fallback: if cards are already visible on page load, reveal them immediately
    setTimeout(function() {
      var servicesSection = document.getElementById('services');
      if (servicesSection) {
        var rect = servicesSection.getBoundingClientRect();
        var isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible && !cardAnimationSystem.isAnimating) {
          console.log('Services section already visible, revealing cards immediately');
          cardAnimationSystem.revealCards();
        }
      }
    }, 100);
  } else {
    console.log('No cards found for intersection observer');
  }

  // Smooth scroll for same-page links with card animations
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        
        // Check if this is the services link
        if (targetId === 'services') {
          // Add glow effect to services section
          target.classList.add('button-navigated');
          setTimeout(function() {
            target.classList.remove('button-navigated');
          }, 600);
          
          // Hide cards and scroll to services
          cardAnimationSystem.hideCards();
          window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
          
          // Trigger card animations after scroll completes
          setTimeout(function() {
            cardAnimationSystem.revealCards();
          }, 400);
        } else {
          // Regular smooth scroll for other links
        window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
        }
      }
    });
  });

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Typewriter effect for hero with word highlighting
  var el = document.getElementById('typewriter');
  if (el) {
    try {
      var phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
      var speed = 60; // ms per char
      var pause = 1200; // pause at end
      var index = 0;
      var charIndex = 0;
      var deleting = false;
      var highlightWords = ['websites', 'software', 'results'];

      var highlightText = function (text) {
        var words = text.split(' ');
        return words.map(function (word) {
          var cleanWord = word.replace(/[.,!?]/g, '');
          if (highlightWords.includes(cleanWord.toLowerCase())) {
            return '<span class="highlight">' + word + '</span>';
          }
          return word;
        }).join(' ');
      };

      var tick = function () {
        var phrase = phrases[index % phrases.length] || '';
        if (!deleting) {
          charIndex++;
          var currentText = phrase.slice(0, charIndex);
          el.innerHTML = highlightText(currentText);
          if (charIndex === phrase.length) {
            deleting = true;
            setTimeout(tick, pause);
            return;
          }
        } else {
          charIndex--;
          var currentText = phrase.slice(0, charIndex);
          el.innerHTML = highlightText(currentText);
          if (charIndex === 0) {
            deleting = false;
            index++;
          }
        }
        var nextDelay = deleting ? 32 : speed;
        setTimeout(tick, nextDelay);
      };

      if (phrases.length) tick();
    } catch (e) {
      // ignore
    }
  }

  // Theme toggle with persistence and system preference
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var savedTheme = localStorage.getItem('theme');
  var systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  var applyTheme = function (mode) {
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  };

  // Initialize theme
  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
  } else {
    // Follow system by default
    applyTheme(systemPrefersLight ? 'light' : 'dark');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  // React to system changes if user hasn't explicitly set
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onChange = function (e) {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  // Scroll reveal animations (glassy fade-up)
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('[data-reveal]');
    revealEls.forEach(function (node) {
      node.style.opacity = '0';
      node.style.transform = 'translateY(12px)';
      node.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = entry.target;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
          io.unobserve(target);
        }
      });
    }, { threshold: 0.08 });

    revealEls.forEach(function (node) { io.observe(node); });

    // About section animations - integrate with card animation system
    var aboutElements = document.querySelectorAll('.about-card');
    
    // Team section animations - integrate with card animation system
    var teamElements = document.querySelectorAll('.team-card');
    
// Get projects elements for animation
var projectsElements = document.querySelectorAll('.project-screenshot');

// Get contact elements for animation
var contactElements = document.querySelectorAll('.info-card, .contact-form-container');

// Combine about, team, projects, and contact elements for animation
var allCardElements = [...aboutElements, ...teamElements, ...projectsElements, ...contactElements];
    
    allCardElements.forEach(function (element, index) {
      element.setAttribute('data-card-state', 'hidden');
      element.style.opacity = '0';
      element.style.transform = 'translateY(40px) scale(0.95)';
      element.style.transition = 'none';
      element.style.willChange = 'transform, opacity';
    });

    var cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !cardAnimationSystem.isAnimating) {
          var target = entry.target;
          target.setAttribute('data-card-state', 'animating');
          target.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          target.style.transitionDelay = (Array.from(allCardElements).indexOf(target) * 0.15) + 's';
          
          requestAnimationFrame(function() {
            target.style.opacity = '1';
            target.style.transform = 'translateY(0) scale(1)';
            target.setAttribute('data-card-state', 'visible');
          });
          
          cardObserver.unobserve(target);
        }
      });
    }, { threshold: 0.1 });

    allCardElements.forEach(function (element) {
      cardObserver.observe(element);
    });

    // Add interactive effects to all card elements
    allCardElements.forEach(function (element) {
      // Add mouse move parallax effect
      element.addEventListener('mousemove', function (e) {
        if (prefersReduced) return;
        
        var rect = element.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / 15;
        var rotateY = (centerX - x) / 15;
        
        element.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
      });

      element.addEventListener('mouseleave', function () {
        if (prefersReduced) return;
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });

      // Add click ripple effect
      element.addEventListener('click', function (e) {
        if (prefersReduced) return;
        
        var ripple = document.createElement('div');
        var rect = element.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = 'position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none; left: ' + x + 'px; top: ' + y + 'px; width: ' + size + 'px; height: ' + size + 'px;';
        
        element.appendChild(ripple);
        
        setTimeout(function () {
          ripple.remove();
        }, 600);
      });
    });

    
    // Optimized scroll handler for parallax effects
    var scrollHandler = function () {
      if (prefersReduced || cardAnimationSystem.isAnimating) return;
      
      var scrollY = window.scrollY;
      var servicesOffset = cardAnimationSystem.servicesSection ? cardAnimationSystem.servicesSection.offsetTop : 0;
      var aboutSection = document.getElementById('about');
      var aboutOffset = aboutSection ? aboutSection.offsetTop : 0;
      
      // Services section parallax
      var servicesScrollProgress = Math.max(0, Math.min(1, (scrollY - servicesOffset + 300) / 400));
      
      // Only apply parallax to visible cards
      cardAnimationSystem.cards.forEach(function (card) {
        if (card.getAttribute('data-card-state') === cardAnimationSystem.cardStates.visible) {
          var cardOffset = (scrollY - servicesOffset) * 0.05;
          var cardScale = 1 + (servicesScrollProgress * 0.02);
          
          card.style.transform = 'translateY(' + cardOffset + 'px) scale(' + cardScale + ')';
        }
      });
      
      // Services section glow effect
      if (servicesScrollProgress > 0.2) {
        cardAnimationSystem.servicesSection.style.setProperty('--scroll-glow', '0 0 20px rgba(255,255,255,0.08)');
      } else {
        cardAnimationSystem.servicesSection.style.setProperty('--scroll-glow', 'none');
      }
      
      // About section parallax
      if (aboutSection) {
        var aboutScrollProgress = Math.max(0, Math.min(1, (scrollY - aboutOffset + 300) / 400));
        
        // Apply parallax to visible about elements
        aboutElements.forEach(function (element) {
          if (element.getAttribute('data-card-state') === 'visible') {
            var elementOffset = (scrollY - aboutOffset) * 0.03;
            var elementScale = 1 + (aboutScrollProgress * 0.01);
            
            element.style.transform = 'translateY(' + elementOffset + 'px) scale(' + elementScale + ')';
          }
        });
        
        // About section glow effect
        if (aboutScrollProgress > 0.2) {
          aboutSection.style.setProperty('--scroll-glow', '0 0 20px rgba(255,255,255,0.08)');
        } else {
          aboutSection.style.setProperty('--scroll-glow', 'none');
        }
      }
      
      // Team section parallax
      var teamSection = document.getElementById('team');
      var teamOffset = teamSection ? teamSection.offsetTop : 0;
      
      if (teamSection) {
        var teamScrollProgress = Math.max(0, Math.min(1, (scrollY - teamOffset + 300) / 400));
        
        // Apply parallax to visible team elements
        teamElements.forEach(function (element) {
          if (element.getAttribute('data-card-state') === 'visible') {
            var elementOffset = (scrollY - teamOffset) * 0.03;
            var elementScale = 1 + (teamScrollProgress * 0.01);
            
            element.style.transform = 'translateY(' + elementOffset + 'px) scale(' + elementScale + ')';
          }
        });
        
        // Team section glow effect
        if (teamScrollProgress > 0.2) {
          teamSection.style.setProperty('--scroll-glow', '0 0 20px rgba(255,255,255,0.08)');
        } else {
          teamSection.style.setProperty('--scroll-glow', 'none');
        }
      }
      
      // Projects section parallax
      var projectsSection = document.getElementById('projects');
      var projectsOffset = projectsSection ? projectsSection.offsetTop : 0;
      
      if (projectsSection) {
        var projectsScrollProgress = Math.max(0, Math.min(1, (scrollY - projectsOffset + 300) / 400));
        
        // Apply parallax to visible projects elements
        projectsElements.forEach(function (element) {
          if (element.getAttribute('data-card-state') === 'visible') {
            var elementOffset = (scrollY - projectsOffset) * 0.03;
            var elementScale = 1 + (projectsScrollProgress * 0.01);
            
            element.style.transform = 'translateY(' + elementOffset + 'px) scale(' + elementScale + ')';
          }
        });
        
        // Projects section glow effect
        if (projectsScrollProgress > 0.2) {
          projectsSection.style.setProperty('--scroll-glow', '0 0 20px rgba(255,255,255,0.08)');
        } else {
          projectsSection.style.setProperty('--scroll-glow', 'none');
        }
      }
      
      // Contact section parallax
      var contactSection = document.getElementById('contact');
      var contactOffset = contactSection ? contactSection.offsetTop : 0;
      
      if (contactSection) {
        var contactScrollProgress = Math.max(0, Math.min(1, (scrollY - contactOffset + 300) / 400));
        
        // Apply parallax to visible contact elements
        contactElements.forEach(function (element) {
          if (element.getAttribute('data-card-state') === 'visible') {
            var elementOffset = (scrollY - contactOffset) * 0.03;
            var elementScale = 1 + (contactScrollProgress * 0.01);
            
            element.style.transform = 'translateY(' + elementOffset + 'px) scale(' + elementScale + ')';
          }
        });
        
        // Contact section glow effect
        if (contactScrollProgress > 0.2) {
          contactSection.style.setProperty('--scroll-glow', '0 0 20px rgba(255,255,255,0.08)');
        } else {
          contactSection.style.setProperty('--scroll-glow', 'none');
        }
      }
    };

    // Throttled scroll listener
    var scrollTimeout;
    window.addEventListener('scroll', function () {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(scrollHandler, 16);
    });
    
    // Initial call
    scrollHandler();
  }

  // Add interactive card effects
  cardAnimationSystem.cards.forEach(function (card) {
    // Add mouse move parallax effect
    card.addEventListener('mousemove', function (e) {
      if (prefersReduced) return;
      
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / 10;
      var rotateY = (centerX - x) / 10;
      
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
    });

    card.addEventListener('mouseleave', function () {
      if (prefersReduced) return;
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });

    // Add click ripple effect
    card.addEventListener('click', function (e) {
      if (prefersReduced) return;
      
      var ripple = document.createElement('div');
      var rect = card.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = 'position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none; left: ' + x + 'px; top: ' + y + 'px; width: ' + size + 'px; height: ' + size + 'px;';
      
      card.appendChild(ripple);
      
      setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });

  // Add ripple animation keyframes
  var style = document.createElement('style');
  style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
  document.head.appendChild(style);
});


