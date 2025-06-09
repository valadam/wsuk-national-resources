// DOM Elements
const header = document.querySelector('#header');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu li a');
const portfolioNav = document.querySelector('.portfolio-nav');
const portfolioGrid = document.querySelector('.portfolio-grid');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const viewMoreBtn = document.querySelector('.view-more-btn');
const heroSlides = document.querySelectorAll('.hero-slide');

// Constants
const ITEMS_PER_PAGE = 6;
const HEADER_SCROLL_THRESHOLD = 150;
const SLIDESHOW_INTERVAL = 5000;
const OBSERVER_THRESHOLD = 0.5;

// State Management
let currentPage = 1;
let currentCategory = 'all';
let filteredItems = [...portfolioItems];
let currentSlide = 0;

// Navigation and Header
function handleScroll() {
  const scrollPosition = window.pageYOffset;

  if (scrollPosition <= 0) {
    header.style.background = 'transparent';
    header.style.backdropFilter = 'none';
  } else {
    const opacity = Math.min(scrollPosition / HEADER_SCROLL_THRESHOLD, 0.85);
    const blurValue = Math.min((scrollPosition / HEADER_SCROLL_THRESHOLD) * 8, 8);
    header.style.background = `rgba(20, 20, 20, ${opacity})`;
    header.style.backdropFilter = `blur(${blurValue}px)`;
  }
}

// Portfolio Layout and Filtering
function resetGridLayout() {
  portfolioGrid.style.position = 'relative';
  portfolioItems.forEach(item => {
    item.style.display = 'none';
    item.style.position = '';
    item.style.left = '';
    item.style.top = '';
  });
}

function applyMasonryLayout() {
  const columns = window.innerWidth > 768 ? 3 : 2;
  const gridWidth = portfolioGrid.offsetWidth;
  const columnWidth = gridWidth / columns;
  const gap = 10;
  const columnsHeight = Array(columns).fill(0);

  portfolioGrid.style.height = '';

  const visibleItems = Array.from(portfolioItems)
    .filter(item => item.style.display !== 'none');

  visibleItems.forEach(item => {
    const shortestColumn = columnsHeight.indexOf(Math.min(...columnsHeight));

    item.style.position = 'absolute';
    item.style.width = `${columnWidth - (gap / 2)}px`;
    item.style.left = `${(columnWidth * shortestColumn) + (gap / 2)}px`;
    item.style.top = `${columnsHeight[shortestColumn] + (gap / 2)}px`;

    columnsHeight[shortestColumn] += item.offsetHeight + gap;
  });

  portfolioGrid.style.height = `${Math.max(...columnsHeight)}px`;
}

function filterAndDisplayItems() {
  resetGridLayout();

  filteredItems = Array.from(portfolioItems).filter(item =>
    currentCategory === 'all' || item.classList.contains(currentCategory)
  );

  const itemsToShow = filteredItems.slice(0, currentPage * ITEMS_PER_PAGE);
  itemsToShow.forEach(item => item.style.display = 'block');

  viewMoreBtn.style.display = filteredItems.length > currentPage * ITEMS_PER_PAGE ? 'block' : 'none';

  setTimeout(applyMasonryLayout, 100);
}

// Portfolio Modal
function initializePortfolioModal() {
  const modalHTML = `
        <div class="portfolio-modal" style="display: none;">
            <div class="modal-content">
                <img src="" alt="Full size image">
                <button class="modal-close">&times;</button>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.querySelector('.portfolio-modal');
  const modalImg = modal.querySelector('img');
  const closeBtn = modal.querySelector('.modal-close');

  function openModal(imgSrc) {
    modalImg.src = imgSrc;
    modal.style.display = 'block';
    modal.classList.add('fade-in');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('fade-out');
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.remove('fade-out', 'fade-in');
      document.body.style.overflow = '';
    }, 300);
  }

  // Event Listeners for Modal
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target !== modalImg) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Setup Portfolio Item Click Handlers
  portfolioItems.forEach(item => {
    const link = item.querySelector('a');
    link.addEventListener('click', e => {
      e.preventDefault();
      openModal(link.href);
    });
  });
}

// Hero Slideshow
function initializeSlideshow() {
  heroSlides.forEach(slide => slide.classList.remove('active'));
  heroSlides[currentSlide].classList.add('active');
}

function changeSlide() {
  heroSlides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % heroSlides.length;
  heroSlides[currentSlide].classList.add('active');
}

// Intersection Observer for Navigation
const observerOptions = { threshold: OBSERVER_THRESHOLD };
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, observerOptions);

// Event Listeners
function initializeEventListeners() {
  window.addEventListener('scroll', handleScroll);

  portfolioNav.addEventListener('click', e => {
    if (e.target.classList.contains('nav-link')) {
      document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      currentPage = 1;
      filterAndDisplayItems();
    }
  });

  viewMoreBtn.addEventListener('click', () => {
    currentPage++;
    filterAndDisplayItems();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyMasonryLayout, 250);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      document.getElementById(targetId).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  portfolioItems.forEach(item => {
    const img = item.querySelector('img');
    if (img && !img.complete) {
      img.addEventListener('load', applyMasonryLayout);
    }
  });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializePortfolioModal();
  initializeSlideshow();
  filterAndDisplayItems();
  sections.forEach(section => observer.observe(section));
  setInterval(changeSlide, SLIDESHOW_INTERVAL);
});