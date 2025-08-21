// script.js - Revamped and Ready for Deployment

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONFIG ---
    const state = { currentPage: 'home', posts: [], filteredPosts: [], blogCurrentPage: 1, postsPerPage: 6 };

    // --- DOM SELECTORS ---
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const themeToggle = document.getElementById('theme-toggle');
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // --- TEMPLATES ---
    const templates = {
        home: document.getElementById('home-page-template'),
        about: document.getElementById('about-page-template'),
        blog: document.getElementById('blog-page-template'),
        singlePost: document.getElementById('single-post-page-template'),
        contact: document.getElementById('contact-page-template'),
    };

    // --- RENDER FUNCTIONS ---
    const renderPage = () => {
        mainContent.innerHTML = '';
        const [pageId, param] = state.currentPage.split('/');
        let template;

        switch (pageId) {
            case 'home': template = templates.home.content.cloneNode(true); renderHomePage(template); break;
            case 'about': template = templates.about.content.cloneNode(true); renderAboutPage(template); break;
            case 'blog': template = templates.blog.content.cloneNode(true); renderBlogPage(template); break;
            case 'post': template = templates.singlePost.content.cloneNode(true); renderSinglePostPage(template, param); break;
            case 'contact': template = templates.contact.content.cloneNode(true); renderContactPage(template); break;
            default: template = templates.home.content.cloneNode(true); renderHomePage(template);
        }
        mainContent.appendChild(template);
        updateActiveNavLink();
    };

    const renderHomePage = (template) => {
        template.getElementById('hero-name').textContent = config.user.name;
        template.getElementById('hero-tagline').textContent = config.user.tagline;
        template.getElementById('hero-bio').textContent = config.user.shortBio;

        const photoContainer = template.getElementById('hero-photo-container');
        if (config.user.photo) {
            photoContainer.innerHTML = `<img src="${config.user.photo}" alt="${config.user.name}">`;
        }

        const featuredGrid = template.getElementById('featured-posts-grid');
        const featuredPosts = state.posts.filter(p => p.featured).slice(0, 3);
        featuredPosts.forEach(post => featuredGrid.appendChild(createPostCard(post)));
    };
    
    const renderAboutPage = (template) => {
        const photoContainer = template.getElementById('about-photo-container');
        if (config.user.photo) {
            photoContainer.innerHTML = `<img src="${config.user.photo}" alt="${config.user.name}">`;
        }
        template.getElementById('about-bio').innerHTML = config.user.longBio;
        const skillsList = template.getElementById('skills-list');
        config.user.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsList.appendChild(skillTag);
        });
        template.getElementById('resume-link').href = config.user.resumeUrl;
    };

    const renderBlogPage = (template) => {
        const grid = template.getElementById('blog-posts-grid');
        const searchInput = template.getElementById('search-input');
        const categoryFilter = template.getElementById('category-filter');

        const categories = ['All Categories', ...new Set(state.posts.map(p => p.category))];
        categoryFilter.innerHTML = categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('');

        const renderFilteredPosts = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedCategory = categoryFilter.value;
            state.filteredPosts = state.posts
                .filter(p => p.title.toLowerCase().includes(searchTerm) || p.content.toLowerCase().includes(searchTerm))
                .filter(p => selectedCategory === 'all categories' || p.category.toLowerCase() === selectedCategory);
            state.blogCurrentPage = 1;
            renderBlogGrid(grid);
            renderPagination(template.getElementById('pagination-controls'));
        };
        
        searchInput.addEventListener('input', renderFilteredPosts);
        categoryFilter.addEventListener('change', renderFilteredPosts);
        renderFilteredPosts();
    };

    const renderBlogGrid = (grid) => {
        grid.innerHTML = '';
        const startIndex = (state.blogCurrentPage - 1) * state.postsPerPage;
        const paginatedPosts = state.filteredPosts.slice(startIndex, startIndex + state.postsPerPage);
        if (paginatedPosts.length === 0) { grid.innerHTML = '<p>No posts found.</p>'; return; }
        paginatedPosts.forEach(post => grid.appendChild(createPostCard(post)));
    };

    const renderPagination = (container) => {
        container.innerHTML = '';
        const pageCount = Math.ceil(state.filteredPosts.length / state.postsPerPage);
        if (pageCount <= 1) return;
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = (i === state.blogCurrentPage) ? 'active' : '';
            button.addEventListener('click', () => {
                state.blogCurrentPage = i;
                renderBlogGrid(document.getElementById('blog-posts-grid'));
                renderPagination(container);
            });
            container.appendChild(button);
        }
    };

    const renderSinglePostPage = (template, postId) => {
        const post = state.posts.find(p => p._id === postId);
        if (!post) { mainContent.innerHTML = '<p class="container">Post not found.</p>'; return; }

        template.getElementById('post-title').textContent = post.title;
        template.getElementById('post-author').textContent = `By ${post.author}`;
        template.getElementById('post-date').textContent = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        template.getElementById('post-category').textContent = post.category;
        template.getElementById('post-content-full').innerHTML = post.content;

        const imageContainer = template.getElementById('post-image-container');
        if (post.imageUrl) {
            imageContainer.innerHTML = `<img src="${post.imageUrl}" alt="${post.title}">`;
        }
        renderSocialShare(template.getElementById('social-share-buttons'), post);
    };

    const renderContactPage = (template) => {
        const form = template.getElementById('contact-form');
        const feedback = template.getElementById('contact-feedback');
        form.addEventListener('submit', e => {
            e.preventDefault();
            feedback.textContent = "Thank you for your message! I'll get back to you soon.";
            feedback.style.color = 'green';
            form.reset();
        });
    };

    const renderFooter = () => {
        const socialContainer = document.getElementById('footer-social-links');
        const socialMap = {
            linkedin: 'fa-brands fa-linkedin',
            github: 'fa-brands fa-github',
            twitter: 'fa-brands fa-x-twitter', // New X logo
            instagram: 'fa-brands fa-instagram',
        };
        for (const [key, url] of Object.entries(config.social)) {
            if (url && socialMap[key]) {
                socialContainer.innerHTML += `<a href="${url}" target="_blank" aria-label="${key}"><i class="${socialMap[key]}"></i></a>`;
            }
        }
        
        const newsletterForm = document.getElementById('newsletter-form');
        const newsletterFeedback = document.getElementById('newsletter-feedback');
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            newsletterFeedback.textContent = "Thanks for subscribing!";
            newsletterFeedback.style.color = 'green';
            document.getElementById('newsletter-email').value = '';
        });
    };

    // --- HELPER FUNCTIONS ---
    const createPostCard = (post) => {
        const card = document.createElement('article');
        card.className = 'post-card';
        card.innerHTML = `
            ${post.imageUrl ? `<div class="post-card-img"><img src="${post.imageUrl}" alt="${post.title}"></div>` : ''}
            <div class="post-card-content">
                <h3 class="post-card-title">${post.title}</h3>
                <p class="post-card-excerpt">${post.excerpt}</p>
                <a href="#post/${post._id}" class="post-card-link">Read More &rarr;</a>
            </div>
        `;
        return card;
    };

    const renderSocialShare = (container, post) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(post.title);
        container.innerHTML = `
            <a href="https://twitter.com/intent/tweet?url=${url}&text=${text}" target="_blank" aria-label="Share on X"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}" target="_blank" aria-label="Share on LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" aria-label="Share on Facebook"><i class="fa-brands fa-facebook"></i></a>
        `;
    };

    // --- NAVIGATION & ROUTING ---
    const navigate = (hash) => {
        state.currentPage = hash.substring(1) || 'home';
        window.scrollTo(0, 0);
        renderPage();
    };

    const updateActiveNavLink = () => {
        const pageId = state.currentPage.split('/')[0];
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${pageId}`));
    };

    // --- DATA FETCHING ---
    async function loadPosts() {
        try {
            // --- THIS IS THE UPDATED LINE ---
            const response = await fetch('https://blog-backend-1-r9bw.onrender.com/api/posts');
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.posts = await response.json();
            renderPage();
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            mainContent.innerHTML = `<p class="container" style="text-align:center; padding: 4rem 0;">Error loading blog posts. Please ensure the backend server is running and refresh the page.</p>`;
        }
    }

    // --- INITIALIZATION ---
    const init = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        themeToggle.checked = savedTheme === 'dark';
        
        renderFooter();
        
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        document.body.addEventListener('click', e => {
            if (e.target.closest('.nav-link')) {
                navLinksContainer.classList.remove('active');
                window.location.hash = e.target.closest('.nav-link').getAttribute('href');
            }
             if (e.target.closest('.post-card-link')) {
                e.preventDefault();
                window.location.hash = e.target.closest('.post-card-link').getAttribute('href');
            }
        });
        mobileNavToggle.addEventListener('click', () => navLinksContainer.classList.toggle('active'));
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.toggle('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
        });

        loadPosts();
    };

    init();
});