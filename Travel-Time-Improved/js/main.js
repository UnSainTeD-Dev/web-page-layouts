/** ==================== HEADER NAVIGATION ==================== **/

const navBtn = document.querySelector('.header__nav-btn');
const navList = document.querySelector('.header__nav-list');
const navLinks = document.querySelectorAll('.header__nav-link');

navBtn.addEventListener('click', () => {
    navList.classList.toggle('header__nav-list--active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('header__nav-list--active');
    });
});

/** ==================== HEADER SLIDER ==================== **/

const swiper = new Swiper(".header__slider", {
    effect: "fade",
    pagination: {
        el: ".header__slider .swiper-pagination",
    },
    autoplay: {
        delay: 10000,
        disableOnInteraction: false,
    },
});

/** ==================== CAROUSEL ==================== **/

const track = document.getElementById('gallery-track');
const btnPrev = document.querySelector('.gallery__btn--prev');
const btnNext = document.querySelector('.gallery__btn--next');

const VISIBLE_COUNT = 3;
let currentIndex = 0;

function getImageMetrics() {
    const images = track.querySelectorAll('img');
    if (!images.length) return { images, itemWidth: 0, totalItems: 0, gap: 0 };

    const first = images[0];
    const rect = first.getBoundingClientRect();
    const styles = window.getComputedStyle(first);
    const mr = parseFloat(styles.marginRight) || 0;
    const ml = parseFloat(styles.marginLeft) || 0;
    const gap = mr + ml;
    const itemWidth = rect.width + gap;

    return { images, itemWidth, totalItems: images.length, gap };
}

function hideBtn(btn) {
    if (!btn) return;
    btn.classList.add('hidden');
    btn.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('tabindex', '-1');
    btn.style.display = '';
}

function showBtn(btn) {
    if (!btn) return;
    btn.classList.remove('hidden');
    btn.removeAttribute('aria-hidden');
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('tabindex');
    btn.style.display = '';
}

function updateGallery() {
    const { images, itemWidth, totalItems, gap } = getImageMetrics();
    if (!totalItems || !itemWidth) {
        hideBtn(btnPrev);
        hideBtn(btnNext);
        return;
    }
    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    track.style.width = `${(itemWidth * totalItems) - gap}px`;

    const maxIndex = Math.max(0, totalItems - VISIBLE_COUNT);

    if (totalItems <= VISIBLE_COUNT) {
        hideBtn(btnPrev);
        hideBtn(btnNext);
        return;
    }

    if (currentIndex === 0) {
        hideBtn(btnPrev);
    } else {
        showBtn(btnPrev);
    }

    if (currentIndex >= maxIndex) {
        hideBtn(btnNext);
    } else {
        showBtn(btnNext);
    }
}

btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateGallery();
    }
});

btnNext.addEventListener('click', () => {
    const { totalItems } = getImageMetrics();
    if (currentIndex < Math.max(0, totalItems - VISIBLE_COUNT)) {
        currentIndex++;
        updateGallery();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) { currentIndex--; updateGallery(); }
    } else if (e.key === 'ArrowRight') {
        const { totalItems } = getImageMetrics();
        if (currentIndex < Math.max(0, totalItems - VISIBLE_COUNT)) { currentIndex++; updateGallery(); }
    }
});

window.addEventListener('load', updateGallery);
window.addEventListener('resize', updateGallery);

/** ==================== GALLERY SWIPE ==================== **/

let startX = 0;
let deltaX = 0;

track.addEventListener("touchstart", (e) => {
    if (window.innerWidth > 768) return; // свайпы только на мобилках
    startX = e.touches[0].clientX;
    deltaX = 0;
});

track.addEventListener("touchmove", (e) => {
    if (window.innerWidth > 768) return;
    deltaX = e.touches[0].clientX - startX;
});

track.addEventListener("touchend", () => {
    if (window.innerWidth > 768) return;

    const { totalItems } = getImageMetrics();
    const maxIndex = Math.max(0, totalItems - VISIBLE_COUNT);

    // свайп вправо (движение влево → показать след. изображение)
    if (deltaX < -50 && currentIndex < maxIndex) {
        currentIndex++;
        updateGallery();
    }

    // свайп влево (движение вправо → показать пред. изображение)
    if (deltaX > 50 && currentIndex > 0) {
        currentIndex--;
        updateGallery();
    }
});

/** ==================== GALLERY POP-UP ==================== **/

const popup = document.getElementById('gallery-popup');
const popupImage = document.getElementById('popup-image');
const popupOverlay = document.getElementById('popup-overlay');
const popupClose = document.getElementById('popup-close');

function openPopup(fromImg) {
    popupImage.setAttribute('src', fromImg.currentSrc || fromImg.src);
    popupImage.setAttribute('alt', fromImg.alt || 'Image preview');

    popup.style.display = 'block';
    popup.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => popup.classList.add('show'));
}

function closePopup() {
    popup.classList.remove('show');
    const onTransitionEnd = () => {
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        popup.removeEventListener('transitionend', onTransitionEnd);
    };
    if (getComputedStyle(popup).transitionDuration === '0s') {
        onTransitionEnd();
    } else {
        popup.addEventListener('transitionend', onTransitionEnd);
    }
}

track.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
        openPopup(target);
    }
});

popupOverlay.addEventListener('click', closePopup);
popupClose.addEventListener('click', closePopup);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
});
