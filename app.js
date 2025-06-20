class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 10;
        this.isTransitioning = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeElements() {
        this.slidesContainer = document.getElementById('slidesContainer');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.progressFill = document.getElementById('progressFill');
        
        // Set total slides
        this.totalSlidesSpan.textContent = this.totalSlides;
    }

    setupEventListeners() {
        // Button navigation
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch/Swipe support for mobile
        this.setupTouchEvents();
        
        // Prevent default browser shortcuts that might interfere
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                 e.key === 'ArrowUp' || e.key === 'ArrowDown') && 
                !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
            }
        });
    }

    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        this.slidesContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.slidesContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        // Only handle horizontal swipes that are more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - go to previous slide
                this.previousSlide();
            } else {
                // Swipe left - go to next slide
                this.nextSlide();
            }
        }
    }

    handleKeyPress(e) {
        if (this.isTransitioning) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
            case 'PageDown':
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                this.previousSlide();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                // Could implement fullscreen toggle here
                break;
        }
    }

    nextSlide() {
        if (this.isTransitioning || this.currentSlide >= this.totalSlides) return;
        this.goToSlide(this.currentSlide + 1);
    }

    previousSlide() {
        if (this.isTransitioning || this.currentSlide <= 1) return;
        this.goToSlide(this.currentSlide - 1);
    }

    goToSlide(slideNumber) {
        if (this.isTransitioning || slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide) {
            return;
        }

        this.isTransitioning = true;
        
        // Remove active class from current slide
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
            
            // Add prev class if going forward, or don't add it if going backward
            if (slideNumber > this.currentSlide) {
                currentSlideElement.classList.add('prev');
            }
        }

        // Update current slide number
        this.currentSlide = slideNumber;

        // Add active class to new slide
        const newSlideElement = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
        if (newSlideElement) {
            // Remove prev class in case it was set
            newSlideElement.classList.remove('prev');
            newSlideElement.classList.add('active');
        }

        // Update UI
        this.updateUI();

        // Clean up transition classes after animation
        setTimeout(() => {
            document.querySelectorAll('.slide.prev').forEach(slide => {
                slide.classList.remove('prev');
            });
            this.isTransitioning = false;
        }, 500);
    }

    updateUI() {
        // Update slide counter
        this.currentSlideSpan.textContent = this.currentSlide;
        
        // Update progress bar
        const progressPercentage = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progressPercentage}%`;
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentSlide <= 1;
        this.nextBtn.disabled = this.currentSlide >= this.totalSlides;
        
        // Update document title
        document.title = `GreenGrow Presentation - Slide ${this.currentSlide}/${this.totalSlides}`;
    }

    // Public method to jump to specific slide (could be used for slide thumbnails, etc.)
    jumpToSlide(slideNumber) {
        this.goToSlide(slideNumber);
    }

    // Method to get current slide info
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            title: document.querySelector('.slide.active .slide-title')?.textContent || 'Slide'
        };
    }

    // Method to handle fullscreen toggle (bonus feature)
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Auto-advance functionality (could be useful for auto-play demos)
    startAutoAdvance(intervalMs = 10000) {
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalMs);
    }

    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }

    // Method to add slide transition animations
    addSlideAnimations() {
        // Add entrance animations to slide elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('.problem-item, .component, .impact-metric, .timeline-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Initialize slide content animations
    initSlideAnimations() {
        // Stagger animation for grid items
        const animateElements = (selector, delay = 100) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                el.style.animationDelay = `${index * delay}ms`;
            });
        };

        animateElements('.problem-item', 150);
        animateElements('.impact-metric', 200);
        animateElements('.timeline-item', 100);
    }
}

// Utility functions for presentation enhancements
class PresentationUtils {
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static animateCounter(element, start, end, duration = 2000) {
        const startTime = performance.now();
        const difference = end - start;

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const current = Math.floor(start + (difference * easedProgress));
            element.textContent = current + (element.dataset.suffix || '');

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }

    static highlightText(text, className = 'highlight') {
        return `<span class="${className}">${text}</span>`;
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the main presentation instance
    window.presentation = new PresentationApp();
    
    // Add any additional setup
    setupPresentationEnhancements();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Additional presentation enhancements
function setupPresentationEnhancements() {
    // Add smooth scrolling for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });

    // Add click handlers for metric counters animation
   const metrics = document.querySelectorAll('.metric-number');

metrics.forEach(metric => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const rawValue = entry.target.textContent.replace('%', '').trim();
        const finalValue = parseInt(rawValue, 10);

        entry.target.classList.add('animated');

        // Animate from 0 to finalValue and append %
        PresentationUtils.animateCounter(entry.target, 0, finalValue, 1500, true);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(metric);
});


    // Add budget bar animations
    const budgetBars = document.querySelectorAll('.budget-bar');
    budgetBars.forEach(bar => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'width 1.5s ease-out';
                    entry.target.style.width = `calc(var(--percentage) * 1%)`;
                }
            });
        }, { threshold: 0.5 });
        
        // Initially set width to 0
        bar.style.width = '0%';
        observer.observe(bar);
    });

    // Add focus management for accessibility
    setupAccessibilityFeatures();
}

// Accessibility enhancements
function setupAccessibilityFeatures() {
    // Announce slide changes to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    
    // Update announcer when slide changes
    const originalGoToSlide = window.presentation.goToSlide;
    window.presentation.goToSlide = function(slideNumber) {
        originalGoToSlide.call(this, slideNumber);
        
        setTimeout(() => {
            const slideTitle = document.querySelector('.slide.active .slide-title')?.textContent || 
                             document.querySelector('.slide.active h1')?.textContent || 
                             `Slide ${slideNumber}`;
            announcer.textContent = `Now showing: ${slideTitle}`;
        }, 100);
    };

    // Add keyboard focus indicators
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PresentationApp, PresentationUtils };
}

// ...existing code...

function animateProcessSteps() {
    const slide4 = document.querySelector('.slide[data-slide="4"]');
    if (!slide4) return;
    const steps = slide4.querySelectorAll('.process-step');
    steps.forEach(step => step.classList.remove('visible'));
    steps.forEach((step, i) => {
        setTimeout(() => {
            step.classList.add('visible');
        }, i * 400); // 400ms delay
    });
}

function animateSlide3Blocks() {
    const slide3 = document.querySelector('.slide[data-slide="3"]');
    if (!slide3) return;
    const blocks = slide3.querySelectorAll('.problem-item');
    blocks.forEach(block => block.classList.remove('visible'));
    blocks.forEach((block, i) => {
        setTimeout(() => {
            block.classList.add('visible');
        }, 300 * i); // 300ms delay
    });
}

function animateSlide2Blocks() {
    const slide3 = document.querySelector('.slide[data-slide="2"]');
    if (!slide3) return;
    const blocks = slide3.querySelectorAll('.problem-item');
    blocks.forEach(block => block.classList.remove('visible'));
    blocks.forEach((block, i) => {
        setTimeout(() => {
            block.classList.add('visible');
        }, 300 * i); // 300ms delay
    });
}

function onSlideChange(slideNumber) {
    if (slideNumber === 3) animateSlide3Blocks();
    if (slideNumber === 2) animateSlide2Blocks();
    if (slideNumber === 4) animateProcessSteps();
}

function showSlide(slideNumber) {
    // Hide all slides
    document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));

    // Show the current slide
    const target = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
    if (target) target.classList.add('active');

    // Update slide number display
    document.getElementById('currentSlide').textContent = slideNumber;

    // Call slide change animations
    onSlideChange(slideNumber);
}

// Navigation buttons
document.getElementById('nextBtn').addEventListener('click', () => {
    let current = Number(document.getElementById('currentSlide').textContent);
    if (current < 10) showSlide(current + 1);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    let current = Number(document.getElementById('currentSlide').textContent);
    if (current > 1) showSlide(current - 1);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    let current = Number(document.getElementById('currentSlide').textContent);
    if (e.key === 'ArrowRight' && current < 10) {
        showSlide(current + 1);
    } else if (e.key === 'ArrowLeft' && current > 1) {
        showSlide(current - 1);
    }
});

// On page load
document.addEventListener('DOMContentLoaded', () => {
    let current = Number(document.getElementById('currentSlide').textContent);
    showSlide(current);
});
